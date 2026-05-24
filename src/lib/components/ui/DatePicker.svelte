<!-- src/lib/components/ui/DatePicker.svelte -->
<script lang="ts">
    import { untrack } from 'svelte';
    import { IconChevronLeft, IconChevronRight, IconCalendar } from '@tabler/icons-svelte';

    interface Props {
        value?: string;
        defaultDate?: string;
        minDate?: string;
        maxDate?: string;
        displayFormat?: string;
        disabled?: boolean;
        placeholder?: string;
        id?: string;
        class?: string;
    }

    let {
        value        = $bindable(''),
        defaultDate,
        minDate,
        maxDate,
        displayFormat = 'DD/MM/YYYY',
        disabled      = false,
        placeholder   = 'Seleccionar fecha',
        id,
        class: className = ''
    }: Props = $props();

    // ── Locale data ────────────────────────────────────────────────────────────
    const MONTHS = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const MONTHS_SHORT = [
        'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];
    const WEEKDAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

    // ── Helpers ────────────────────────────────────────────────────────────────
    function todayStr(): string {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    function parseDate(str: string | null | undefined): { year: number; month: number; day: number } | null {
        if (!str || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;
        const [y, m, d] = str.split('-').map(Number);
        return { year: y, month: m - 1, day: d };
    }

    function toDateStr(year: number, month: number, day: number): string {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    // Regex-based format so longer tokens are consumed first, preventing
    // partial replacements (e.g. 'M' matching inside an already-placed 'Mayo').
    function formatDisplay(dateStr: string): string {
        const p = parseDate(dateStr);
        if (!p) return '';
        const { year, month, day } = p;
        return displayFormat.replace(/MMMM|MMM|MM|M|YYYY|YY|DD|D/g, (t) => {
            switch (t) {
                case 'MMMM': return MONTHS[month];
                case 'MMM':  return MONTHS_SHORT[month];
                case 'MM':   return String(month + 1).padStart(2, '0');
                case 'M':    return String(month + 1);
                case 'YYYY': return String(year);
                case 'YY':   return String(year).slice(-2);
                case 'DD':   return String(day).padStart(2, '0');
                case 'D':    return String(day);
                default:     return t;
            }
        });
    }

    // ── State ──────────────────────────────────────────────────────────────────
    const TODAY = todayStr();

    const initParsed = parseDate(untrack(() => value || defaultDate || TODAY))
        ?? { year: new Date().getFullYear(), month: new Date().getMonth(), day: 1 };

    let open           = $state(false);
    let viewMode       = $state<'day' | 'month' | 'year'>('day');
    let viewYear       = $state(initParsed.year);
    let viewMonth      = $state(initParsed.month); // 0-11
    let yearRangeStart = $state(Math.floor(initParsed.year / 12) * 12);
    let popupStyle     = $state('');

    let triggerEl: HTMLButtonElement | undefined = $state();
    let popupEl:   HTMLDivElement    | undefined = $state();

    // ── Derived: calendar grid ─────────────────────────────────────────────────
    interface CalendarDay {
        dateStr: string;
        day: number;
        isCurrentMonth: boolean;
        isSelected: boolean;
        isToday: boolean;
        disabled: boolean;
    }

    const calendarDays = $derived.by((): CalendarDay[] => {
        const days: CalendarDay[] = [];

        // Monday-first grid: Sun (JS 0) maps to position 6, Mon→0 … Sat→5
        const firstDOW    = new Date(viewYear, viewMonth, 1).getDay();
        const padBefore   = firstDOW === 0 ? 6 : firstDOW - 1;
        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

        const prevMI     = viewMonth === 0 ? 11 : viewMonth - 1;
        const prevY      = viewMonth === 0 ? viewYear - 1 : viewYear;
        const daysInPrev = new Date(prevY, prevMI + 1, 0).getDate();

        // Trailing days of previous month
        for (let i = padBefore - 1; i >= 0; i--) {
            const d  = daysInPrev - i;
            const ds = toDateStr(prevY, prevMI, d);
            days.push({ dateStr: ds, day: d, isCurrentMonth: false, isSelected: false, isToday: false, disabled: true });
        }

        // Current month
        for (let d = 1; d <= daysInMonth; d++) {
            const ds = toDateStr(viewYear, viewMonth, d);
            days.push({
                dateStr: ds,
                day: d,
                isCurrentMonth: true,
                isSelected: ds === value,
                isToday:    ds === TODAY,
                disabled:   (!!minDate && ds < minDate) || (!!maxDate && ds > maxDate)
            });
        }

        // Leading days of next month (fill to complete last week row)
        const nextMI     = viewMonth === 11 ? 0 : viewMonth + 1;
        const nextY      = viewMonth === 11 ? viewYear + 1 : viewYear;
        const totalCells = Math.ceil((padBefore + daysInMonth) / 7) * 7;
        const padAfter   = totalCells - padBefore - daysInMonth;

        for (let d = 1; d <= padAfter; d++) {
            const ds = toDateStr(nextY, nextMI, d);
            days.push({ dateStr: ds, day: d, isCurrentMonth: false, isSelected: false, isToday: false, disabled: true });
        }

        return days;
    });

    // Precomputed year list for the year-range grid — only changes when yearRangeStart changes
    const yearRange = $derived(Array.from({ length: 12 }, (_, i) => yearRangeStart + i));

    // Parsed form of the currently selected value (null when empty)
    const selectedParsed = $derived(parseDate(value));

    // ── Derived: navigation guards ─────────────────────────────────────────────
    // Day view: prev/next month
    const canGoPrev = $derived.by(() => {
        if (!minDate) return true;
        const m = parseDate(minDate);
        if (!m) return true;
        return viewYear > m.year || (viewYear === m.year && viewMonth > m.month);
    });

    const canGoNext = $derived.by(() => {
        if (!maxDate) return true;
        const m = parseDate(maxDate);
        if (!m) return true;
        return viewYear < m.year || (viewYear === m.year && viewMonth < m.month);
    });

    // Month view: prev/next year
    const canGoPrevYear = $derived.by(() => {
        if (!minDate) return true;
        const m = parseDate(minDate);
        if (!m) return true;
        return viewYear > m.year;
    });

    const canGoNextYear = $derived.by(() => {
        if (!maxDate) return true;
        const m = parseDate(maxDate);
        if (!m) return true;
        return viewYear < m.year;
    });

    // Year view: prev/next 12-year range
    const canGoPrevYearRange = $derived.by(() => {
        if (!minDate) return true;
        const m = parseDate(minDate);
        if (!m) return true;
        return yearRangeStart > m.year;
    });

    const canGoNextYearRange = $derived.by(() => {
        if (!maxDate) return true;
        const m = parseDate(maxDate);
        if (!m) return true;
        return yearRangeStart + 11 < m.year;
    });

    const displayValue = $derived(value ? formatDisplay(value) : '');

    // ── Disabled checks ────────────────────────────────────────────────────────
    function isMonthDisabled(mi: number): boolean {
        if (minDate) {
            const lastDay = toDateStr(viewYear, mi, new Date(viewYear, mi + 1, 0).getDate());
            if (lastDay < minDate) return true;
        }
        if (maxDate) {
            const firstDay = toDateStr(viewYear, mi, 1);
            if (firstDay > maxDate) return true;
        }
        return false;
    }

    function isYearDisabled(year: number): boolean {
        if (minDate) {
            const lastDay = toDateStr(year, 11, 31);
            if (lastDay < minDate) return true;
        }
        if (maxDate) {
            const firstDay = toDateStr(year, 0, 1);
            if (firstDay > maxDate) return true;
        }
        return false;
    }

    // ── Navigation ─────────────────────────────────────────────────────────────
    function prevMonth() {
        if (!canGoPrev) return;
        if (viewMonth === 0) { viewMonth = 11; viewYear--; } else viewMonth--;
    }

    function nextMonth() {
        if (!canGoNext) return;
        if (viewMonth === 11) { viewMonth = 0; viewYear++; } else viewMonth++;
    }

    function prevYear() {
        if (!canGoPrevYear) return;
        viewYear--;
    }

    function nextYear() {
        if (!canGoNextYear) return;
        viewYear++;
    }

    function prevYearRange() {
        if (!canGoPrevYearRange) return;
        yearRangeStart -= 12;
    }

    function nextYearRange() {
        if (!canGoNextYearRange) return;
        yearRangeStart += 12;
    }

    // ── Selection ──────────────────────────────────────────────────────────────
    function selectDay(day: CalendarDay) {
        if (day.disabled) return;
        value = day.dateStr;
        open  = false;
    }

    function selectMonth(mi: number) {
        if (isMonthDisabled(mi)) return;
        viewMonth = mi;
        viewMode  = 'day';
    }

    function selectYear(year: number) {
        if (isYearDisabled(year)) return;
        viewYear       = year;
        yearRangeStart = Math.floor(year / 12) * 12;
        viewMode       = 'month';
    }

    // ── Open / close ───────────────────────────────────────────────────────────
    function handleTriggerClick() {
        if (disabled) return;
        if (open) { open = false; return; }

        // Calculate fixed-position coordinates so the popup escapes
        // any overflow:hidden/auto ancestor (e.g. a scrollable modal body).
        if (triggerEl) {
            const rect      = triggerEl.getBoundingClientRect();
            const popupW    = 288; // w-72
            const popupH    = 320;
            const left      = Math.max(8, Math.min(rect.left, window.innerWidth - popupW - 8));
            const fitsBelow = window.innerHeight - rect.bottom >= popupH;
            const top       = fitsBelow ? rect.bottom + 4 : rect.top - popupH - 4;
            popupStyle = `top:${top}px;left:${left}px;`;
        }

        // Sync view to current value (or reference date) when opening
        const ref = value || defaultDate || TODAY;
        const p   = parseDate(ref);
        if (p) { viewYear = p.year; viewMonth = p.month; }

        viewMode = 'day';
        open     = true;
    }

    // Close on outside mousedown; only registers while popup is open.
    $effect(() => {
        if (!open) return;
        const onMousedown = (e: MouseEvent) => {
            const t = e.target as Node;
            if (triggerEl?.contains(t) || popupEl?.contains(t)) return;
            open = false;
        };
        document.addEventListener('mousedown', onMousedown);
        return () => document.removeEventListener('mousedown', onMousedown);
    });

    // Close on Escape; only registers while popup is open.
    $effect(() => {
        if (!open) return;
        const onKeydown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { e.stopPropagation(); open = false; }
        };
        window.addEventListener('keydown', onKeydown);
        return () => window.removeEventListener('keydown', onKeydown);
    });

    // ── Shared CSS fragments ───────────────────────────────────────────────────
    const navBtn =
        'flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg ' +
        'text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900 ' +
        'disabled:cursor-default disabled:opacity-25 ' +
        'dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-stone-50';

    const headerBtn =
        'cursor-pointer rounded-md px-2 py-0.5 text-sm font-semibold ' +
        'text-stone-900 transition-colors hover:bg-stone-100 ' +
        'dark:text-stone-50 dark:hover:bg-stone-700';

    function gridBtnCls(selected: boolean, dis: boolean): string {
        if (selected) return 'bg-teal-500 font-medium text-white hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700';
        if (dis)      return 'cursor-default text-stone-300 dark:text-stone-600';
        return 'cursor-pointer text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-700';
    }
</script>

<!-- Trigger ------------------------------------------------------------------>
<button
    type="button"
    bind:this={triggerEl}
    {id}
    onclick={handleTriggerClick}
    {disabled}
    aria-haspopup="dialog"
    aria-expanded={open}
    class="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border
           px-3 py-2 text-left text-sm transition-colors
           focus:outline-none focus:ring-2 focus:ring-teal-500/20
           disabled:cursor-not-allowed disabled:opacity-50
           {className || 'border-stone-200 bg-white focus:border-teal-500 dark:border-stone-700 dark:bg-stone-900'}"
>
    <span class={displayValue ? 'text-stone-900 dark:text-stone-50' : 'text-stone-400 dark:text-stone-600'}>
        {displayValue || placeholder}
    </span>
    <IconCalendar size={16} class="shrink-0 text-stone-400" aria-hidden="true" />
</button>

<!-- Popup (fixed so it escapes overflow clipping) ---------------------------->
{#if open}
    <div
        bind:this={popupEl}
        role="dialog"
        aria-label="Selector de fecha"
        style={popupStyle}
        class="fixed z-[100] w-72 rounded-xl border border-stone-200 bg-white p-3
               shadow-2xl dark:border-stone-700 dark:bg-stone-800"
    >
        {#if viewMode === 'day'}
            <!-- ── Day view ──────────────────────────────────────────────────── -->
            <div class="mb-3 flex items-center justify-between">
                <button type="button" onclick={prevMonth} disabled={!canGoPrev} aria-label="Mes anterior" class={navBtn}>
                    <IconChevronLeft size={14} aria-hidden="true" />
                </button>

                <!-- Clicking the header enters month view -->
                <button type="button" onclick={() => (viewMode = 'month')} class={headerBtn}>
                    {MONTHS[viewMonth]} {viewYear}
                </button>

                <button type="button" onclick={nextMonth} disabled={!canGoNext} aria-label="Mes siguiente" class={navBtn}>
                    <IconChevronRight size={14} aria-hidden="true" />
                </button>
            </div>

            <!-- Weekday headers -->
            <div class="mb-1 grid grid-cols-7">
                {#each WEEKDAYS as wd (wd)}
                    <div class="py-0.5 text-center text-xs font-medium text-stone-400 dark:text-stone-500">
                        {wd}
                    </div>
                {/each}
            </div>

            <!-- Day grid -->
            <div class="grid grid-cols-7 gap-px">
                {#each calendarDays as day (day.dateStr)}
                    <button
                        type="button"
                        onclick={() => selectDay(day)}
                        disabled={day.disabled}
                        aria-label={day.dateStr}
                        aria-pressed={day.isSelected}
                        class="flex h-8 w-full items-center justify-center rounded-full text-sm
                               transition-colors
                               {day.isSelected
                                 ? 'bg-teal-500 font-medium text-white hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700'
                                 : !day.isCurrentMonth || day.disabled
                                 ? 'cursor-default text-stone-300 dark:text-stone-600'
                                 : day.isToday
                                 ? 'cursor-pointer font-semibold text-teal-600 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-900/30'
                                 : 'cursor-pointer text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-700'}"
                    >
                        {day.day}
                    </button>
                {/each}
            </div>

        {:else if viewMode === 'month'}
            <!-- ── Month view ────────────────────────────────────────────────── -->
            <div class="mb-3 flex items-center justify-between">
                <button type="button" onclick={prevYear} disabled={!canGoPrevYear} aria-label="Año anterior" class={navBtn}>
                    <IconChevronLeft size={14} aria-hidden="true" />
                </button>

                <!-- Clicking the year header enters year view -->
                <button
                    type="button"
                    onclick={() => { yearRangeStart = Math.floor(viewYear / 12) * 12; viewMode = 'year'; }}
                    class={headerBtn}
                >
                    {viewYear}
                </button>

                <button type="button" onclick={nextYear} disabled={!canGoNextYear} aria-label="Año siguiente" class={navBtn}>
                    <IconChevronRight size={14} aria-hidden="true" />
                </button>
            </div>

            <div class="grid grid-cols-3 gap-1">
                {#each MONTHS_SHORT as name, mi (name)}
                    {@const sel = selectedParsed?.year === viewYear && selectedParsed?.month === mi}
                    {@const dis = isMonthDisabled(mi)}
                    <button
                        type="button"
                        onclick={() => selectMonth(mi)}
                        disabled={dis}
                        class="rounded-lg py-2 text-sm transition-colors {gridBtnCls(sel, dis)}"
                    >
                        {name}
                    </button>
                {/each}
            </div>

        {:else}
            <!-- ── Year view ─────────────────────────────────────────────────── -->
            <div class="mb-3 flex items-center justify-between">
                <button type="button" onclick={prevYearRange} disabled={!canGoPrevYearRange} aria-label="Rango anterior" class={navBtn}>
                    <IconChevronLeft size={14} aria-hidden="true" />
                </button>

                <span class="text-sm font-semibold text-stone-900 dark:text-stone-50">
                    {yearRangeStart}–{yearRangeStart + 11}
                </span>

                <button type="button" onclick={nextYearRange} disabled={!canGoNextYearRange} aria-label="Rango siguiente" class={navBtn}>
                    <IconChevronRight size={14} aria-hidden="true" />
                </button>
            </div>

            <div class="grid grid-cols-3 gap-1">
                {#each yearRange as year (year)}
                    {@const sel = selectedParsed?.year === year}
                    {@const dis = isYearDisabled(year)}
                    <button
                        type="button"
                        onclick={() => selectYear(year)}
                        disabled={dis}
                        class="rounded-lg py-2 text-sm transition-colors {gridBtnCls(sel, dis)}"
                    >
                        {year}
                    </button>
                {/each}
            </div>
        {/if}
    </div>
{/if}

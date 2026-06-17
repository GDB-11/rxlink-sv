<script lang="ts">
    import { page } from '$app/state';
    import { ConsultationRoomPage } from '$lib/features/doctor-consultations';
</script>

<svelte:head><title>Consulta — RxLink</title></svelte:head>
<ConsultationRoomPage appointmentCode={page.params.appointmentCode!} />

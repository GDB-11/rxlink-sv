<!-- src/lib/features/auth/components/LoginForm.svelte -->

<script lang="ts">
	import { goto }              from '$app/navigation';
	import { authApi, ApiError } from '$lib/api/authApi';
	import { auth }              from '$lib/features/auth';
	import ErrorAlert            from '$lib/components/ui/ErrorAlert.svelte';
	import PasswordField         from '$lib/components/ui/PasswordField.svelte';
	import SubmitButton          from '$lib/components/ui/SubmitButton.svelte';
	import UsernameField         from '$lib/components/ui/UsernameField.svelte';
	import LoginFormHeading      from './LoginFormHeading.svelte';

	let username  = $state('');
	let password  = $state('');
	let isLoading = $state(false);
	let error     = $state<string | null>(null);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();

		if (!username.trim() || !password.trim()) {
			error = 'Por favor ingrese su usuario y contraseña.';
			return;
		}

		isLoading = true;
		error = null;

		try {
			const data = await authApi.login(username.trim(), password);
			auth.login(data);
			await goto('/');
		} catch (err) {
			if (err instanceof ApiError) {
				error = err.message || 'Error al iniciar sesión. Intente nuevamente.';
			} else {
				error = 'Error de conexión. Verifique su red e intente nuevamente.';
			}
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="w-full max-w-88">
	<LoginFormHeading />

	<form onsubmit={handleSubmit} novalidate class="space-y-5">
		<ErrorAlert message={error} />

		<UsernameField bind:value={username} disabled={isLoading} />

		<PasswordField bind:value={password} disabled={isLoading} />

		<SubmitButton
			{isLoading}
			label="Iniciar sesión"
			loadingLabel="Iniciando sesión…"
		/>
	</form>

	<p class="mt-8 text-center text-xs text-stone-400 dark:text-stone-600 leading-relaxed">
		Acceso exclusivo para personal autorizado de la clínica.
		<br />Para asistencia técnica, contacte a su administrador.
	</p>
</div>
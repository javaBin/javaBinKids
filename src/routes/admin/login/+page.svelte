<script lang="ts">
	import { goto } from '$app/navigation';

	let username = $state('');
	let password = $state('');
	let errorMsg = $state('');
	let submitting = $state(false);

	async function handleLogin(e: SubmitEvent) {
		e.preventDefault();
		submitting = true;
		errorMsg = '';

		try {
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, password })
			});

			if (!res.ok) {
				errorMsg = 'Feil brukernavn eller passord';
			} else {
				goto('/admin');
			}
		} catch {
			errorMsg = 'Noe gikk galt. Prøv igjen.';
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>Admin — javaBin Kids</title>
</svelte:head>

<div class="container login-page">
	<div class="login-card card">
		<h1>Admin</h1>

		{#if errorMsg}
			<div class="error-banner">{errorMsg}</div>
		{/if}

		<form onsubmit={handleLogin}>
			<div class="form-group">
				<label for="username">Brukernavn</label>
				<input id="username" bind:value={username} required autocomplete="username" />
			</div>

			<div class="form-group">
				<label for="password">Passord</label>
				<input id="password" type="password" bind:value={password} required autocomplete="current-password" />
			</div>

			<button type="submit" class="btn btn-primary" disabled={submitting}>
				{submitting ? 'Logger inn...' : 'Logg inn'}
			</button>
		</form>
	</div>
</div>

<style>
	.login-page {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: calc(100vh - 200px);
		padding: 2rem 1.5rem;
	}

	.login-card {
		width: 100%;
		max-width: 400px;
		padding: 2rem;
	}

	.login-card h1 {
		text-align: center;
		margin-bottom: 1.5rem;
	}

	.error-banner {
		background: rgba(231, 76, 60, 0.15);
		border: 1px solid var(--color-error);
		border-radius: var(--radius);
		padding: 0.8rem;
		color: var(--color-error);
		margin-bottom: 1rem;
		text-align: center;
	}

	button {
		width: 100%;
	}
</style>

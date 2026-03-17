<script lang="ts">
	import type { PageData } from './$types';
	let { data, form }: { data: PageData; form: any } = $props();
</script>

<svelte:head>
	<title>Avmelding — javaBin Kids</title>
</svelte:head>

<div class="container page">
	{#if form?.success}
		<div class="result-card card">
			<h1>Avmeldt</h1>
			<p>{data.registration.childName} er nå avmeldt fra <strong>{data.courseTitle}</strong>.</p>
			<p class="muted">En bekreftelse er sendt på e-post.</p>
			<a href="/" class="btn btn-outline">Tilbake til forsiden</a>
		</div>
	{:else if data.registration.status === 'cancelled'}
		<div class="result-card card">
			<h1>Allerede avmeldt</h1>
			<p>{data.registration.childName} er allerede avmeldt fra <strong>{data.courseTitle}</strong>.</p>
			<a href="/" class="btn btn-outline">Tilbake til forsiden</a>
		</div>
	{:else}
		<div class="result-card card">
			<h1>Bekreft avmelding</h1>
			<p>
				Er du sikker på at du vil melde av <strong>{data.registration.childName}</strong>
				fra <strong>{data.courseTitle}</strong> ({data.eventTitle})?
			</p>
			<form method="POST">
				<input type="hidden" name="token" value={data.token} />
				<div class="button-row">
					<button type="submit" class="btn btn-primary">Ja, meld av</button>
					<a href="/" class="btn btn-outline">Avbryt</a>
				</div>
			</form>
		</div>
	{/if}
</div>

<style>
	.page {
		padding: 6rem 1.5rem;
		display: flex;
		justify-content: center;
	}

	.result-card {
		max-width: 500px;
		text-align: center;
		padding: 2.5rem;
	}

	.result-card h1 {
		margin-bottom: 1rem;
	}

	.result-card p {
		color: var(--color-text-muted);
		margin-bottom: 0.5rem;
	}

	.muted {
		font-size: 0.9rem;
	}

	.button-row {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin-top: 1.5rem;
	}

	.btn { margin-top: 1rem; }
</style>

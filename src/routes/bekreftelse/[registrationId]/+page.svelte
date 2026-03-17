<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();

	const eventDateStr = $derived(new Date(data.event.date).toLocaleDateString('nb-NO', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	}));
</script>

<svelte:head>
	<title>Bekreftelse — javaBin Kids</title>
</svelte:head>

<div class="container page">
	<div class="confirmation-card card">
		{#if data.registration.status === 'confirmed'}
			<span class="badge badge-success">Bekreftet</span>
		{:else if data.registration.status === 'waitlisted'}
			<span class="badge badge-warning">Venteliste (posisjon {data.registration.waitlistPosition})</span>
		{:else}
			<span class="badge badge-error">Avmeldt</span>
		{/if}

		<h1>{data.registration.childName}</h1>
		<p class="subtitle">{data.course.title}</p>

		<div class="details">
			<div class="detail-row">
				<span class="label">Arrangement</span>
				<span>{data.event.title}</span>
			</div>
			<div class="detail-row">
				<span class="label">Dato</span>
				<span>{eventDateStr}</span>
			</div>
			<div class="detail-row">
				<span class="label">Sted</span>
				<span>{data.event.location}</span>
			</div>
			<div class="detail-row">
				<span class="label">Barnets alder</span>
				<span>{data.registration.childAge} år</span>
			</div>
			<div class="detail-row">
				<span class="label">Foresatt</span>
				<span>{data.registration.parentName}</span>
			</div>
			<div class="detail-row">
				<span class="label">E-post</span>
				<span>{data.registration.parentEmail}</span>
			</div>
		</div>

		<a href="/" class="btn btn-outline">Tilbake til forsiden</a>
	</div>
</div>

<style>
	.page {
		padding: 4rem 1.5rem;
		display: flex;
		justify-content: center;
	}

	.confirmation-card {
		max-width: 500px;
		width: 100%;
		text-align: center;
		padding: 2.5rem;
	}

	.confirmation-card h1 {
		margin: 1rem 0 0.25rem;
	}

	.subtitle {
		color: var(--color-accent);
		font-size: 1.1rem;
		margin-bottom: 1.5rem;
	}

	.details {
		text-align: left;
		margin-bottom: 1.5rem;
	}

	.detail-row {
		display: flex;
		justify-content: space-between;
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--color-border);
		font-size: 0.9rem;
	}

	.label {
		color: var(--color-text-muted);
	}
</style>

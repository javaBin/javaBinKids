<script lang="ts">
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';
	import { toast } from '$lib/toast.svelte';

	let { data }: { data: PageData } = $props();
	let showForm = $state(false);
	let title = $state('');
	let description = $state('');
	let date = $state('');
	let location = $state('');
	let registrationOpens = $state('');
	let registrationCloses = $state('');
	let submitting = $state(false);

	async function createEvent(e: SubmitEvent) {
		e.preventDefault();
		submitting = true;

		const res = await fetch('/api/events', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				event: {
					title,
					description,
					date: new Date(date).toISOString(),
					location,
					registrationOpens: new Date(registrationOpens).toISOString(),
					registrationCloses: new Date(registrationCloses).toISOString()
				}
			})
		});

		if (res.ok) {
			showForm = false;
			title = description = date = location = registrationOpens = registrationCloses = '';
			toast.show('Arrangement opprettet');
			invalidateAll();
		} else {
			toast.show('Kunne ikke opprette arrangement', 'error');
		}

		submitting = false;
	}
</script>

<div class="header-row">
	<h1>Arrangementer</h1>
	<button class="btn btn-primary" onclick={() => showForm = !showForm}>
		{showForm ? 'Avbryt' : 'Nytt arrangement'}
	</button>
</div>

{#if showForm}
	<form class="card form-card" onsubmit={createEvent}>
		<div class="form-group">
			<label for="title">Tittel</label>
			<input id="title" bind:value={title} required />
		</div>
		<div class="form-group">
			<label for="description">Beskrivelse</label>
			<textarea id="description" bind:value={description} rows="3" required></textarea>
		</div>
		<div class="form-row">
			<div class="form-group">
				<label for="date">Dato</label>
				<input id="date" type="datetime-local" bind:value={date} required />
			</div>
			<div class="form-group">
				<label for="location">Sted</label>
				<input id="location" bind:value={location} required />
			</div>
		</div>
		<div class="form-row">
			<div class="form-group">
				<label for="regOpens">Påmelding åpner</label>
				<input id="regOpens" type="datetime-local" bind:value={registrationOpens} required />
			</div>
			<div class="form-group">
				<label for="regCloses">Påmelding stenger</label>
				<input id="regCloses" type="datetime-local" bind:value={registrationCloses} required />
			</div>
		</div>
		<button type="submit" class="btn btn-primary" disabled={submitting}>Opprett</button>
	</form>
{/if}

<div class="events-list">
	{#each data.events as event}
		<a href="/admin/arrangementer/{event.arrangementId}" class="card event-row">
			<div>
				<strong>{event.title}</strong>
				<span class="date">{new Date(event.date).toLocaleDateString('nb-NO')}</span>
			</div>
			{#if event.cancelled}
				<span class="badge badge-error">Avlyst</span>
			{:else if new Date(event.date) >= new Date()}
				<span class="badge badge-success">Kommende</span>
			{:else}
				<span class="badge badge-warning">Gjennomført</span>
			{/if}
		</a>
	{/each}
</div>

<style>
	.header-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.form-card {
		margin-bottom: 2rem;
		padding: 1.5rem;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.events-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.event-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		text-decoration: none;
		color: inherit;
	}

	.date {
		color: var(--color-text-muted);
		margin-left: 1rem;
		font-size: 0.9rem;
	}
</style>

<script lang="ts">
	interface Props {
		event: {
			arrangementId: string;
			title: string;
			descriptionHtml: string;
			date: Date;
			location: string;
			cancelled: boolean;
		};
	}

	let { event }: Props = $props();

	const dateStr = $derived(new Date(event.date).toLocaleDateString('nb-NO', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	}));

	const isPast = $derived(new Date(event.date) < new Date());
</script>

<a href="/arrangementer/{event.arrangementId}" class="card event-card">
	{#if event.cancelled}
		<span class="badge badge-error">Avlyst</span>
	{:else if isPast}
		<span class="badge badge-warning">Gjennomført</span>
	{:else}
		<span class="badge badge-success">Kommende</span>
	{/if}
	<h3>{event.title}</h3>
	<p class="event-meta">{dateStr} — {event.location}</p>
	<div class="event-desc">{@html event.descriptionHtml}</div>
</a>

<style>
	.event-card { display: block; text-decoration: none; color: inherit; }
	.event-card h3 { margin: 0.75rem 0 0.25rem; }
	.event-meta { color: var(--color-accent); font-size: 0.95rem; margin-bottom: 0.5rem; }
	.event-desc { color: var(--color-text-muted); font-size: 0.95rem; }
	.event-desc :global(p) { margin: 0; }
	.event-desc :global(p + p) { margin-top: 0.5rem; }
</style>

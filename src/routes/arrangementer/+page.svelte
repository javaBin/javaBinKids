<script lang="ts">
	import type { PageData } from './$types';
	import EventCard from '$lib/components/EventCard.svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Arrangementer — javaBin Kids</title>
</svelte:head>

<div class="container page">
	<h1>Arrangementer</h1>

	{#if data.upcoming.length > 0}
		<section>
			<h2>Kommende</h2>
			<div class="events-grid">
				{#each data.upcoming as event}
					<EventCard {event} />
				{/each}
			</div>
		</section>
	{/if}

	{#if data.past.length > 0}
		<section>
			<h2>Tidligere</h2>
			<div class="events-grid">
				{#each data.past as event}
					<EventCard {event} />
				{/each}
			</div>
		</section>
	{/if}

	{#if data.upcoming.length === 0 && data.past.length === 0}
		<p class="empty">Ingen arrangementer ennå.</p>
	{/if}
</div>

<style>
	.page { padding: 4rem 1.5rem; }
	h1 { margin-bottom: 2rem; }
	section { margin-bottom: 3rem; }
	section h2 { margin-bottom: 1rem; }
	.events-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem; }
	.empty { color: var(--color-text-muted); font-style: italic; }
</style>

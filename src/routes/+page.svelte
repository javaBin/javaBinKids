<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>javaBin Kids — Koding for barn</title>
</svelte:head>

<section class="hero">
	<div class="container hero-content">
		<h1>{data.heroTitle}</h1>
		<p class="hero-subtitle">{data.heroSubtitle}</p>
		<p class="hero-text">{data.heroText}</p>
		{#if data.nextEvent}
			<a href="/arrangementer/{data.nextEvent.arrangementId}" class="btn btn-primary">
				Se neste arrangement ({new Date(data.nextEvent.date).toLocaleDateString('nb-NO', { day: 'numeric', month: 'long' })})
			</a>
		{:else}
			<p class="hero-muted">Ingen kommende arrangementer ennå — følg med!</p>
		{/if}
	</div>
</section>

<style>
	.hero { text-align: center; padding: 6rem 1.5rem 4rem; }
	.hero-content { max-width: 700px; }
	.hero-subtitle { font-family: var(--font-display); font-size: 1.3rem; color: var(--color-accent); margin: 0.5rem 0 1rem; }
	.hero-text { color: var(--color-text-muted); margin-bottom: 2rem; font-size: 1.1rem; }
	.hero-muted { color: var(--color-text-muted); font-style: italic; }
</style>

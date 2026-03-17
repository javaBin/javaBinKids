<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.title} — javaBin Kids</title>
</svelte:head>

<div class="container page">
	<h1>{data.title}</h1>
	<div class="content">
		{@html data.htmlContent}
	</div>
</div>

<style>
	.page { padding: 4rem 1.5rem; }
	h1 { margin-bottom: 2rem; }
	.content { max-width: 700px; }
	.content :global(h2) { margin: 2rem 0 0.5rem; font-size: 1.3rem; color: var(--color-heading); font-family: var(--font-display); font-weight: 700; }
	.content :global(h3) { margin: 1.5rem 0 0.5rem; font-size: 1.1rem; color: var(--color-heading); font-family: var(--font-display); font-weight: 700; }
	.content :global(p) { color: var(--color-text-muted); margin-bottom: 1rem; }
</style>

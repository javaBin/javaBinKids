<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Forslag sendt inn — javaBin Kids</title>
</svelte:head>

<div class="container page">
	<div class="card confirm-card">
		<div class="check">&#10003;</div>
		<h2>Forslaget ditt er sendt inn!</h2>
		<p>Du vil motta en e-post med en lenke for å redigere forslaget ditt.</p>
		{#if data.deadlineStr}
			<p>Du kan redigere frem til <strong>{data.deadlineStr}</strong>.</p>
		{/if}
		<p class="muted">Vi gir deg beskjed på <strong>{data.speakerEmail}</strong> når forslaget er vurdert.</p>
		<a href="/arrangementer/{data.arrangementId}" class="btn btn-outline">Tilbake til arrangementet</a>
	</div>
</div>

<style>
	.page { padding: 4rem 1.5rem; }
	.confirm-card { max-width: 500px; margin: 0 auto; text-align: center; padding: 2rem; }
	.check { font-size: 3rem; color: var(--color-success); margin-bottom: 0.5rem; }
	h2 { margin-bottom: 0.75rem; }
	p { color: var(--color-text-muted); margin-bottom: 0.5rem; }
	.muted { font-size: 0.9rem; margin-bottom: 1.5rem; }
</style>

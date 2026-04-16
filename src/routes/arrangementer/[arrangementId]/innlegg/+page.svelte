<script lang="ts">
	import type { PageData } from './$types';
	import SubmissionForm from '$lib/components/SubmissionForm.svelte';

	let { data }: { data: PageData } = $props();

	const deadlineStr = $derived(
		data.event.submissionDeadline
			? new Date(data.event.submissionDeadline).toLocaleDateString('nb-NO', {
					day: 'numeric', month: 'long', year: 'numeric'
				})
			: ''
	);
</script>

<svelte:head>
	<title>Send inn kursforslag — {data.event.title} — javaBin Kids</title>
</svelte:head>

<div class="container page">
	<a href="/arrangementer/{data.event.arrangementId}" class="back-link">
		&larr; Tilbake til {data.event.title}
	</a>

	<h1>Send inn kursforslag</h1>
	<p class="meta">{data.event.title}</p>
	{#if deadlineStr}
		<p class="deadline">Frist: {deadlineStr}</p>
	{/if}

	<SubmissionForm
		arrangementId={data.event.arrangementId}
		eventTitle={data.event.title}
		submissionDeadline={data.event.submissionDeadline?.toString() ?? ''}
		mode="create"
	/>
</div>

<style>
	.page { padding: 4rem 1.5rem; }
	.back-link { display: inline-block; margin-bottom: 1.5rem; color: var(--color-text-muted); font-size: 0.95rem; }
	h1 { margin-bottom: 0.25rem; }
	.meta { color: var(--color-accent); margin-bottom: 0.25rem; }
	.deadline { color: var(--color-text-muted); margin-bottom: 2rem; font-size: 0.95rem; }
</style>

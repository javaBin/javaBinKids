<script lang="ts">
	import type { PageData } from './$types';
	import CourseCard from '$lib/components/CourseCard.svelte';

	let { data }: { data: PageData } = $props();

	const dateStr = $derived(new Date(data.event.date).toLocaleDateString('nb-NO', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	}));
</script>

<svelte:head>
	<title>{data.event.title} — javaBin Kids</title>
</svelte:head>

<div class="container page">
	{#if data.event.cancelled}
		<div class="badge badge-error">Avlyst</div>
	{/if}

	<h1>{data.event.title}</h1>
	<p class="meta">{dateStr} — {data.event.location}</p>
	<div class="description">{@html data.event.descriptionHtml}</div>

	{#if !data.registrationOpen && !data.event.cancelled}
		<div class="card notice">
			<p>Påmeldingen er ikke åpen for øyeblikket.</p>
			<p class="muted">
				Åpner: {new Date(data.event.registrationOpens).toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })}
			</p>
		</div>
	{/if}

	{#if data.submissionsOpen}
		<div class="submission-cta">
			<h2>Har du en idé til et kurs?</h2>
			<p>Vi tar imot forslag til kurs og aktiviteter for dette arrangementet.</p>
			{#if data.event.submissionDeadline}
				<p class="deadline">Frist: {new Date(data.event.submissionDeadline).toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
			{/if}
			<a href="/arrangementer/{data.event.arrangementId}/innlegg" class="btn btn-primary">Send inn forslag</a>
		</div>
	{/if}

	{#if data.courses.length > 0}
		<h2>Kurs og aktiviteter</h2>
		<div class="courses-grid">
			{#each data.courses as course}
				<CourseCard {course} arrangementId={data.event.arrangementId} />
			{/each}
		</div>
	{/if}
</div>

<style>
	.page { padding: 4rem 1.5rem; }
	h1 { margin-bottom: 0.5rem; }
	h2 { margin: 2rem 0 1rem; }
	.meta { color: var(--color-accent); font-size: 1.1rem; margin-bottom: 1rem; }
	.description { color: var(--color-text-muted); max-width: 700px; margin-bottom: 2rem; }
	.description :global(h2) { color: var(--color-heading); font-family: var(--font-display); font-size: 1.3rem; margin: 1.5rem 0 0.5rem; }
	.description :global(h3) { color: var(--color-heading); font-family: var(--font-display); font-size: 1.1rem; margin: 1rem 0 0.5rem; }
	.description :global(p) { margin-bottom: 0.75rem; }
	.description :global(ul), .description :global(ol) { margin: 0.5rem 0 0.75rem 1.5rem; }
	.description :global(li) { margin-bottom: 0.25rem; }
	.description :global(img) { max-width: 100%; height: auto; border-radius: var(--radius); }
	.notice { margin-bottom: 2rem; }
	.muted { color: var(--color-text-muted); font-size: 0.9rem; }
	.courses-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
	.submission-cta {
		margin-bottom: 2rem;
		background: rgba(126, 200, 200, 0.08);
		border: 2px dashed rgba(126, 200, 200, 0.3);
		border-radius: var(--radius-lg);
		padding: 2rem;
		text-align: center;
	}
	.submission-cta p { color: var(--color-text-muted); margin-bottom: 0.5rem; }
	.submission-cta .deadline { font-size: 0.9rem; margin-bottom: 1rem; }
</style>

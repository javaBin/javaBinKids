<script lang="ts">
	import type { PageData } from './$types';
	import RegistrationForm from '$lib/components/RegistrationForm.svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Påmelding: {data.course.title} — javaBin Kids</title>
</svelte:head>

<div class="container page">
	<a href="/arrangementer/{data.event.arrangementId}" class="back-link">
		&larr; Tilbake til {data.event.title}
	</a>

	<h1>Påmelding: {data.course.title}</h1>
	<p class="meta">{data.event.title} — {data.course.ageMin}–{data.course.ageMax} år</p>

	{#if data.spotsLeft > 0}
		<p class="spots">{data.spotsLeft} plasser ledig</p>
	{:else}
		<p class="spots full">Fullt — du kan melde deg på ventelisten</p>
	{/if}

	<RegistrationForm
		courseId={data.course.courseId}
		ageMin={data.course.ageMin}
		ageMax={data.course.ageMax}
	/>
</div>

<style>
	.page { padding: 4rem 1.5rem; }

	.back-link {
		display: inline-block;
		margin-bottom: 1.5rem;
		color: var(--color-text-muted);
		font-size: 0.95rem;
	}

	h1 { margin-bottom: 0.25rem; }

	.meta {
		color: var(--color-accent);
		margin-bottom: 0.5rem;
	}

	.spots {
		color: var(--color-success);
		margin-bottom: 2rem;
		font-weight: 600;
	}

	.spots.full {
		color: var(--color-warning);
	}
</style>

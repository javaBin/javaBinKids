<script lang="ts">
	import type { PageData } from './$types';
	import SubmissionForm from '$lib/components/SubmissionForm.svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Rediger forslag — javaBin Kids</title>
</svelte:head>

<div class="container page">
	<a href="/arrangementer/{data.event.arrangementId}" class="back-link">
		&larr; Tilbake til {data.event.title}
	</a>

	<h1>Rediger forslaget ditt</h1>
	<p class="meta">{data.event.title}</p>

	<SubmissionForm
		arrangementId={data.event.arrangementId}
		eventTitle={data.event.title}
		submissionDeadline={data.event.submissionDeadline?.toString() ?? ''}
		mode="edit"
		submissionId={data.submission.submissionId}
		editToken={data.editToken}
		initial={{
			speakerName: data.submission.speakerName,
			speakerEmail: data.submission.speakerEmail,
			speakerBio: data.submission.speakerBio,
			title: data.submission.title,
			description: data.submission.description,
			equipmentRequirements: data.submission.equipmentRequirements ?? '',
			ageMin: data.submission.ageMin,
			ageMax: data.submission.ageMax,
			maxParticipants: data.submission.maxParticipants
		}}
	/>
</div>

<style>
	.page { padding: 4rem 1.5rem; }
	.back-link { display: inline-block; margin-bottom: 1.5rem; color: var(--color-text-muted); font-size: 0.95rem; }
	h1 { margin-bottom: 0.25rem; }
	.meta { color: var(--color-accent); margin-bottom: 2rem; }
</style>

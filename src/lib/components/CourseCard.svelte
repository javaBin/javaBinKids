<script lang="ts">
	interface Props {
		course: {
			courseId: string;
			title: string;
			introductionHtml: string;
			thumbnailUrl: string | null;
			ageMin: number;
			ageMax: number;
			maxParticipants: number;
			confirmedCount: number;
		};
		arrangementId: string;
	}

	let { course, arrangementId }: Props = $props();

	const spotsLeft = $derived(course.maxParticipants - course.confirmedCount);
	const isFull = $derived(spotsLeft <= 0);
</script>

<a href="/arrangementer/{arrangementId}/kurs/{course.courseId}" class="card course-card">
	<div class="course-header">
		<h3>{course.title}</h3>
		<span class="age-badge">{course.ageMin}–{course.ageMax} år</span>
	</div>
	{#if course.thumbnailUrl}
		<img class="course-thumb" src={course.thumbnailUrl} alt={course.title} />
	{/if}
	<div class="course-desc">{@html course.introductionHtml}</div>
	<span class="spots" class:full={isFull}>
		{#if isFull}
			Fullt (venteliste)
		{:else}
			{spotsLeft} av {course.maxParticipants} plasser ledig
		{/if}
	</span>
	<span class="course-link">Se mer &rarr;</span>
</a>

<style>
	.course-card {
		display: flex;
		flex-direction: column;
		text-decoration: none;
		color: inherit;
		overflow: hidden;
	}

	.course-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 0.75rem;
		margin-bottom: 0.5rem;
	}

	.age-badge {
		white-space: nowrap;
		padding: 0.2rem 0.6rem;
		border-radius: 999px;
		background: rgba(126, 200, 200, 0.15);
		color: var(--color-heading);
		font-size: 0.8rem;
		font-weight: 600;
		margin-top: 0.15rem;
	}

	.course-desc {
		color: var(--color-text-muted);
		font-size: 0.9rem;
		margin-bottom: 0.75rem;
		flex: 1;
	}
	.course-thumb {
		width: 100%;
		height: 140px;
		object-fit: cover;
		border-radius: var(--radius);
		margin-bottom: 0.75rem;
	}

	.course-desc :global(p) { margin: 0; }
	.course-desc :global(p + p) { margin-top: 0.5rem; }
	.course-desc :global(img) { max-width: 100%; height: auto; border-radius: var(--radius); }

	.spots {
		font-size: 0.85rem;
		color: var(--color-success);
		margin-bottom: 0.75rem;
	}

	.spots.full {
		color: var(--color-warning);
	}

	.course-link {
		display: block;
		text-align: center;
		padding: 0.6rem;
		border-radius: var(--radius);
		background: rgba(212, 168, 67, 0.1);
		color: var(--color-accent);
		font-weight: 600;
		font-size: 0.9rem;
		transition: background 0.2s;
	}

	.course-card:hover .course-link {
		background: var(--color-accent);
		color: var(--color-bg-deep);
	}

	:global(.btn-sm) { padding: 0.5rem 1.2rem; font-size: 0.95rem; }
</style>

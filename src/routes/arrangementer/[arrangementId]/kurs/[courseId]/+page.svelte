<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();

	const eventDateStr = $derived(new Date(data.event.date).toLocaleDateString('nb-NO', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	}));
</script>

<svelte:head>
	<title>{data.course.title} — {data.event.title} — javaBin Kids</title>
</svelte:head>

<div class="container page">
	<a href="/arrangementer/{data.event.arrangementId}" class="back-link">
		&larr; Tilbake til {data.event.title}
	</a>

	<div class="course-layout">
		<div class="course-main">
			<span class="age-badge">{data.course.ageMin}–{data.course.ageMax} år</span>
			<h1>{data.course.title}</h1>
			<p class="event-info">{data.event.title} — {eventDateStr}</p>
			<p class="location">{data.event.location}</p>

			{#if data.course.thumbnailUrl}
				<img class="course-hero" src={data.course.thumbnailUrl} alt={data.course.title} />
			{/if}

			<section class="description-section">
				<h2>Om kurset</h2>
				<div class="description">{@html data.course.descriptionHtml}</div>
			</section>
		</div>

		<aside class="info-card card">
			<h3>Praktisk info</h3>

			<div class="info-row">
				<span class="info-label">Aldersgruppe</span>
				<span class="info-value">{data.course.ageMin}–{data.course.ageMax} år</span>
			</div>

			<div class="info-row">
				<span class="info-label">Maks deltakere</span>
				<span class="info-value">{data.course.maxParticipants}</span>
			</div>

			<div class="info-row">
				<span class="info-label">Påmeldte</span>
				<span class="info-value">{data.confirmedCount} av {data.course.maxParticipants}</span>
			</div>

			<div class="info-row">
				<span class="info-label">Ledige plasser</span>
				<span class="info-value" class:full={data.spotsLeft <= 0} class:available={data.spotsLeft > 0}>
					{#if data.spotsLeft > 0}
						{data.spotsLeft}
					{:else}
						Fullt
					{/if}
				</span>
			</div>

			{#if data.waitlistedCount > 0}
				<div class="info-row">
					<span class="info-label">På venteliste</span>
					<span class="info-value">{data.waitlistedCount}</span>
				</div>
			{/if}

			<div class="capacity-bar">
				<div
					class="capacity-fill"
					style="width: {Math.min(100, (data.confirmedCount / data.course.maxParticipants) * 100)}%"
				></div>
			</div>

			{#if data.registrationOpen}
				<a
					href="/arrangementer/{data.event.arrangementId}/pamelding/{data.course.courseId}"
					class="btn btn-primary btn-full"
				>
					{data.spotsLeft > 0 ? 'Meld på' : 'Sett på venteliste'}
				</a>
			{:else if data.event.cancelled}
				<p class="status-text cancelled">Arrangementet er avlyst</p>
			{:else}
				<p class="status-text closed">Påmeldingen er ikke åpen</p>
				<p class="opens-text">
					Åpner: {new Date(data.event.registrationOpens).toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })}
				</p>
			{/if}
		</aside>
	</div>
</div>

<style>
	.page { padding: 4rem 1.5rem; }

	.back-link {
		display: inline-block;
		margin-bottom: 1.5rem;
		color: var(--color-text-muted);
		font-size: 0.95rem;
	}

	.course-layout {
		display: grid;
		grid-template-columns: 1fr 320px;
		gap: 2rem;
		align-items: start;
	}

	.age-badge {
		display: inline-block;
		padding: 0.3rem 0.8rem;
		border-radius: 999px;
		background: rgba(126, 200, 200, 0.15);
		color: var(--color-heading);
		font-size: 0.9rem;
		font-weight: 600;
		margin-bottom: 0.75rem;
	}

	h1 { margin-bottom: 0.5rem; }

	.event-info {
		color: var(--color-accent);
		font-size: 1.05rem;
		margin-bottom: 0.25rem;
	}

	.location {
		color: var(--color-text-muted);
		font-size: 0.95rem;
	}

	.course-hero {
		width: 100%;
		max-height: 350px;
		object-fit: cover;
		border-radius: var(--radius);
		margin-top: 1.5rem;
	}

	.description-section {
		margin-top: 2rem;
	}

	.description-section h2 {
		margin-bottom: 0.75rem;
		font-size: 1.3rem;
	}

	.description {
		color: var(--color-text-muted);
		line-height: 1.7;
	}
	.description :global(h2) { color: var(--color-heading); font-family: var(--font-display); font-size: 1.3rem; margin: 1.5rem 0 0.5rem; }
	.description :global(h3) { color: var(--color-heading); font-family: var(--font-display); font-size: 1.1rem; margin: 1rem 0 0.5rem; }
	.description :global(p) { margin-bottom: 0.75rem; }
	.description :global(ul), .description :global(ol) { margin: 0.5rem 0 0.75rem 1.5rem; }
	.description :global(li) { margin-bottom: 0.25rem; }
	.description :global(img) { max-width: 100%; max-height: 400px; height: auto; object-fit: contain; border-radius: var(--radius); }

	.info-card {
		padding: 1.5rem;
		position: sticky;
		top: 80px;
	}

	.info-card h3 {
		margin-bottom: 1rem;
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--color-border);
	}

	.info-label {
		color: var(--color-text-muted);
		font-size: 0.9rem;
	}

	.info-value {
		font-weight: 600;
		font-size: 0.9rem;
	}

	.info-value.full {
		color: var(--color-warning);
	}

	.info-value.available {
		color: var(--color-success);
	}

	.capacity-bar {
		height: 8px;
		background: var(--color-border);
		border-radius: 4px;
		margin: 1rem 0;
		overflow: hidden;
	}

	.capacity-fill {
		height: 100%;
		background: var(--color-heading);
		border-radius: 4px;
		transition: width 0.3s;
	}

	.btn-full {
		width: 100%;
		margin-top: 0.5rem;
	}

	.status-text {
		text-align: center;
		font-weight: 600;
		margin-top: 1rem;
	}

	.status-text.cancelled {
		color: var(--color-error);
	}

	.status-text.closed {
		color: var(--color-text-muted);
	}

	.opens-text {
		text-align: center;
		color: var(--color-text-muted);
		font-size: 0.85rem;
		margin-top: 0.25rem;
	}

	@media (max-width: 768px) {
		.course-layout {
			grid-template-columns: 1fr;
		}
	}
</style>

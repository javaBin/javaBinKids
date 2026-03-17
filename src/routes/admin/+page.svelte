<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<h1>Dashboard</h1>

<div class="stats-grid">
	<a href="/admin/arrangementer" class="card stat-card">
		<span class="stat-value">{data.totalEvents}</span>
		<span class="stat-label">Arrangementer totalt</span>
	</a>
	<a href="/admin/arrangementer" class="card stat-card">
		<span class="stat-value">{data.upcomingCount}</span>
		<span class="stat-label">Kommende</span>
	</a>
	<a href="/admin/pameldinger?status=confirmed" class="card stat-card">
		<span class="stat-value">{data.totalRegistrations}</span>
		<span class="stat-label">Bekreftede påmeldinger</span>
	</a>
	<a href="/admin/pameldinger?status=waitlisted" class="card stat-card">
		<span class="stat-value">{data.totalWaitlisted}</span>
		<span class="stat-label">På venteliste</span>
	</a>
</div>

<style>
	h1 { margin-bottom: 2rem; }

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1rem;
	}

	.stat-card {
		text-align: center;
		padding: 1.5rem;
		text-decoration: none;
		color: inherit;
	}

	.stat-value {
		display: block;
		font-size: 2.5rem;
		font-weight: 800;
		font-family: var(--font-display);
		color: var(--color-heading);
	}

	.stat-label {
		color: var(--color-text-muted);
		font-size: 0.9rem;
	}
</style>

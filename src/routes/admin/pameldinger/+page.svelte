<script lang="ts">
	import type { PageData } from './$types';
	import { invalidateAll, goto } from '$app/navigation';
	import { page } from '$app/state';
	import { toast } from '$lib/toast.svelte';

	let { data }: { data: PageData } = $props();

	function filterByStatus(status: string | null) {
		const url = new URL(page.url);
		if (status) url.searchParams.set('status', status);
		else url.searchParams.delete('status');
		goto(url.toString());
	}

	async function cancelRegistration(registrationId: string) {
		if (!confirm('Avbestille denne påmeldingen?')) return;
		await fetch(`/api/registrations/${registrationId}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ registration: { status: 'cancelled' } })
		});
		toast.show('Påmelding avbestilt');
		invalidateAll();
	}
</script>

<h1>Påmeldinger</h1>

<div class="filters">
	<button class="btn btn-sm" class:active={!data.statusFilter} onclick={() => filterByStatus(null)}>Alle</button>
	<button class="btn btn-sm" class:active={data.statusFilter === 'confirmed'} onclick={() => filterByStatus('confirmed')}>Bekreftet</button>
	<button class="btn btn-sm" class:active={data.statusFilter === 'waitlisted'} onclick={() => filterByStatus('waitlisted')}>Venteliste</button>
	<button class="btn btn-sm" class:active={data.statusFilter === 'cancelled'} onclick={() => filterByStatus('cancelled')}>Avbestilt</button>
</div>

{#if data.courses.length > 0}
	<div class="export-section">
		<label for="exportCourse">Eksporter CSV:</label>
		<select id="exportCourse" onchange={(e) => {
			const val = e.currentTarget.value;
			if (val) window.open(`/api/admin/export/${val}`, '_blank');
		}}>
			<option value="">Velg kurs...</option>
			{#each data.courses as c}
				<option value={c.courseId}>{c.eventTitle} — {c.title}</option>
			{/each}
		</select>
	</div>
{/if}

<div class="table-wrap">
	<table>
		<thead>
			<tr>
				<th>Barn</th>
				<th>Alder</th>
				<th>Foresatt</th>
				<th>E-post</th>
				<th>Kurs</th>
				<th>Status</th>
				<th></th>
			</tr>
		</thead>
		<tbody>
			{#each data.registrations as r}
				<tr>
					<td>{r.registration.childName}</td>
					<td>{r.registration.childAge}</td>
					<td>{r.registration.parentName}</td>
					<td>{r.registration.parentEmail}</td>
					<td>{r.courseTitle}</td>
					<td>
						{#if r.registration.status === 'confirmed'}
							<span class="badge badge-success">Bekreftet</span>
						{:else if r.registration.status === 'waitlisted'}
							<span class="badge badge-warning">Venteliste ({r.registration.waitlistPosition})</span>
						{:else}
							<span class="badge badge-error">Avbestilt</span>
						{/if}
					</td>
					<td>
						{#if r.registration.status !== 'cancelled'}
							<button class="btn btn-outline btn-sm danger" onclick={() => cancelRegistration(r.registration.registrationId)}>Avbestill</button>
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	h1 { margin-bottom: 1.5rem; }

	.filters {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}

	.filters .btn {
		padding: 0.4rem 1rem;
		font-size: 0.85rem;
		border: 1px solid var(--color-border);
		background: transparent;
		color: var(--color-text-muted);
		border-radius: var(--radius);
		cursor: pointer;
	}

	.filters .btn.active {
		background: var(--color-heading);
		color: var(--color-bg-deep);
		border-color: var(--color-heading);
	}

	.export-section {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
	}

	.export-section select {
		width: auto;
		min-width: 250px;
	}

	.table-wrap {
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th, td {
		padding: 0.75rem;
		text-align: left;
		border-bottom: 1px solid var(--color-border);
	}

	th {
		color: var(--color-text-muted);
		font-size: 0.85rem;
		font-weight: 600;
	}

	.danger {
		border-color: var(--color-error);
		color: var(--color-error);
	}
</style>

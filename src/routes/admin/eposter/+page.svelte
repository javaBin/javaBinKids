<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function formatUpdated(d: Date | string | null): string {
		if (!d) return '—';
		return new Date(d).toLocaleString('nb-NO', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<h1>E-postmaler</h1>
<p class="intro">Rediger tekstinnholdet i e-poster som sendes til foreldre og foredragsholdere. Layout, farger og strukturelle elementer forblir uendret.</p>

<div class="template-list">
	{#each data.templates as t}
		<a href="/admin/eposter/{t.templateKey}" class="template-row">
			<div class="main">
				<div class="label">{t.label}</div>
				<div class="subject">{t.subject}</div>
			</div>
			<div class="updated">{formatUpdated(t.updatedAt)}</div>
		</a>
	{/each}
</div>

<style>
	h1 { margin-bottom: 0.25rem; }
	.intro { color: var(--color-text-muted); margin-bottom: 2rem; max-width: 60ch; }

	.template-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		max-width: 800px;
	}

	.template-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		padding: 1rem 1.25rem;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		text-decoration: none;
		color: var(--color-text);
		transition: background 0.15s, border-color 0.15s;
	}
	.template-row:hover {
		background: rgba(255, 255, 255, 0.06);
		border-color: var(--color-heading);
	}

	.main { flex: 1; min-width: 0; }
	.label { font-weight: 600; margin-bottom: 0.25rem; }
	.subject {
		font-size: 0.85rem;
		color: var(--color-text-muted);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.updated {
		font-size: 0.8rem;
		color: var(--color-text-muted);
		white-space: nowrap;
	}
</style>

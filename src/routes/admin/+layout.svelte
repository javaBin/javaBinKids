<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import Toast from '$lib/components/Toast.svelte';

	let { children } = $props();

	const adminLinks = [
		{ href: '/admin', label: 'Dashboard' },
		{ href: '/admin/arrangementer', label: 'Arrangementer' },
		{ href: '/admin/pameldinger', label: 'Påmeldinger' },
		{ href: '/admin/innhold', label: 'Innhold' },
		{ href: '/admin/eposter', label: 'E-postmaler' }
	];

	async function handleLogout() {
		await fetch('/api/auth/logout', { method: 'POST' });
		goto('/admin/login');
	}
</script>

<Toast />

{#if page.url.pathname === '/admin/login'}
	{@render children()}
{:else}
	<div class="admin-layout">
		<aside class="admin-sidebar">
			<h3>Admin</h3>
			<nav>
				{#each adminLinks as link}
					<a href={link.href} class:active={page.url.pathname === link.href}>
						{link.label}
					</a>
				{/each}
			</nav>
			<button class="btn btn-outline btn-sm logout-btn" onclick={handleLogout}>Logg ut</button>
		</aside>
		<div class="admin-content">
			{@render children()}
		</div>
	</div>
{/if}

<style>
	.admin-layout {
		display: flex;
		min-height: calc(100vh - 64px);
	}

	.admin-sidebar {
		width: 220px;
		padding: 1.5rem;
		background: rgba(0, 0, 0, 0.2);
		border-right: 1px solid var(--color-border);
		display: flex;
		flex-direction: column;
	}

	.admin-sidebar h3 {
		margin-bottom: 1.5rem;
	}

	.admin-sidebar nav {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		flex: 1;
	}

	.admin-sidebar nav a {
		padding: 0.5rem 0.75rem;
		border-radius: var(--radius);
		color: var(--color-text-muted);
		font-weight: 500;
	}

	.admin-sidebar nav a:hover,
	.admin-sidebar nav a.active {
		background: rgba(255, 255, 255, 0.05);
		color: var(--color-text);
	}

	.logout-btn {
		margin-top: auto;
		font-size: 0.85rem;
	}

	.admin-content {
		flex: 1;
		padding: 2rem;
		overflow-y: auto;
	}

	@media (max-width: 768px) {
		.admin-layout { flex-direction: column; }
		.admin-sidebar {
			width: 100%;
			flex-direction: row;
			align-items: center;
			gap: 1rem;
			padding: 0.75rem 1rem;
		}
		.admin-sidebar h3 { margin-bottom: 0; }
		.admin-sidebar nav { flex-direction: row; }
		.logout-btn { margin-top: 0; }
	}
</style>

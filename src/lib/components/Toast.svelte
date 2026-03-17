<script lang="ts">
	import { toast } from '$lib/toast.svelte';
</script>

{#if toast.items.length > 0}
	<div class="toast-container" aria-live="polite">
		{#each toast.items as item (item.id)}
			<div class="toast" class:success={item.type === 'success'} class:error={item.type === 'error'}>
				<span>{item.message}</span>
				<button class="toast-close" onclick={() => toast.dismiss(item.id)}>&times;</button>
			</div>
		{/each}
	</div>
{/if}

<style>
	.toast-container {
		position: fixed;
		top: 76px;
		right: 1.5rem;
		z-index: 200;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		max-width: 400px;
	}

	.toast {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.75rem 1rem;
		border-radius: var(--radius);
		font-size: 0.9rem;
		font-weight: 500;
		animation: slide-in 0.25s ease-out;
	}

	.toast.success {
		background: rgba(76, 175, 80, 0.15);
		border: 1px solid var(--color-success);
		color: var(--color-success);
	}

	.toast.error {
		background: rgba(231, 76, 60, 0.15);
		border: 1px solid var(--color-error);
		color: var(--color-error);
	}

	.toast-close {
		background: none;
		border: none;
		color: inherit;
		font-size: 1.2rem;
		cursor: pointer;
		padding: 0 0.25rem;
		opacity: 0.7;
	}

	.toast-close:hover {
		opacity: 1;
	}

	@keyframes slide-in {
		from { transform: translateX(100%); opacity: 0; }
		to { transform: translateX(0); opacity: 1; }
	}
</style>

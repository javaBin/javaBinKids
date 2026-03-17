<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();

	function actionHref(type: string, value: string): string {
		if (type === 'email') return `mailto:${value}`;
		if (type === 'phone') return `tel:${value}`;
		return value;
	}

	function displayValue(type: string, value: string): string {
		if (type === 'link') {
			try { return new URL(value).hostname; } catch { return value; }
		}
		return value;
	}
</script>

<svelte:head>
	<title>Kontakt — javaBin Kids</title>
</svelte:head>

<div class="container page">
	<h1>Kontakt oss</h1>

	<div class="contact-info">
		{#each data.cards as card (card.contactCardId)}
			<div class="card contact-card">
				<h3>{card.title}</h3>
				<p>
					<a
						href={actionHref(card.actionType, card.actionValue)}
						target={card.actionType === 'link' ? '_blank' : undefined}
						rel={card.actionType === 'link' ? 'noopener' : undefined}
					>
						{displayValue(card.actionType, card.actionValue)}
					</a>
				</p>
			</div>
		{/each}
	</div>
</div>

<style>
	.page { padding: 4rem 1.5rem; }
	h1 { margin-bottom: 2rem; }
	.contact-info { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.5rem; max-width: 800px; }
	.contact-card h3 { margin-bottom: 0.5rem; }
</style>

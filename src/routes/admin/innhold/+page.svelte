<script lang="ts">
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';
	import { toast } from '$lib/toast.svelte';

	let { data }: { data: PageData } = $props();

	// Front page state
	let heroTitle = $state(data.heroTitle);
	let heroSubtitle = $state(data.heroSubtitle);
	let heroText = $state(data.heroText);
	let savingHero = $state(false);

	async function saveHero(e: SubmitEvent) {
		e.preventDefault();
		savingHero = true;

		await Promise.all([
			fetch('/api/content', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: { key: 'hero_title', content: heroTitle } }) }),
			fetch('/api/content', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: { key: 'hero_subtitle', content: heroSubtitle } }) }),
			fetch('/api/content', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: { key: 'hero_text', content: heroText } }) })
		]);

		savingHero = false;
		toast.show('Forsiden lagret');
		invalidateAll();
	}

	// Om page state
	let omTitle = $state(data.omTitle);
	let omContent = $state(data.omContent);
	let savingOm = $state(false);

	async function saveOm(e: SubmitEvent) {
		e.preventDefault();
		savingOm = true;

		await fetch('/api/content', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ content: { key: 'om_title', content: omTitle } })
		});
		await fetch('/api/content', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ content: { key: 'om_content', content: omContent } })
		});

		savingOm = false;
		toast.show('Om-siden lagret');
		invalidateAll();
	}

	// Contact cards state
	let showCardForm = $state(false);
	let cardTitle = $state('');
	let cardType = $state<'email' | 'link' | 'phone'>('email');
	let cardValue = $state('');
	let submittingCard = $state(false);

	// Edit state
	let editingCardId = $state<string | null>(null);
	let editCardTitle = $state('');
	let editCardType = $state<'email' | 'link' | 'phone'>('email');
	let editCardValue = $state('');
	let savingCard = $state(false);

	function startEditCard(card: typeof data.contactCards[0]) {
		editingCardId = card.contactCardId;
		editCardTitle = card.title;
		editCardType = card.actionType as 'email' | 'link' | 'phone';
		editCardValue = card.actionValue;
	}

	async function addCard(e: SubmitEvent) {
		e.preventDefault();
		submittingCard = true;

		const res = await fetch('/api/contact-cards', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				contactCard: {
					title: cardTitle,
					actionType: cardType,
					actionValue: cardValue
				}
			})
		});

		if (res.ok) {
			showCardForm = false;
			cardTitle = '';
			cardType = 'email';
			cardValue = '';
			toast.show('Kontaktkort lagt til');
			invalidateAll();
		} else {
			toast.show('Kunne ikke legge til kort', 'error');
		}
		submittingCard = false;
	}

	async function saveCard(e: SubmitEvent) {
		e.preventDefault();
		if (!editingCardId) return;
		savingCard = true;

		await fetch(`/api/contact-cards/${editingCardId}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				contactCard: {
					title: editCardTitle,
					actionType: editCardType,
					actionValue: editCardValue
				}
			})
		});

		savingCard = false;
		editingCardId = null;
		toast.show('Kontaktkort lagret');
		invalidateAll();
	}

	async function deleteCard(id: string) {
		if (!confirm('Slette dette kontaktkortet?')) return;
		const res = await fetch(`/api/contact-cards/${id}`, { method: 'DELETE' });
		if (res.ok) {
			toast.show('Kontaktkort slettet');
			invalidateAll();
		} else {
			toast.show('Kunne ikke slette kort', 'error');
		}
	}

	function typeName(type: string): string {
		if (type === 'email') return 'E-post';
		if (type === 'phone') return 'Telefon';
		return 'Lenke';
	}
</script>

<h1>Innhold</h1>

<section class="section">
	<h2>Forside</h2>
	<form onsubmit={saveHero}>
		<div class="form-group">
			<label for="heroTitle">Tittel</label>
			<input id="heroTitle" bind:value={heroTitle} required />
		</div>
		<div class="form-group">
			<label for="heroSubtitle">Undertittel</label>
			<input id="heroSubtitle" bind:value={heroSubtitle} required />
		</div>
		<div class="form-group">
			<label for="heroText">Brødtekst</label>
			<textarea id="heroText" bind:value={heroText} rows="4" required></textarea>
		</div>
		<button type="submit" class="btn btn-primary" disabled={savingHero}>
			{savingHero ? 'Lagrer...' : 'Lagre forside'}
		</button>
	</form>
</section>

<section class="section">
	<h2>Om-siden</h2>
	<form onsubmit={saveOm}>
		<div class="form-group">
			<label for="omTitle">Tittel</label>
			<input id="omTitle" bind:value={omTitle} required />
		</div>
		<div class="form-group">
			<label for="omContent">Innhold (Markdown)</label>
			<textarea id="omContent" bind:value={omContent} rows="16" required></textarea>
			<span class="hint">Bruk ## for overskrifter, vanlig tekst for avsnitt</span>
		</div>
		<button type="submit" class="btn btn-primary" disabled={savingOm}>
			{savingOm ? 'Lagrer...' : 'Lagre Om-siden'}
		</button>
	</form>
</section>

<section class="section">
	<h2>Kontaktkort</h2>
	<button class="btn btn-primary btn-sm" onclick={() => showCardForm = !showCardForm}>
		{showCardForm ? 'Avbryt' : 'Legg til kort'}
	</button>

	{#if showCardForm}
		<form class="card form-card" onsubmit={addCard}>
			<div class="form-group">
				<label for="cTitle">Tittel</label>
				<input id="cTitle" bind:value={cardTitle} required placeholder="F.eks. E-post" />
			</div>
			<div class="form-row">
				<div class="form-group">
					<label for="cType">Type</label>
					<select id="cType" bind:value={cardType}>
						<option value="email">E-post</option>
						<option value="link">Lenke</option>
						<option value="phone">Telefon</option>
					</select>
				</div>
				<div class="form-group">
					<label for="cValue">Verdi</label>
					<input id="cValue" bind:value={cardValue} required
						placeholder={cardType === 'email' ? 'navn@eksempel.no' : cardType === 'phone' ? '+47 123 45 678' : 'https://...'} />
				</div>
			</div>
			<button type="submit" class="btn btn-primary btn-sm" disabled={submittingCard}>Legg til</button>
		</form>
	{/if}

	<div class="cards-list">
		{#each data.contactCards as card (card.contactCardId)}
			<div class="card contact-card-admin">
				{#if editingCardId === card.contactCardId}
					<form onsubmit={saveCard}>
						<div class="form-group">
							<label for="ecTitle">Tittel</label>
							<input id="ecTitle" bind:value={editCardTitle} required />
						</div>
						<div class="form-row">
							<div class="form-group">
								<label for="ecType">Type</label>
								<select id="ecType" bind:value={editCardType}>
									<option value="email">E-post</option>
									<option value="link">Lenke</option>
									<option value="phone">Telefon</option>
								</select>
							</div>
							<div class="form-group">
								<label for="ecValue">Verdi</label>
								<input id="ecValue" bind:value={editCardValue} required />
							</div>
						</div>
						<div class="edit-actions">
							<button type="submit" class="btn btn-primary btn-sm" disabled={savingCard}>Lagre</button>
							<button type="button" class="btn btn-outline btn-sm" onclick={() => editingCardId = null}>Avbryt</button>
						</div>
					</form>
				{:else}
					<div class="card-header-row">
						<div>
							<strong>{card.title}</strong>
							<span class="meta">{typeName(card.actionType)}: {card.actionValue}</span>
						</div>
						<div class="card-actions">
							<button class="btn btn-outline btn-sm" onclick={() => startEditCard(card)}>Rediger</button>
							<button class="btn btn-outline btn-sm danger" onclick={() => deleteCard(card.contactCardId)}>Slett</button>
						</div>
					</div>
				{/if}
			</div>
		{/each}
	</div>
</section>

<style>
	h1 { margin-bottom: 2rem; }

	.section {
		margin-bottom: 3rem;
	}

	.section h2 {
		margin-bottom: 1rem;
	}

	.form-card {
		margin: 1rem 0;
		padding: 1.5rem;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 2fr;
		gap: 1rem;
	}

	textarea {
		font-family: var(--font-body);
		resize: vertical;
	}

	.hint {
		display: block;
		font-size: 0.8rem;
		color: var(--color-text-muted);
		margin-top: 0.3rem;
	}

	.cards-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-top: 1rem;
	}

	.contact-card-admin {
		padding: 1rem 1.5rem;
	}

	.card-header-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.card-actions {
		display: flex;
		gap: 0.5rem;
	}

	.meta {
		display: block;
		color: var(--color-text-muted);
		font-size: 0.85rem;
	}

	.edit-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.75rem;
	}

	.danger {
		border-color: var(--color-error);
		color: var(--color-error);
	}

	.danger:hover {
		background: var(--color-error);
		color: white;
	}

	@media (max-width: 768px) {
		.form-row {
			grid-template-columns: 1fr;
		}
	}
</style>

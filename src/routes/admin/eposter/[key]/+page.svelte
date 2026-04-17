<script lang="ts">
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';
	import { toast } from '$lib/toast.svelte';

	let { data }: { data: PageData } = $props();

	let subject = $state(data.fields.subject);
	let heading = $state(data.fields.heading);
	let introText = $state(data.fields.introText);
	let outroText = $state(data.fields.outroText);
	let buttonText = $state(data.fields.buttonText ?? '');
	let saving = $state(false);

	let previewLoading = $state(false);
	let previewHtml = $state('');
	let previewSubject = $state('');

	const hasButton = $derived(data.defaults.buttonText !== null);

	async function save(e: SubmitEvent) {
		e.preventDefault();
		saving = true;
		try {
			const res = await fetch(`/api/email-templates/${data.templateKey}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					template: {
						subject,
						heading,
						introText,
						outroText,
						buttonText: hasButton ? buttonText || null : null
					}
				})
			});
			if (!res.ok) {
				toast.show('Kunne ikke lagre', 'error');
				return;
			}
			toast.show('E-postmal lagret');
			invalidateAll();
		} finally {
			saving = false;
		}
	}

	async function fetchPreview() {
		previewLoading = true;
		try {
			const res = await fetch(`/api/email-templates/${data.templateKey}/preview`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					fields: {
						subject,
						heading,
						introText,
						outroText,
						buttonText: hasButton ? buttonText || null : null
					}
				})
			});
			if (!res.ok) return;
			const body = await res.json();
			previewHtml = body.html;
			previewSubject = body.subject;
		} finally {
			previewLoading = false;
		}
	}

	let debounceTimer: ReturnType<typeof setTimeout> | null = null;
	$effect(() => {
		subject; heading; introText; outroText; buttonText;
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(fetchPreview, 400);
		return () => {
			if (debounceTimer) clearTimeout(debounceTimer);
		};
	});

	function resetField(field: 'subject' | 'heading' | 'introText' | 'outroText' | 'buttonText') {
		if (field === 'subject') subject = data.defaults.subject;
		else if (field === 'heading') heading = data.defaults.heading;
		else if (field === 'introText') introText = data.defaults.introText;
		else if (field === 'outroText') outroText = data.defaults.outroText;
		else buttonText = data.defaults.buttonText ?? '';
	}

	function insertVariable(target: 'subject' | 'heading' | 'introText' | 'outroText' | 'buttonText', name: string) {
		const snippet = `{{${name}}}`;
		if (target === 'subject') subject = `${subject}${snippet}`;
		else if (target === 'heading') heading = `${heading}${snippet}`;
		else if (target === 'introText') introText = `${introText}${snippet}`;
		else if (target === 'outroText') outroText = `${outroText}${snippet}`;
		else buttonText = `${buttonText}${snippet}`;
	}
</script>

<a href="/admin/eposter" class="back-link">&larr; Tilbake til e-postmaler</a>

<h1>{data.label}</h1>
<p class="meta">Mal: <code>{data.templateKey}</code></p>

<div class="variable-panel">
	<div class="variable-title">Tilgjengelige variabler</div>
	<div class="variable-chips">
		{#each data.variables as v}
			<code class="chip">&#123;&#123;{v}&#125;&#125;</code>
		{/each}
	</div>
	<p class="variable-hint">Bruk <code>**tekst**</code> for uthevet tekst. Tom linje = ny paragraf.</p>
</div>

<div class="editor-layout">
	<form onsubmit={save} class="template-form">
		<div class="form-group">
			<div class="form-label-row">
				<label for="subject">Emne</label>
				<button type="button" class="reset-btn" onclick={() => resetField('subject')}>Tilbakestill</button>
			</div>
			<input id="subject" bind:value={subject} required />
			<div class="insert-row">
				{#each data.variables as v}
					<button type="button" class="insert-btn" onclick={() => insertVariable('subject', v)}>+{v}</button>
				{/each}
			</div>
		</div>

		<div class="form-group">
			<div class="form-label-row">
				<label for="heading">Overskrift</label>
				<button type="button" class="reset-btn" onclick={() => resetField('heading')}>Tilbakestill</button>
			</div>
			<input id="heading" bind:value={heading} required />
			<div class="insert-row">
				{#each data.variables as v}
					<button type="button" class="insert-btn" onclick={() => insertVariable('heading', v)}>+{v}</button>
				{/each}
			</div>
		</div>

		<div class="form-group">
			<div class="form-label-row">
				<label for="introText">Intro-tekst (før info-bokser/knapp)</label>
				<button type="button" class="reset-btn" onclick={() => resetField('introText')}>Tilbakestill</button>
			</div>
			<textarea id="introText" bind:value={introText} rows="5"></textarea>
			<div class="insert-row">
				{#each data.variables as v}
					<button type="button" class="insert-btn" onclick={() => insertVariable('introText', v)}>+{v}</button>
				{/each}
			</div>
		</div>

		{#if hasButton}
			<div class="form-group">
				<div class="form-label-row">
					<label for="buttonText">Knapp-tekst</label>
					<button type="button" class="reset-btn" onclick={() => resetField('buttonText')}>Tilbakestill</button>
				</div>
				<input id="buttonText" bind:value={buttonText} />
			</div>
		{/if}

		<div class="form-group">
			<div class="form-label-row">
				<label for="outroText">Avslutning (etter knapp)</label>
				<button type="button" class="reset-btn" onclick={() => resetField('outroText')}>Tilbakestill</button>
			</div>
			<textarea id="outroText" bind:value={outroText} rows="5"></textarea>
			<div class="insert-row">
				{#each data.variables as v}
					<button type="button" class="insert-btn" onclick={() => insertVariable('outroText', v)}>+{v}</button>
				{/each}
			</div>
		</div>

		<div class="actions">
			<button type="submit" class="btn btn-primary" disabled={saving}>
				{saving ? 'Lagrer…' : 'Lagre'}
			</button>
		</div>
	</form>

	<aside class="preview-pane">
		<div class="preview-header">
			<div class="preview-title">Forhåndsvisning {#if previewLoading}<span class="spinner">oppdaterer…</span>{/if}</div>
			<div class="preview-subject-label">Emne</div>
			<div class="preview-subject">{previewSubject || '—'}</div>
		</div>
		<div class="preview-frame-wrap">
			<iframe title="E-post forhåndsvisning" srcdoc={previewHtml}></iframe>
		</div>
	</aside>
</div>

<style>
	.back-link { display: inline-block; margin-bottom: 1rem; color: var(--color-text-muted); font-size: 0.9rem; }
	h1 { margin-bottom: 0.25rem; }
	.meta { color: var(--color-text-muted); margin-bottom: 1.5rem; font-size: 0.9rem; }

	.variable-panel {
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 1rem 1.25rem;
		margin-bottom: 1.5rem;
	}
	.variable-title { font-weight: 600; margin-bottom: 0.5rem; font-size: 0.9rem; }
	.variable-chips { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 0.5rem; }
	.chip {
		background: rgba(126, 200, 200, 0.12);
		color: var(--color-heading);
		padding: 0.15rem 0.5rem;
		border-radius: 999px;
		font-size: 0.8rem;
	}
	.variable-hint { font-size: 0.8rem; color: var(--color-text-muted); margin: 0; }
	.variable-hint code {
		background: rgba(255, 255, 255, 0.05);
		padding: 1px 4px;
		border-radius: 3px;
	}

	.editor-layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 1.5rem;
		align-items: start;
	}
	@media (max-width: 1100px) {
		.editor-layout { grid-template-columns: 1fr; }
	}

	.template-form { display: flex; flex-direction: column; gap: 1.25rem; }
	.form-group { display: flex; flex-direction: column; gap: 0.4rem; }
	.form-label-row { display: flex; justify-content: space-between; align-items: baseline; }
	.form-label-row label { font-weight: 500; }

	.reset-btn {
		background: none;
		border: none;
		color: var(--color-text-muted);
		font-size: 0.8rem;
		cursor: pointer;
		padding: 0;
	}
	.reset-btn:hover { color: var(--color-text); }

	textarea { font-family: inherit; line-height: 1.5; resize: vertical; }

	.insert-row { display: flex; flex-wrap: wrap; gap: 0.3rem; margin-top: 0.2rem; }
	.insert-btn {
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid var(--color-border);
		color: var(--color-text-muted);
		font-size: 0.75rem;
		padding: 0.15rem 0.5rem;
		border-radius: 999px;
		cursor: pointer;
	}
	.insert-btn:hover { background: rgba(255, 255, 255, 0.08); color: var(--color-text); }

	.actions { display: flex; gap: 0.75rem; margin-top: 0.5rem; }
	button:disabled { opacity: 0.6; cursor: not-allowed; }

	.preview-pane {
		position: sticky;
		top: 1rem;
		display: flex;
		flex-direction: column;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		overflow: hidden;
		background: rgba(255, 255, 255, 0.03);
		max-height: calc(100vh - 2rem);
	}
	@media (max-width: 1100px) {
		.preview-pane { position: static; max-height: none; }
	}
	.preview-header {
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--color-border);
		color: var(--color-text);
	}
	.preview-title {
		font-size: 0.85rem;
		font-weight: 600;
		margin-bottom: 0.4rem;
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		color: var(--color-text);
	}
	.spinner {
		font-size: 0.7rem;
		font-weight: 400;
		color: var(--color-text-muted);
	}
	.preview-subject-label {
		font-size: 0.65rem;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}
	.preview-subject {
		font-size: 0.85rem;
		font-weight: 500;
		margin-top: 0.1rem;
		word-break: break-word;
		color: var(--color-text);
	}
	.preview-frame-wrap {
		flex: 1;
		overflow: hidden;
		min-height: 600px;
		background: #f5f5f5;
	}
	.preview-frame-wrap iframe {
		width: 100%;
		height: 100%;
		min-height: 600px;
		border: none;
		background: #f5f5f5;
	}
</style>

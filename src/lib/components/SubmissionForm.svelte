<script lang="ts">
	interface Props {
		arrangementId: string;
		eventTitle: string;
		submissionDeadline: string;
		mode: 'create' | 'edit';
		submissionId?: string;
		editToken?: string;
		initial?: {
			speakerName: string;
			speakerEmail: string;
			speakerBio: string;
			title: string;
			description: string;
			equipmentRequirements: string;
			ageMin: number;
			ageMax: number;
			maxParticipants: number;
		};
	}

	let { arrangementId, eventTitle, submissionDeadline, mode, submissionId, editToken, initial }: Props = $props();

	let speakerName = $state(initial?.speakerName ?? '');
	let speakerEmail = $state(initial?.speakerEmail ?? '');
	let speakerBio = $state(initial?.speakerBio ?? '');
	let title = $state(initial?.title ?? '');
	let description = $state(initial?.description ?? '');
	let equipmentRequirements = $state(initial?.equipmentRequirements ?? '');
	let ageMin = $state(initial?.ageMin ?? 6);
	let ageMax = $state(initial?.ageMax ?? 12);
	let maxParticipants = $state(initial?.maxParticipants ?? 15);
	let submitting = $state(false);
	let result = $state<{ success: boolean; message: string; redirectUrl?: string } | null>(null);
	let errors = $state<Record<string, string>>({});

	const deadlineStr = $derived(
		new Date(submissionDeadline).toLocaleDateString('nb-NO', {
			day: 'numeric', month: 'long', year: 'numeric'
		})
	);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		errors = {};
		submitting = true;
		result = null;

		const payload = {
			submission: {
				arrangementId,
				speakerName,
				speakerEmail,
				speakerBio,
				title,
				description,
				equipmentRequirements: equipmentRequirements || undefined,
				ageMin,
				ageMax,
				maxParticipants
			}
		};

		try {
			const url = mode === 'edit'
				? `/api/submissions/${submissionId}?token=${editToken}`
				: '/api/submissions';

			const res = await fetch(url, {
				method: mode === 'edit' ? 'PATCH' : 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			const data = await res.json();

			if (!res.ok) {
				if (data.errors) {
					errors = data.errors;
				} else {
					result = { success: false, message: data.message || 'Noe gikk galt' };
				}
			} else {
				if (mode === 'create') {
					const sid = data.submission.submissionId;
					result = {
						success: true,
						message: 'Forslaget ditt er sendt inn!',
						redirectUrl: `/arrangementer/${arrangementId}/innlegg/${sid}/bekreftelse`
					};
				} else {
					result = { success: true, message: 'Endringene er lagret!' };
				}
			}
		} catch {
			result = { success: false, message: 'Kunne ikke sende. Prøv igjen.' };
		} finally {
			submitting = false;
		}
	}
</script>

{#if result?.success}
	<div class="card success-card">
		<h3>{result.message}</h3>
		{#if mode === 'create'}
			<p>Du vil motta en e-post med en lenke for å redigere forslaget ditt. Du kan redigere frem til {deadlineStr}.</p>
			<p class="muted">Vi gir deg beskjed på <strong>{speakerEmail}</strong> når forslaget er vurdert.</p>
		{:else}
			<p>Endringene dine er lagret. Du kan fortsette å redigere frem til {deadlineStr}.</p>
		{/if}
		<div class="success-actions">
			{#if result.redirectUrl}
				<a href={result.redirectUrl} class="btn btn-primary">Se bekreftelse</a>
			{/if}
			<a href="/arrangementer/{arrangementId}" class="btn btn-outline">Tilbake til arrangementet</a>
		</div>
	</div>
{:else}
	<form onsubmit={handleSubmit} class="submission-form">
		{#if result && !result.success}
			<div class="error-banner">{result.message}</div>
		{/if}

		<h3>Om deg</h3>

		<div class="form-row">
			<div class="form-group">
				<label for="speakerName">Navn</label>
				<input id="speakerName" bind:value={speakerName} required />
				{#if errors.speakerName}<span class="error-text">{errors.speakerName}</span>{/if}
			</div>
			<div class="form-group">
				<label for="speakerEmail">E-post</label>
				<input id="speakerEmail" type="email" bind:value={speakerEmail} required />
				{#if errors.speakerEmail}<span class="error-text">{errors.speakerEmail}</span>{/if}
			</div>
		</div>

		<div class="form-group">
			<label for="speakerBio">Bio</label>
			<textarea id="speakerBio" bind:value={speakerBio} rows="3" required placeholder="Fortell litt om deg selv og din erfaring..."></textarea>
			{#if errors.speakerBio}<span class="error-text">{errors.speakerBio}</span>{/if}
		</div>

		<h3>Om kurset</h3>

		<div class="form-group">
			<label for="title">Tittel</label>
			<input id="title" bind:value={title} required />
			{#if errors.title}<span class="error-text">{errors.title}</span>{/if}
		</div>

		<div class="form-group">
			<label for="description">Beskrivelse (Markdown)</label>
			<textarea id="description" bind:value={description} rows="6" required placeholder="Beskriv hva kurset handler om, hva barna vil lære..."></textarea>
			{#if errors.description}<span class="error-text">{errors.description}</span>{/if}
		</div>

		<div class="form-group">
			<label for="equipmentRequirements">Utstyrsbehov (valgfritt)</label>
			<input id="equipmentRequirements" bind:value={equipmentRequirements} placeholder="F.eks. laptop med USB-port" />
		</div>

		<div class="form-row form-row-3">
			<div class="form-group">
				<label for="ageMin">Min. alder</label>
				<input id="ageMin" type="number" bind:value={ageMin} min="3" max="18" required />
				{#if errors.ageMin}<span class="error-text">{errors.ageMin}</span>{/if}
			</div>
			<div class="form-group">
				<label for="ageMax">Maks alder</label>
				<input id="ageMax" type="number" bind:value={ageMax} min="3" max="18" required />
				{#if errors.ageMax}<span class="error-text">{errors.ageMax}</span>{/if}
			</div>
			<div class="form-group">
				<label for="maxParticipants">Maks deltakere</label>
				<input id="maxParticipants" type="number" bind:value={maxParticipants} min="1" required />
				{#if errors.maxParticipants}<span class="error-text">{errors.maxParticipants}</span>{/if}
			</div>
		</div>

		<button type="submit" class="btn btn-primary" disabled={submitting}>
			{submitting ? 'Sender...' : mode === 'edit' ? 'Lagre endringer' : 'Send inn forslag'}
		</button>
	</form>
{/if}

<style>
	.submission-form { max-width: 600px; }
	.success-card { max-width: 600px; text-align: center; }
	.success-card h3 { margin-bottom: 0.5rem; }
	.success-card p { color: var(--color-text-muted); margin-bottom: 0.75rem; }
	.muted { font-size: 0.9rem; }
	.error-banner {
		background: rgba(231, 76, 60, 0.15);
		border: 1px solid var(--color-error);
		border-radius: var(--radius);
		padding: 0.8rem 1rem;
		color: var(--color-error);
		margin-bottom: 1rem;
	}
	.success-actions { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; margin-top: 1rem; }
	h3 { margin: 1.5rem 0 0.75rem; }
	h3:first-of-type { margin-top: 0; }
	.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
	.form-row-3 { grid-template-columns: repeat(3, 1fr); }
	button:disabled { opacity: 0.6; cursor: not-allowed; }
	@media (max-width: 768px) {
		.form-row, .form-row-3 { grid-template-columns: 1fr; }
	}
</style>

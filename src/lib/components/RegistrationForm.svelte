<script lang="ts">
	interface Props {
		courseId: string;
		ageMin: number;
		ageMax: number;
	}

	let { courseId, ageMin, ageMax }: Props = $props();

	let parentName = $state('');
	let parentEmail = $state('');
	let parentPhone = $state('');
	let childName = $state('');
	let childAge = $state<number>(Math.round((ageMin + ageMax) / 2));
	let consentGiven = $state(false);
	let submitting = $state(false);
	let result = $state<{ success: boolean; message: string; confirmUrl?: string } | null>(null);
	let errors = $state<Record<string, string>>({});

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		errors = {};
		submitting = true;
		result = null;

		try {
			const res = await fetch('/api/registrations', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					registration: {
						courseId,
						parentName,
						parentEmail,
						parentPhone,
						childName,
						childAge
					}
				})
			});

			const data = await res.json();

			if (!res.ok) {
				if (data.errors) {
					errors = data.errors;
				} else {
					result = { success: false, message: data.message || 'Noe gikk galt' };
				}
			} else {
				const reg = data.registration;
				result = {
					success: true,
					message: reg.status === 'waitlisted'
						? `${childName} er satt på venteliste (posisjon ${reg.waitlistPosition}). Bekreftelse sendt til ${parentEmail}.`
						: `${childName} er påmeldt! Bekreftelse sendt til ${parentEmail}.`,
					confirmUrl: `/bekreftelse/${reg.registrationId}?token=${reg.cancellationToken}`
				};
			}
		} catch {
			result = { success: false, message: 'Kunne ikke sende påmelding. Prøv igjen.' };
		} finally {
			submitting = false;
		}
	}
</script>

{#if result?.success}
	<div class="card success-card">
		<h3>{result.message.includes('venteliste') ? 'Venteliste' : 'Påmeldt!'}</h3>
		<p>{result.message}</p>
		<div class="success-actions">
			{#if result.confirmUrl}
				<a href={result.confirmUrl} class="btn btn-primary">Se bekreftelse</a>
			{/if}
			<a href="/arrangementer" class="btn btn-outline">Tilbake til arrangementer</a>
		</div>
	</div>
{:else}
	<form onsubmit={handleSubmit} class="registration-form">
		{#if result && !result.success}
			<div class="error-banner">{result.message}</div>
		{/if}

		<div class="form-group">
			<label for="childName">Barnets navn</label>
			<input id="childName" bind:value={childName} required />
			{#if errors.childName}<span class="error-text">{errors.childName}</span>{/if}
		</div>

		<div class="form-group">
			<label for="childAge">Barnets alder: <strong class="age-display">{childAge} år</strong></label>
			<div class="slider-wrap">
				<span class="slider-label">{ageMin}</span>
				<input
					id="childAge"
					type="range"
					min={ageMin}
					max={ageMax}
					step="1"
					bind:value={childAge}
				/>
				<span class="slider-label">{ageMax}</span>
			</div>
			{#if errors.childAge}<span class="error-text">{errors.childAge}</span>{/if}
		</div>

		<div class="form-group">
			<label for="parentName">Foresattes navn</label>
			<input id="parentName" bind:value={parentName} required />
			{#if errors.parentName}<span class="error-text">{errors.parentName}</span>{/if}
		</div>

		<div class="form-group">
			<label for="parentEmail">E-post</label>
			<input id="parentEmail" type="email" bind:value={parentEmail} required />
			{#if errors.parentEmail}<span class="error-text">{errors.parentEmail}</span>{/if}
		</div>

		<div class="form-group">
			<label for="parentPhone">Telefon</label>
			<input id="parentPhone" type="tel" bind:value={parentPhone} required />
			{#if errors.parentPhone}<span class="error-text">{errors.parentPhone}</span>{/if}
		</div>

		<div class="form-group consent-group">
			<label class="consent-label">
				<input type="checkbox" bind:checked={consentGiven} required />
				<span>Jeg samtykker til at javaBin lagrer opplysningene for å administrere påmeldingen. <a href="/personvern" target="_blank">Les personvernerklæringen</a>.</span>
			</label>
		</div>

		<button type="submit" class="btn btn-primary" disabled={submitting || !consentGiven}>
			{submitting ? 'Sender...' : 'Meld på'}
		</button>
	</form>
{/if}

<style>
	.registration-form {
		max-width: 500px;
	}

	.success-card {
		max-width: 500px;
		text-align: center;
	}

	.success-card h3 {
		margin-bottom: 0.5rem;
	}

	.success-card p {
		color: var(--color-text-muted);
		margin-bottom: 1.5rem;
	}

	.error-banner {
		background: rgba(231, 76, 60, 0.15);
		border: 1px solid var(--color-error);
		border-radius: var(--radius);
		padding: 0.8rem 1rem;
		color: var(--color-error);
		margin-bottom: 1rem;
	}

	.success-actions {
		display: flex;
		gap: 0.75rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.consent-group {
		margin-bottom: 1.5rem;
	}

	.consent-label {
		display: flex;
		gap: 0.5rem;
		align-items: flex-start;
		cursor: pointer;
		font-size: 0.85rem;
		color: var(--color-text-muted);
		font-weight: 400;
	}

	.consent-label input[type="checkbox"] {
		width: auto;
		margin-top: 0.15rem;
		flex-shrink: 0;
	}

	.consent-label a {
		color: var(--color-accent);
	}

	button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.age-display {
		color: var(--color-heading);
		font-size: 1.1rem;
	}

	.slider-wrap {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.slider-label {
		color: var(--color-text-muted);
		font-size: 0.85rem;
		font-weight: 600;
		min-width: 1.5rem;
		text-align: center;
	}

	input[type="range"] {
		-webkit-appearance: none;
		appearance: none;
		width: 100%;
		height: 8px;
		border-radius: 4px;
		background: var(--color-border);
		border: none;
		padding: 0;
		cursor: pointer;
	}

	input[type="range"]:focus {
		outline: none;
	}

	input[type="range"]::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background: var(--color-accent);
		border: 3px solid var(--color-bg-deep);
		box-shadow: 0 0 0 2px var(--color-accent);
		cursor: pointer;
		transition: transform 0.15s;
	}

	input[type="range"]::-webkit-slider-thumb:hover {
		transform: scale(1.15);
	}

	input[type="range"]::-moz-range-thumb {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background: var(--color-accent);
		border: 3px solid var(--color-bg-deep);
		box-shadow: 0 0 0 2px var(--color-accent);
		cursor: pointer;
	}
</style>

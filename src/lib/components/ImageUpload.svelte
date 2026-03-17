<script lang="ts">
	interface Props {
		value: string;
		onchange: (url: string) => void;
	}

	let { value, onchange }: Props = $props();
	let uploading = $state(false);
	let dragover = $state(false);

	async function uploadFile(file: File) {
		uploading = true;
		const formData = new FormData();
		formData.append('file', file);

		try {
			const res = await fetch('/api/images', { method: 'POST', body: formData });
			if (!res.ok) {
				const data = await res.json();
				alert(data.message || 'Opplasting feilet');
				return;
			}
			const data = await res.json();
			onchange(data.url);
		} catch {
			alert('Kunne ikke laste opp bilde');
		} finally {
			uploading = false;
		}
	}

	function handleFileInput(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files?.[0]) uploadFile(input.files[0]);
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		dragover = false;
		if (e.dataTransfer?.files?.[0]) uploadFile(e.dataTransfer.files[0]);
	}
</script>

<div
	class="upload-area"
	class:dragover
	ondragover={(e) => { e.preventDefault(); dragover = true; }}
	ondragleave={() => dragover = false}
	ondrop={handleDrop}
	role="button"
	tabindex="0"
>
	{#if value}
		<div class="preview">
			<img src={value} alt="Opplastet bilde" />
			<button type="button" class="remove-btn" onclick={() => onchange('')}>&times;</button>
		</div>
	{:else if uploading}
		<p class="upload-text">Laster opp...</p>
	{:else}
		<label class="upload-label">
			<p class="upload-text">Dra et bilde hit, eller klikk for å velge</p>
			<p class="upload-hint">JPG, PNG, WebP eller GIF. Maks 5MB.</p>
			<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onchange={handleFileInput} hidden />
		</label>
	{/if}
</div>

<style>
	.upload-area {
		border: 2px dashed var(--color-border);
		border-radius: var(--radius);
		padding: 1.5rem;
		text-align: center;
		transition: border-color 0.2s, background 0.2s;
		cursor: pointer;
	}

	.upload-area.dragover {
		border-color: var(--color-heading);
		background: rgba(126, 200, 200, 0.05);
	}

	.upload-label {
		cursor: pointer;
		display: block;
	}

	.upload-text {
		color: var(--color-text-muted);
		font-size: 0.9rem;
	}

	.upload-hint {
		color: var(--color-text-muted);
		font-size: 0.8rem;
		opacity: 0.7;
		margin-top: 0.25rem;
	}

	.preview {
		position: relative;
		display: inline-block;
	}

	.preview img {
		max-width: 100%;
		max-height: 200px;
		border-radius: var(--radius);
	}

	.remove-btn {
		position: absolute;
		top: -8px;
		right: -8px;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: var(--color-error);
		color: white;
		border: none;
		font-size: 1rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>

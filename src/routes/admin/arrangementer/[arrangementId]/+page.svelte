<script lang="ts">
	import type { PageData } from './$types';
	import { invalidateAll, goto } from '$app/navigation';
	import { toast } from '$lib/toast.svelte';
	import ImageUpload from '$lib/components/ImageUpload.svelte';

	let { data }: { data: PageData } = $props();
	let sendingReminder = $state(false);

	async function sendReminder() {
		if (!confirm('Sende påminnelse til alle bekreftede deltakere?')) return;
		sendingReminder = true;
		try {
			const res = await fetch(`/api/admin/remind/${data.event.arrangementId}`, { method: 'POST' });
			const result = await res.json();
			toast.show(`Påminnelse sendt til ${result.sentCount} deltakere`);
		} catch {
			toast.show('Kunne ikke sende påminnelser', 'error');
		}
		sendingReminder = false;
	}

	// Event edit state
	let showEditForm = $state(false);
	let editTitle = $state(data.event.title);
	let editDescription = $state(data.event.description);
	let editDate = $state(toLocalDatetime(data.event.date));
	let editLocation = $state(data.event.location);
	let editRegOpens = $state(toLocalDatetime(data.event.registrationOpens));
	let editRegCloses = $state(toLocalDatetime(data.event.registrationCloses));
	let editImageUrl = $state(data.event.imageUrl ?? '');
	let saving = $state(false);

	function toLocalDatetime(d: string | Date): string {
		const date = new Date(d);
		const offset = date.getTimezoneOffset();
		const local = new Date(date.getTime() - offset * 60000);
		return local.toISOString().slice(0, 16);
	}

	async function saveEvent(e: SubmitEvent) {
		e.preventDefault();
		saving = true;

		await fetch(`/api/events/${data.event.arrangementId}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				event: {
					title: editTitle,
					description: editDescription,
					date: new Date(editDate).toISOString(),
					location: editLocation,
					registrationOpens: new Date(editRegOpens).toISOString(),
					registrationCloses: new Date(editRegCloses).toISOString(),
					imageUrl: editImageUrl || null
				}
			})
		});

		saving = false;
		showEditForm = false;
		toast.show('Arrangement lagret');
		invalidateAll();
	}

	// Course form state
	let showCourseForm = $state(false);
	let courseTitle = $state('');
	let courseIntro = $state('');
	let courseDesc = $state('');
	let courseThumbnail = $state('');
	let ageMin = $state(6);
	let ageMax = $state(12);
	let maxParticipants = $state(20);
	let submitting = $state(false);

	// Course edit state
	let editingCourseId = $state<string | null>(null);
	let editCourseTitle = $state('');
	let editCourseIntro = $state('');
	let editCourseDesc = $state('');
	let editCourseThumbnail = $state('');
	let editAgeMin = $state(6);
	let editAgeMax = $state(12);
	let editMaxParticipants = $state(20);
	let savingCourse = $state(false);

	// Expanded course (show registrations)
	let expandedCourseId = $state<string | null>(null);

	function startEditCourse(course: typeof data.courses[0]) {
		editingCourseId = course.courseId;
		editCourseTitle = course.title;
		editCourseIntro = course.introduction;
		editCourseDesc = course.description;
		editCourseThumbnail = course.thumbnailUrl ?? '';
		editAgeMin = course.ageMin;
		editAgeMax = course.ageMax;
		editMaxParticipants = course.maxParticipants;
	}

	async function saveCourse(e: SubmitEvent) {
		e.preventDefault();
		if (!editingCourseId) return;
		savingCourse = true;

		await fetch(`/api/courses/${editingCourseId}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				course: {
					title: editCourseTitle,
					introduction: editCourseIntro,
					description: editCourseDesc,
					thumbnailUrl: editCourseThumbnail || null,
					ageMin: editAgeMin,
					ageMax: editAgeMax,
					maxParticipants: editMaxParticipants
				}
			})
		});

		savingCourse = false;
		editingCourseId = null;
		toast.show('Kurs lagret');
		invalidateAll();
	}

	async function addCourse(e: SubmitEvent) {
		e.preventDefault();
		submitting = true;

		const res = await fetch('/api/courses', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				course: {
					arrangementId: data.event.arrangementId,
					title: courseTitle,
					introduction: courseIntro,
					description: courseDesc,
					thumbnailUrl: courseThumbnail || undefined,
					ageMin,
					ageMax,
					maxParticipants
				}
			})
		});

		if (res.ok) {
			showCourseForm = false;
			courseTitle = courseIntro = courseDesc = courseThumbnail = '';
			ageMin = 6; ageMax = 12; maxParticipants = 20;
			toast.show('Kurs opprettet');
			invalidateAll();
		} else {
			toast.show('Kunne ikke opprette kurs', 'error');
		}
		submitting = false;
	}

	async function toggleCancelled() {
		const willCancel = !data.event.cancelled;
		await fetch(`/api/events/${data.event.arrangementId}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ event: { cancelled: willCancel } })
		});
		toast.show(willCancel ? 'Arrangement avlyst' : 'Arrangement gjenåpnet');
		invalidateAll();
	}

	async function deleteEvent() {
		if (!confirm('Er du sikker på at du vil slette dette arrangementet?')) return;
		const res = await fetch(`/api/events/${data.event.arrangementId}`, { method: 'DELETE' });
		if (res.ok) {
			toast.show('Arrangement slettet');
			goto('/admin/arrangementer');
		} else {
			toast.show('Kan ikke slette arrangement med aktive påmeldinger', 'error');
		}
	}

	async function deleteCourse(courseId: string) {
		if (!confirm('Slette dette kurset?')) return;
		const res = await fetch(`/api/courses/${courseId}`, { method: 'DELETE' });
		if (res.ok) {
			toast.show('Kurs slettet');
			invalidateAll();
		} else {
			toast.show('Kan ikke slette kurs med aktive påmeldinger', 'error');
		}
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

<a href="/admin/arrangementer" class="back-link">&larr; Tilbake</a>

<div class="header-row">
	<h1>{data.event.title}</h1>
	<div class="actions">
		<button class="btn btn-outline" onclick={() => showEditForm = !showEditForm}>
			{showEditForm ? 'Avbryt' : 'Rediger'}
		</button>
		<button class="btn btn-outline" onclick={sendReminder} disabled={sendingReminder}>
			{sendingReminder ? 'Sender...' : 'Send påminnelse'}
		</button>
		<button class="btn btn-outline" onclick={toggleCancelled}>
			{data.event.cancelled ? 'Gjenåpne' : 'Avlys'}
		</button>
		<button class="btn btn-outline danger" onclick={deleteEvent}>Slett</button>
	</div>
</div>

{#if showEditForm}
	<form class="card form-card" onsubmit={saveEvent}>
		<div class="form-group">
			<label for="eTitle">Tittel</label>
			<input id="eTitle" bind:value={editTitle} required />
		</div>
		<div class="form-group">
			<label for="eDesc">Beskrivelse</label>
			<textarea id="eDesc" bind:value={editDescription} rows="3" required></textarea>
		</div>
		<div class="form-row">
			<div class="form-group">
				<label for="eDate">Dato</label>
				<input id="eDate" type="datetime-local" bind:value={editDate} required />
			</div>
			<div class="form-group">
				<label for="eLoc">Sted</label>
				<input id="eLoc" bind:value={editLocation} required />
			</div>
		</div>
		<div class="form-row">
			<div class="form-group">
				<label for="eRegOpens">Påmelding åpner</label>
				<input id="eRegOpens" type="datetime-local" bind:value={editRegOpens} required />
			</div>
			<div class="form-group">
				<label for="eRegCloses">Påmelding stenger</label>
				<input id="eRegCloses" type="datetime-local" bind:value={editRegCloses} required />
			</div>
		</div>
		<div class="form-group">
			<label for="eImg">Bilde-URL (valgfritt)</label>
			<input id="eImg" bind:value={editImageUrl} placeholder="https://..." />
		</div>
		<button type="submit" class="btn btn-primary" disabled={saving}>
			{saving ? 'Lagrer...' : 'Lagre endringer'}
		</button>
	</form>
{/if}

<h2>Kurs</h2>
<button class="btn btn-primary btn-sm" onclick={() => showCourseForm = !showCourseForm}>
	{showCourseForm ? 'Avbryt' : 'Legg til kurs'}
</button>

{#if showCourseForm}
	<form class="card form-card" onsubmit={addCourse}>
		<div class="form-group">
			<label for="cTitle">Tittel</label>
			<input id="cTitle" bind:value={courseTitle} required />
		</div>
		<div class="form-group">
			<label for="cIntro">Innledning (vises på arrangement-siden)</label>
			<textarea id="cIntro" bind:value={courseIntro} rows="2"></textarea>
		</div>
		<div class="form-group">
			<label for="cDesc">Innhold (Markdown, vises på kurs-siden)</label>
			<textarea id="cDesc" bind:value={courseDesc} rows="4" required></textarea>
		</div>
		<div class="form-group">
			<label>Thumbnail (valgfritt)</label>
			<ImageUpload value={courseThumbnail} onchange={(url) => courseThumbnail = url} />
		</div>
		<div class="form-row form-row-3">
			<div class="form-group">
				<label for="ageMin">Min alder</label>
				<input id="ageMin" type="number" bind:value={ageMin} min="3" max="18" required />
			</div>
			<div class="form-group">
				<label for="ageMax">Maks alder</label>
				<input id="ageMax" type="number" bind:value={ageMax} min="3" max="18" required />
			</div>
			<div class="form-group">
				<label for="maxP">Maks deltakere</label>
				<input id="maxP" type="number" bind:value={maxParticipants} min="1" required />
			</div>
		</div>
		<button type="submit" class="btn btn-primary" disabled={submitting}>Legg til</button>
	</form>
{/if}

<div class="courses-list">
	{#each data.courses as course (course.courseId)}
		<div class="card course-card-admin">
			{#if editingCourseId === course.courseId}
				<form onsubmit={saveCourse}>
					<div class="form-group">
						<label for="ecTitle">Tittel</label>
						<input id="ecTitle" bind:value={editCourseTitle} required />
					</div>
					<div class="form-group">
						<label for="ecIntro">Innledning</label>
						<textarea id="ecIntro" bind:value={editCourseIntro} rows="2"></textarea>
					</div>
					<div class="form-group">
						<label for="ecDesc">Innhold (Markdown)</label>
						<textarea id="ecDesc" bind:value={editCourseDesc} rows="4" required></textarea>
					</div>
					<div class="form-group">
						<label>Thumbnail</label>
						<ImageUpload value={editCourseThumbnail} onchange={(url) => editCourseThumbnail = url} />
					</div>
					<div class="form-row form-row-3">
						<div class="form-group">
							<label for="ecAgeMin">Min alder</label>
							<input id="ecAgeMin" type="number" bind:value={editAgeMin} min="3" max="18" required />
						</div>
						<div class="form-group">
							<label for="ecAgeMax">Maks alder</label>
							<input id="ecAgeMax" type="number" bind:value={editAgeMax} min="3" max="18" required />
						</div>
						<div class="form-group">
							<label for="ecMaxP">Maks deltakere</label>
							<input id="ecMaxP" type="number" bind:value={editMaxParticipants} min="1" required />
						</div>
					</div>
					<div class="edit-actions">
						<button type="submit" class="btn btn-primary btn-sm" disabled={savingCourse}>Lagre</button>
						<button type="button" class="btn btn-outline btn-sm" onclick={() => editingCourseId = null}>Avbryt</button>
					</div>
				</form>
			{:else}
				<div class="course-header-row">
					<div>
						<strong>{course.title}</strong>
						<span class="meta">{course.ageMin}–{course.ageMax} år | {course.confirmedCount}/{course.maxParticipants} påmeldt</span>
					</div>
					<div class="course-actions">
						<button class="btn btn-outline btn-sm" onclick={() => expandedCourseId = expandedCourseId === course.courseId ? null : course.courseId}>
							{expandedCourseId === course.courseId ? 'Skjul' : 'Vis'} påmeldte ({course.confirmedCount})
						</button>
						<button class="btn btn-outline btn-sm" onclick={() => startEditCourse(course)}>Rediger</button>
						<button class="btn btn-outline btn-sm danger" onclick={() => deleteCourse(course.courseId)}>Slett</button>
					</div>
				</div>

				{#if expandedCourseId === course.courseId}
					{@const regs = data.courseRegistrations[course.courseId] ?? []}
					{#if regs.length === 0}
						<p class="no-regs">Ingen påmeldinger ennå.</p>
					{:else}
						<div class="regs-table-wrap">
							<table class="regs-table">
								<thead>
									<tr>
										<th>Barn</th>
										<th>Alder</th>
										<th>Foresatt</th>
										<th>E-post</th>
										<th>Status</th>
										<th></th>
									</tr>
								</thead>
								<tbody>
									{#each regs as reg}
										<tr>
											<td>{reg.childName}</td>
											<td>{reg.childAge}</td>
											<td>{reg.parentName}</td>
											<td>{reg.parentEmail}</td>
											<td>
												{#if reg.status === 'confirmed'}
													<span class="badge badge-success">Bekreftet</span>
												{:else if reg.status === 'waitlisted'}
													<span class="badge badge-warning">Venteliste ({reg.waitlistPosition})</span>
												{/if}
											</td>
											<td>
												<button class="btn btn-outline btn-sm danger" onclick={() => cancelRegistration(reg.registrationId)}>Avbestill</button>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{/if}
				{/if}
			{/if}
		</div>
	{/each}
</div>

<style>
	.back-link {
		display: inline-block;
		margin-bottom: 1rem;
		color: var(--color-text-muted);
	}

	.header-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }

	h2 { margin: 2rem 0 0.75rem; }

	.form-card { margin: 1rem 0; padding: 1.5rem; }

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.form-row-3 {
		grid-template-columns: repeat(3, 1fr);
	}

	.courses-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-top: 1rem;
	}

	.course-card-admin {
		padding: 1rem 1.5rem;
	}

	.course-header-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.course-actions {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
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

	.no-regs {
		color: var(--color-text-muted);
		font-style: italic;
		margin-top: 0.75rem;
		font-size: 0.9rem;
	}

	.regs-table-wrap {
		overflow-x: auto;
		margin-top: 0.75rem;
	}

	.regs-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.85rem;
	}

	.regs-table th,
	.regs-table td {
		padding: 0.5rem 0.75rem;
		text-align: left;
		border-bottom: 1px solid var(--color-border);
	}

	.regs-table th {
		color: var(--color-text-muted);
		font-weight: 600;
		font-size: 0.8rem;
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
		.form-row, .form-row-3 {
			grid-template-columns: 1fr;
		}
	}
</style>

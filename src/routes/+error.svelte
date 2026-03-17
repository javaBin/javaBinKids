<script lang="ts">
	import { page } from '$app/state';
</script>

<div class="container error-page">
	<h1>{page.status}</h1>
	<p>{page.error?.message || 'Noe gikk galt'}</p>
	<a href="/" class="btn btn-outline">Tilbake til forsiden</a>
</div>

<style>
	.error-page {
		text-align: center;
		padding: 6rem 1.5rem;
	}

	h1 {
		font-size: 5rem;
		margin-bottom: 0.5rem;
	}

	p {
		font-size: 1.3rem;
		color: var(--color-text-muted);
		margin-bottom: 2rem;
	}
</style>

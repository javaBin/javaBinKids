<script lang="ts">
	import '../app.css';
	import { afterNavigate } from '$app/navigation';
	import Nav from '$lib/components/Nav.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Bubbles from '$lib/components/Bubbles.svelte';

	let { children } = $props();
	let mainEl: HTMLElement;

	afterNavigate(() => {
		mainEl?.scrollTo(0, 0);
	});
</script>

<svelte:head>
	<meta name="description" content="Kode-arrangementer for barn i regi av javaBin og JavaZone" />
	<meta property="og:site_name" content="javaBin Kids" />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="javaBin Kids — Koding for barn" />
	<meta property="og:description" content="Kode-arrangementer for barn i regi av javaBin og JavaZone" />
	<meta name="theme-color" content="#1a2f3a" />
</svelte:head>

<Bubbles />
<div class="app-shell">
	<Nav />
	<main bind:this={mainEl}>
		{@render children()}
	</main>
	<Footer />
</div>

<style>
	.app-shell {
		display: flex;
		flex-direction: column;
		height: 100vh;
		position: relative;
		z-index: 1;
	}

	main {
		flex: 1;
		overflow-y: auto;
	}
</style>

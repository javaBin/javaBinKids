<script lang="ts">
	import { page } from '$app/state';

	const links = [
		{ href: '/arrangementer', label: 'Arrangementer' },
		{ href: '/om', label: 'Om' },
		{ href: '/kontakt', label: 'Kontakt' }
	];

	let menuOpen = $state(false);
</script>

<header class="header">
	<nav class="nav">
		<div class="nav-inner container">
			<a href="/" class="logo">javaBin Kids</a>

			<button class="menu-toggle" onclick={() => menuOpen = !menuOpen} aria-label="Meny">
				<span class="hamburger" class:open={menuOpen}></span>
			</button>

			<ul class="nav-links" class:open={menuOpen}>
				{#each links as link}
					<li>
						<a
							href={link.href}
							class:active={page.url.pathname.startsWith(link.href)}
							onclick={() => menuOpen = false}
						>
							{link.label}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	</nav>

	<div class="waves-container">
		<svg class="wave wave-1" viewBox="0 0 1440 120" preserveAspectRatio="none">
			<path d="M0,80 C200,40 400,100 600,60 C800,20 1000,90 1200,50 C1300,35 1380,70 1440,60 L1440,120 L0,120Z" />
		</svg>
		<svg class="wave wave-2" viewBox="0 0 1440 120" preserveAspectRatio="none">
			<path d="M0,60 C150,90 350,30 550,70 C750,110 950,40 1150,80 C1300,100 1400,50 1440,70 L1440,120 L0,120Z" />
		</svg>
		<svg class="wave wave-3" viewBox="0 0 1440 120" preserveAspectRatio="none">
			<path d="M0,90 C250,50 450,100 650,55 C850,10 1050,80 1250,45 C1350,30 1400,60 1440,50 L1440,120 L0,120Z" />
		</svg>
		<svg class="wave wave-4" viewBox="0 0 1440 120" preserveAspectRatio="none">
			<path d="M0,70 C180,100 380,40 580,80 C780,120 980,50 1180,90 C1320,110 1400,70 1440,85 L1440,120 L0,120Z" />
		</svg>
	</div>
</header>

<style>
	.header {
		z-index: 100;
		background: linear-gradient(180deg, rgba(26, 47, 58, 0.97) 0%, rgba(20, 40, 55, 0.97) 100%);
		flex-shrink: 0;
	}

	.nav-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 64px;
	}

	.logo {
		font-family: var(--font-display);
		font-size: 1.4rem;
		font-weight: 800;
		color: var(--color-heading);
	}

	.logo:hover {
		color: var(--color-accent);
	}

	.nav-links {
		display: flex;
		list-style: none;
		gap: 2rem;
	}

	.nav-links a {
		color: var(--color-text-muted);
		font-weight: 500;
		transition: color 0.2s;
	}

	.nav-links a:hover,
	.nav-links a.active {
		color: var(--color-text);
	}

	.menu-toggle {
		display: none;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.5rem;
	}

	.hamburger {
		display: block;
		width: 24px;
		height: 2px;
		background: var(--color-text);
		position: relative;
		transition: background 0.2s;
	}

	.hamburger::before,
	.hamburger::after {
		content: '';
		position: absolute;
		width: 24px;
		height: 2px;
		background: var(--color-text);
		transition: transform 0.2s;
	}

	.hamburger::before { top: -7px; }
	.hamburger::after { top: 7px; }

	.hamburger.open {
		background: transparent;
	}

	.hamburger.open::before {
		transform: rotate(45deg);
		top: 0;
	}

	.hamburger.open::after {
		transform: rotate(-45deg);
		top: 0;
	}

	/* Waves */
	.waves-container {
		position: relative;
		height: 120px;
		overflow: hidden;
	}

	.wave {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 200%;
		height: 100%;
		fill: none;
		stroke-width: 1.2;
	}

	.wave-1 {
		stroke: rgba(126, 200, 200, 0.25);
		animation: wave-drift 12s ease-in-out infinite alternate;
	}

	.wave-2 {
		stroke: rgba(126, 200, 200, 0.18);
		animation: wave-drift 16s ease-in-out infinite alternate-reverse;
	}

	.wave-3 {
		stroke: rgba(126, 200, 200, 0.12);
		animation: wave-drift 20s ease-in-out infinite alternate;
		animation-delay: -4s;
	}

	.wave-4 {
		stroke: rgba(126, 200, 200, 0.08);
		animation: wave-drift 14s ease-in-out infinite alternate-reverse;
		animation-delay: -2s;
	}

	@keyframes wave-drift {
		0% {
			transform: translateX(0);
		}
		100% {
			transform: translateX(-50%);
		}
	}

	@media (max-width: 768px) {
		.menu-toggle { display: block; }

		.nav-links {
			display: none;
			position: absolute;
			top: 64px;
			left: 0;
			right: 0;
			background: rgba(13, 27, 42, 0.95);
			flex-direction: column;
			padding: 1rem 1.5rem;
			gap: 0;
			border-bottom: 1px solid var(--color-border);
			z-index: 10;
		}

		.nav-links.open { display: flex; }

		.nav-links li a {
			display: block;
			padding: 0.75rem 0;
		}

		.waves-container {
			height: 60px;
		}
	}
</style>

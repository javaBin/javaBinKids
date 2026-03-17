<script lang="ts">
	import { onMount } from 'svelte';

	let canvas: HTMLCanvasElement;
	let score = $state(0);
	let scorePop = $state(false);
	let popTimeout: ReturnType<typeof setTimeout>;
	let isMobile = $state(false);

	const STORAGE_KEY = 'javabinkids_bubbles_popped';

	function loadScore(): number {
		try {
			return parseInt(localStorage.getItem(STORAGE_KEY) ?? '0', 10) || 0;
		} catch {
			return 0;
		}
	}

	function saveScore(value: number) {
		try {
			localStorage.setItem(STORAGE_KEY, String(value));
		} catch {}
	}

	interface Bubble {
		x: number;
		y: number;
		radius: number;
		speed: number;
		opacity: number;
		popping: boolean;
		popScale: number;
	}

	onMount(() => {
		score = loadScore();

		const ctx = canvas.getContext('2d')!;
		let width = window.innerWidth;
		let height = window.innerHeight;
		canvas.width = width;
		canvas.height = height;

		isMobile = width < 768;

		let mouseX = width / 2;
		let mouseY = height / 2;
		let fishX = width / 2;
		let fishY = height / 2;

		const bubbles: Bubble[] = [];
		const MAX_BUBBLES = 20;
		const FISH_SIZE = 28;

		function spawnBubble() {
			if (bubbles.length >= MAX_BUBBLES) return;
			bubbles.push({
				x: Math.random() * width,
				y: height + 20 + Math.random() * 60,
				radius: 10 + Math.random() * 25,
				speed: 0.6 + Math.random() * 1.2,
				opacity: 0.08 + Math.random() * 0.15,
				popping: false,
				popScale: 1
			});
		}

		// Spawn initial bubbles spread across the screen
		for (let i = 0; i < 12; i++) {
			const b: Bubble = {
				x: Math.random() * width,
				y: Math.random() * height,
				radius: 10 + Math.random() * 25,
				speed: 0.6 + Math.random() * 1.2,
				opacity: 0.08 + Math.random() * 0.15,
				popping: false,
				popScale: 1
			};
			bubbles.push(b);
		}

		function handleMouseMove(e: MouseEvent) {
			mouseX = e.clientX;
			mouseY = e.clientY;
		}

		function handleTouchMove(e: TouchEvent) {
			mouseX = e.touches[0].clientX;
			mouseY = e.touches[0].clientY;
		}

		function handleResize() {
			width = window.innerWidth;
			height = window.innerHeight;
			canvas.width = width;
			canvas.height = height;
			isMobile = width < 768;
		}

		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('touchmove', handleTouchMove, { passive: true });
		window.addEventListener('resize', handleResize);

		let spawnTimer = 0;
		let fishFlash = 0; // 1 = full flash, fades to 0

		const dukeImg = new Image();
		dukeImg.src = '/fishduke.png';

		function drawFish(x: number, y: number) {
			if (!dukeImg.complete) return;
			const facingLeft = mouseX < fishX;
			const imgW = FISH_SIZE * 3;
			const imgH = FISH_SIZE * 3;
			const baseAlpha = 0.45;
			const alpha = baseAlpha + (1 - baseAlpha) * fishFlash;
			fishFlash = Math.max(0, fishFlash - (1 / (0.3 * 60))); // fade over 0.3s at ~60fps
			ctx.save();
			ctx.globalAlpha = alpha;
			ctx.translate(x, y);
			if (!facingLeft) ctx.scale(-1, 1);
			ctx.drawImage(dukeImg, -imgW / 2, -imgH / 2, imgW, imgH);
			ctx.restore();
		}

		function drawBubble(b: Bubble) {
			ctx.save();
			ctx.translate(b.x, b.y);
			if (b.popping) ctx.scale(b.popScale, b.popScale);

			// Bubble fill
			ctx.beginPath();
			ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
			ctx.fillStyle = `rgba(126, 200, 200, ${b.opacity})`;
			ctx.fill();
			ctx.strokeStyle = `rgba(126, 200, 200, ${b.opacity * 0.5})`;
			ctx.lineWidth = 1;
			ctx.stroke();

			// Shine highlight
			ctx.beginPath();
			ctx.arc(-b.radius * 0.3, -b.radius * 0.3, b.radius * 0.2, 0, Math.PI * 2);
			ctx.fillStyle = `rgba(255, 255, 255, ${b.opacity * 0.6})`;
			ctx.fill();

			ctx.restore();
		}

		function update() {
			ctx.clearRect(0, 0, width, height);

			// Smoothly move fish toward cursor, but stop below the header
			const headerEl = document.querySelector('header');
			const minY = (headerEl ? headerEl.offsetHeight : 0) + FISH_SIZE;
			fishX += (mouseX - fishX) * 0.06;
			fishY += (Math.max(mouseY, minY) - fishY) * 0.06;

			// Spawn new bubbles periodically
			spawnTimer++;
			if (spawnTimer > 90) {
				spawnBubble();
				spawnTimer = 0;
			}

			// Update and draw bubbles
			for (let i = bubbles.length - 1; i >= 0; i--) {
				const b = bubbles[i];

				if (b.popping) {
					b.popScale -= 0.08;
					if (b.popScale <= 0) {
						bubbles.splice(i, 1);
						continue;
					}
				} else {
					b.y -= b.speed;
					// Slight horizontal drift
					b.x += Math.sin(b.y * 0.01) * 0.3;

					// Remove if off screen
					if (b.y < -b.radius * 2) {
						bubbles.splice(i, 1);
						continue;
					}

					// Collision with fish (desktop only)
					if (!isMobile) {
						const dx = fishX - b.x;
						const dy = fishY - b.y;
						const dist = Math.sqrt(dx * dx + dy * dy);
						if (dist < b.radius + FISH_SIZE * 0.7) {
							b.popping = true;
							fishFlash = 1;
							score++;
							saveScore(score);
							clearTimeout(popTimeout);
							scorePop = false;
							requestAnimationFrame(() => {
								scorePop = true;
								popTimeout = setTimeout(() => { scorePop = false; }, 300);
							});
						}
					}
				}

				drawBubble(b);
			}

			// Draw fish on top (desktop only)
			if (!isMobile) drawFish(fishX, fishY);

			requestAnimationFrame(update);
		}

		const frameId = requestAnimationFrame(update);

		return () => {
			cancelAnimationFrame(frameId);
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('touchmove', handleTouchMove);
			window.removeEventListener('resize', handleResize);
		};
	});
</script>

<canvas bind:this={canvas} class="game-canvas" aria-hidden="true"></canvas>
{#if !isMobile}
	<div class="score" class:pop={scorePop} aria-hidden="true">Bobler sprukket: {score}</div>
{/if}

<style>
	.game-canvas {
		position: fixed;
		inset: 0;
		z-index: 0;
		pointer-events: none;
	}

	.score {
		position: fixed;
		bottom: 16px;
		right: 20px;
		z-index: 0;
		font-family: 'Nunito', sans-serif;
		font-size: 1.1rem;
		font-weight: 700;
		color: rgba(126, 200, 200, 0.45);
		pointer-events: none;
		user-select: none;
		transform-origin: bottom right;
		transition: transform 0.3s ease-out, color 0.3s ease-out;
	}

	.score.pop {
		transform: scale(1.4);
		color: rgba(255, 255, 255, 0.9);
	}
</style>

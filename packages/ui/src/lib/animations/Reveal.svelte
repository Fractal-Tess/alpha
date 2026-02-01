<script lang="ts">
	import type { TransitionConfig } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { onMount } from 'svelte';
	import type { AnimationDirection } from './animate.js';
	import type { Snippet } from 'svelte';
	
	/**
	 * Props for the Reveal component
	 * Combines fade, slide, scale, and blur effects
	 */
	interface Props {
		/** Direction to reveal from */
		direction?: AnimationDirection;
		/** Distance to move (px) */
		distance?: number;
		/** Scale start (0-1) */
		scaleStart?: number;
		/** Blur amount at start (px) */
		blurStart?: number;
		/** Delay before animation starts (ms) */
		delay?: number;
		/** Animation duration (ms) */
		duration?: number;
		/** Whether to animate on mount */
		animateOnMount?: boolean;
		/** Whether to animate on destroy */
		animateOnDestroy?: boolean;
		/** Custom CSS class */
		class?: string;
		/** Child content snippet */
		children: Snippet;
	}

	let {
		direction = 'up',
		distance = 30,
		scaleStart = 0.95,
		blurStart = 0,
		delay = 0,
		duration = 400,
		animateOnMount = true,
		animateOnDestroy = true,
		class: className = '',
		children,
	}: Props = $props();

	let show = $state(false);

	onMount(() => {
		if (animateOnMount) {
			if (delay > 0) {
				setTimeout(() => { show = true; }, delay);
			} else {
				show = true;
			}
		} else {
			show = true;
		}
	});

	/**
	 * Custom reveal transition combining multiple effects
	 */
	function revealTransition(node: Element): TransitionConfig {
		const style = getComputedStyle(node);
		const transform = style.transform === 'none' ? '' : style.transform;
		
		// Calculate translate values based on direction
		let tx = 0, ty = 0;
		switch (direction) {
			case 'up':
				ty = distance;
				break;
			case 'down':
				ty = -distance;
				break;
			case 'left':
				tx = distance;
				break;
			case 'right':
				tx = -distance;
				break;
			case 'none':
			default:
				break;
		}

		return {
			duration,
			easing: cubicOut,
			css: (t: number) => {
				const scale = scaleStart + (1 - scaleStart) * t;
				const blur = blurStart * (1 - t);
				const currentTx = tx * (1 - t);
				const currentTy = ty * (1 - t);
				
				return `
					opacity: ${t};
					transform: ${transform} translate3d(${currentTx}px, ${currentTy}px, 0) scale(${scale});
					filter: blur(${blur}px);
				`;
			},
		};
	}
</script>

{#if show}
	<div
		class={className}
		in:revealTransition
		out:revealTransition
	>
		{@render children()}
	</div>
{:else}
	<div class={className}>
		{@render children()}
	</div>
{/if}

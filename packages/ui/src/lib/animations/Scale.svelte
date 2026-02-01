<script lang="ts">
	import { scale as svelteScale, type ScaleParams } from 'svelte/transition';
	import { cubicOut, elasticOut } from 'svelte/easing';
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	
	/**
	 * Props for the Scale component
	 */
	interface Props {
		/** Starting scale (0-1) */
		start?: number;
		/** Ending scale (usually 1) */
		end?: number;
		/** Delay before animation starts (ms) */
		delay?: number;
		/** Animation duration (ms) */
		duration?: number;
		/** Use bounce easing for a pop effect */
		bounce?: boolean;
		/** Whether to animate on mount */
		animateOnMount?: boolean;
		/** Custom CSS class */
		class?: string;
		/** Child content snippet */
		children: Snippet;
	}

	let {
		start = 0.95,
		end = 1,
		delay = 0,
		duration = 300,
		bounce = false,
		animateOnMount = true,
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

	const scaleParams: ScaleParams = {
		start,
		duration,
		easing: bounce ? elasticOut : cubicOut,
		opacity: 0,
	};
</script>

{#if show}
	<div
		class={className}
		in:svelteScale={scaleParams}
		out:svelteScale={scaleParams}
	>
		{@render children()}
	</div>
{:else}
	<div class={className}>
		{@render children()}
	</div>
{/if}

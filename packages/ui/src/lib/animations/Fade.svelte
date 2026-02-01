<script lang="ts">
	import { fade as svelteFade, type FadeParams } from 'svelte/transition';
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	
	/**
	 * Props for the Fade component
	 */
	interface Props {
		/** Delay before animation starts (ms) */
		delay?: number;
		/** Animation duration (ms) */
		duration?: number;
		/** Whether to animate on mount */
		animateOnMount?: boolean;
		/** Custom CSS class */
		class?: string;
		/** Child content snippet */
		children: Snippet;
	}

	let {
		delay = 0,
		duration = 300,
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

	const fadeParams: FadeParams = {
		duration,
	};
</script>

{#if show}
	<div
		class={className}
		in:svelteFade={fadeParams}
		out:svelteFade={fadeParams}
	>
		{@render children()}
	</div>
{:else}
	<div class={className}>
		{@render children()}
	</div>
{/if}

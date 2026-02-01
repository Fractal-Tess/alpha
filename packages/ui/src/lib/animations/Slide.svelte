<script lang="ts">
    import { fly, type FlyParams } from "svelte/transition";
    import { cubicOut } from "svelte/easing";
    import { onMount } from "svelte";
    import type { AnimationDirection } from "./animate.js";
    import type { Snippet } from "svelte";

    /**
     * Props for the Slide component
     */
    interface Props {
        /** Direction to slide from */
        direction?: AnimationDirection;
        /** Distance to slide (px) */
        distance?: number;
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
        direction = "up",
        distance = 30,
        delay = 0,
        duration = 300,
        animateOnMount = true,
        class: className = "",
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
     * Calculate x/y offset based on direction
     */
    function getOffset(): { x: number; y: number } {
        switch (direction) {
            case "up":
                return { x: 0, y: distance };
            case "down":
                return { x: 0, y: -distance };
            case "left":
                return { x: distance, y: 0 };
            case "right":
                return { x: -distance, y: 0 };
            case "none":
            default:
                return { x: 0, y: 0 };
        }
    }

    const offset = getOffset();

    const flyParams: FlyParams = {
        x: offset.x,
        y: offset.y,
        duration,
        easing: cubicOut,
    };
</script>

{#if show}
    <div class={className} in:fly={flyParams} out:fly={flyParams}>
        {@render children()}
    </div>
{:else}
    <div class={className}>
        {@render children()}
    </div>
{/if}

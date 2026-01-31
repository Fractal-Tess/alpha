<script lang="ts">
import { Button } from "@alpha/ui/shadcn/button";
</script>

<div class="container mx-auto max-w-3xl px-4 py-8">
	<h1 class="mb-6 text-3xl font-bold">Shadcn Button Test</h1>
	
	<section class="mb-8 rounded-lg border p-6">
		<h2 class="mb-4 text-xl font-semibold">Button Variants</h2>
		<div class="flex flex-wrap gap-4">
			<Button>Default</Button>
			<Button variant="destructive">Destructive</Button>
			<Button variant="outline">Outline</Button>
			<Button variant="secondary">Secondary</Button>
			<Button variant="ghost">Ghost</Button>
			<Button variant="link">Link</Button>
		</div>
	</section>

	<section class="mb-8 rounded-lg border p-6">
		<h2 class="mb-4 text-xl font-semibold">Button Sizes</h2>
		<div class="flex flex-wrap items-center gap-4">
			<Button size="sm">Small</Button>
			<Button size="default">Default</Button>
			<Button size="lg">Large</Button>
			<Button size="icon">🚀</Button>
		</div>
	</section>

	<section class="rounded-lg border p-6">
		<h2 class="mb-4 text-xl font-semibold">Disabled State</h2>
		<div class="flex flex-wrap gap-4">
			<Button disabled>Disabled</Button>
			<Button variant="outline" disabled>Disabled Outline</Button>
		</div>
	</section>
</div>

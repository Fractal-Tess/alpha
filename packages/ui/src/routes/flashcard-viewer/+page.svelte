<script lang="ts">
	import { page } from "$app/stores";
	import FlashcardViewer from "@lib/components/ui/flashcard-viewer";
	import type { Flashcard } from "@lib/components/ui/flashcard-viewer";

	// Sample flashcards for testing
	const sampleCards: Flashcard[] = [
		{ id: "1", question: "What is the capital of France?", answer: "Paris" },
		{ id: "2", question: "What is 2 + 2?", answer: "4" },
		{ id: "3", question: "What is the largest planet in our solar system?", answer: "Jupiter" },
	];

	// Read URL params immediately
	const params = $page.url.searchParams;
	const emptyParam = params.get("empty");
	const widthParam = params.get("width");

	let cards = $state(emptyParam === "true" ? [] : sampleCards);
	let width = $state(widthParam ? Number(widthParam) : 600);

	// React to URL changes
	$effect(() => {
		const url = $page.url;
		const newWidth = url.searchParams.get("width");
		const newEmpty = url.searchParams.get("empty");

		if (newWidth) {
			width = Number(newWidth);
		}
		if (newEmpty === "true" && cards.length > 0) {
			cards = [];
		} else if (newEmpty !== "true" && cards.length === 0) {
			cards = sampleCards;
		}
	});

	function handleRating(cardId: string, quality: number) {
		console.log(`Rated card ${cardId} with quality ${quality}`);
	}

	function handleNavigate(index: number) {
		console.log(`Navigated to card ${index}`);
	}
</script>

<div class="flex min-h-screen flex-col items-center justify-center bg-background p-8">
	<h1 class="mb-8 text-3xl font-bold">Flashcard Viewer Demo</h1>

	<FlashcardViewer
		{cards}
		{width}
		onRating={handleRating}
		onNavigate={handleNavigate}
	/>

	<div class="mt-8 flex flex-col gap-2 text-sm text-muted-foreground">
		<p>URL params for testing:</p>
		<ul class="list-inside list-disc">
			<li><code>?empty=true</code> - Show empty state</li>
			<li><code>?width=800</code> - Custom card width</li>
		</ul>
	</div>
</div>

<script lang="ts">
	import FlashcardEditor from "@lib/components/ui/flashcard-editor";
	import type { EditableFlashcard } from "@lib/components/ui/flashcard-editor";

	let cards = $state<EditableFlashcard[]>([
		{ id: "1", question: "What is the capital of France?", answer: "Paris", order: 0 },
		{ id: "2", question: "What is 2 + 2?", answer: "4", order: 1 },
		{ id: "3", question: "What is the largest planet?", answer: "Jupiter", order: 2 },
	]);

	let nextId = $state(4);

	function handleCreate(card: { question: string; answer: string }) {
		cards = [
			...cards,
			{
				id: String(nextId++),
				question: card.question,
				answer: card.answer,
				order: cards.length,
			},
		];
		console.log("Created card:", card);
	}

	function handleUpdate(id: string, card: { question: string; answer: string }) {
		cards = cards.map((c) => (c.id === id ? { ...c, ...card } : c));
		console.log("Updated card:", id, card);
	}

	function handleDelete(id: string) {
		cards = cards.filter((c) => c.id !== id);
		console.log("Deleted card:", id);
	}

	function handleReorder(orderedIds: string[]) {
		cards = cards.map((card) => ({
			...card,
			order: orderedIds.indexOf(card.id),
		}));
		console.log("Reordered cards:", orderedIds);
	}
</script>

<div class="flex min-h-screen flex-col items-center justify-center bg-background p-8">
	<h1 class="mb-8 text-3xl font-bold">Flashcard Editor Demo</h1>

	<div class="w-full max-w-2xl">
		<FlashcardEditor
			{cards}
			onCreate={handleCreate}
			onUpdate={handleUpdate}
			onDelete={handleDelete}
			onReorder={handleReorder}
		/>
	</div>
</div>

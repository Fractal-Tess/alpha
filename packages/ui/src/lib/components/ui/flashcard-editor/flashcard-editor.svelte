<script lang="ts" module>
	import type { EditableFlashcard } from "./types.js";
</script>

<script lang="ts">
	import { cn } from "@lib/utils.js";
	import { Button } from "@lib/components/ui/button/index.js";
	import { Input } from "@lib/components/ui/input/index.js";
	import * as Card from "@lib/components/ui/card/index.js";
	import { Plus, Trash2, GripVertical, Pencil, Check, X } from "@lucide/svelte";

	let {
		cards = [],
		onCreate,
		onUpdate,
		onDelete,
		onReorder,
		class: className,
		...restProps
	}: {
		cards: EditableFlashcard[];
		onCreate?: (card: { question: string; answer: string }) => void;
		onUpdate?: (id: string, card: { question: string; answer: string }) => void;
		onDelete?: (id: string) => void;
		onReorder?: (orderedIds: string[]) => void;
		class?: string;
	} = $props();

	let editingId = $state<string | null>(null);
	let editQuestion = $state("");
	let editAnswer = $state("");
	let newQuestion = $state("");
	let newAnswer = $state("");
	let showAddForm = $state(false);
	let draggedId = $state<string | null>(null);
	let dragOverId = $state<string | null>(null);

	function startEdit(card: EditableFlashcard) {
		editingId = card.id;
		editQuestion = card.question;
		editAnswer = card.answer;
	}

	function cancelEdit() {
		editingId = null;
		editQuestion = "";
		editAnswer = "";
	}

	function saveEdit() {
		if (!editingId || !editQuestion.trim() || !editAnswer.trim()) return;
		onUpdate?.(editingId, { question: editQuestion.trim(), answer: editAnswer.trim() });
		cancelEdit();
	}

	function handleCreate() {
		if (!newQuestion.trim() || !newAnswer.trim()) return;
		onCreate?.({ question: newQuestion.trim(), answer: newAnswer.trim() });
		newQuestion = "";
		newAnswer = "";
		showAddForm = false;
	}

	function handleDelete(id: string) {
		onDelete?.(id);
	}

	function handleDragStart(e: DragEvent, id: string) {
		draggedId = id;
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = "move";
			e.dataTransfer.setData("text/plain", id);
		}
	}

	function handleDragOver(e: DragEvent, id: string) {
		e.preventDefault();
		if (draggedId && draggedId !== id) {
			dragOverId = id;
		}
	}

	function handleDragLeave() {
		dragOverId = null;
	}

	function handleDrop(e: DragEvent, targetId: string) {
		e.preventDefault();
		if (!draggedId || draggedId === targetId) {
			draggedId = null;
			dragOverId = null;
			return;
		}

		const sortedCards = [...cards].sort((a, b) => a.order - b.order);
		const draggedIndex = sortedCards.findIndex((c) => c.id === draggedId);
		const targetIndex = sortedCards.findIndex((c) => c.id === targetId);

		if (draggedIndex === -1 || targetIndex === -1) {
			draggedId = null;
			dragOverId = null;
			return;
		}

		const newOrder = [...sortedCards];
		const [removed] = newOrder.splice(draggedIndex, 1);
		newOrder.splice(targetIndex, 0, removed);

		onReorder?.(newOrder.map((c) => c.id));
		draggedId = null;
		dragOverId = null;
	}

	function handleDragEnd() {
		draggedId = null;
		dragOverId = null;
	}

	let sortedCards = $derived([...cards].sort((a, b) => a.order - b.order));
</script>

<div class={cn("flex flex-col gap-4", className)} {...restProps}>
	<div class="flex items-center justify-between">
		<h3 class="text-lg font-semibold">Flashcards ({cards.length})</h3>
		{#if !showAddForm}
			<Button
				data-testid="add-card-button"
				variant="outline"
				size="sm"
				onclick={() => (showAddForm = true)}
			>
				<Plus class="size-4 mr-1" />
				Add Card
			</Button>
		{/if}
	</div>

	{#if showAddForm}
		<Card.Root data-testid="add-card-form" class="border-dashed border-primary">
			<Card.Content class="pt-4">
				<div class="flex flex-col gap-3">
					<div>
						<label for="new-question" class="text-sm font-medium mb-1 block">Question</label>
						<Input
							id="new-question"
							data-testid="new-question-input"
							placeholder="Enter question..."
							bind:value={newQuestion}
						/>
					</div>
					<div>
						<label for="new-answer" class="text-sm font-medium mb-1 block">Answer</label>
						<Input
							id="new-answer"
							data-testid="new-answer-input"
							placeholder="Enter answer..."
							bind:value={newAnswer}
						/>
					</div>
					<div class="flex gap-2 justify-end">
						<Button
							data-testid="cancel-add-button"
							variant="ghost"
							size="sm"
							onclick={() => {
								showAddForm = false;
								newQuestion = "";
								newAnswer = "";
							}}
						>
							Cancel
						</Button>
						<Button
							data-testid="save-new-card-button"
							size="sm"
							disabled={!newQuestion.trim() || !newAnswer.trim()}
							onclick={handleCreate}
						>
							<Check class="size-4 mr-1" />
							Save
						</Button>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	{/if}

	{#if sortedCards.length === 0 && !showAddForm}
		<div
			data-testid="empty-state"
			class="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center"
		>
			<p class="text-muted-foreground mb-4">No flashcards yet</p>
			<Button variant="outline" size="sm" onclick={() => (showAddForm = true)}>
				<Plus class="size-4 mr-1" />
				Add your first card
			</Button>
		</div>
	{:else}
		<div class="flex flex-col gap-2">
			{#each sortedCards as card (card.id)}
				<Card.Root
					data-testid="flashcard-item"
					data-card-id={card.id}
					class={cn(
						"transition-all",
						draggedId === card.id && "opacity-50",
						dragOverId === card.id && "border-primary border-2"
					)}
					draggable={editingId !== card.id}
					ondragstart={(e) => handleDragStart(e, card.id)}
					ondragover={(e) => handleDragOver(e, card.id)}
					ondragleave={handleDragLeave}
					ondrop={(e) => handleDrop(e, card.id)}
					ondragend={handleDragEnd}
				>
					<Card.Content class="py-3 px-4">
						{#if editingId === card.id}
							<div class="flex flex-col gap-3" data-testid="edit-form">
								<div>
									<label for="edit-question" class="text-sm font-medium mb-1 block">Question</label>
									<Input
										id="edit-question"
										data-testid="edit-question-input"
										bind:value={editQuestion}
									/>
								</div>
								<div>
									<label for="edit-answer" class="text-sm font-medium mb-1 block">Answer</label>
									<Input
										id="edit-answer"
										data-testid="edit-answer-input"
										bind:value={editAnswer}
									/>
								</div>
								<div class="flex gap-2 justify-end">
									<Button
										data-testid="cancel-edit-button"
										variant="ghost"
										size="sm"
										onclick={cancelEdit}
									>
										<X class="size-4" />
									</Button>
									<Button
										data-testid="save-edit-button"
										size="sm"
										disabled={!editQuestion.trim() || !editAnswer.trim()}
										onclick={saveEdit}
									>
										<Check class="size-4" />
									</Button>
								</div>
							</div>
						{:else}
							<div class="flex items-start gap-3">
								<button
									type="button"
									class="cursor-grab text-muted-foreground hover:text-foreground mt-1"
									aria-label="Drag to reorder"
									data-testid="drag-handle"
								>
									<GripVertical class="size-4" />
								</button>
								<div class="flex-1 min-w-0">
									<p class="font-medium text-sm" data-testid="card-question">{card.question}</p>
									<p class="text-sm text-muted-foreground mt-1" data-testid="card-answer">
										{card.answer}
									</p>
								</div>
								<div class="flex gap-1">
									<Button
										data-testid="edit-button"
										variant="ghost"
										size="icon"
										class="size-8"
										onclick={() => startEdit(card)}
									>
										<Pencil class="size-4" />
									</Button>
									<Button
										data-testid="delete-button"
										variant="ghost"
										size="icon"
										class="size-8 text-destructive hover:text-destructive"
										onclick={() => handleDelete(card.id)}
									>
										<Trash2 class="size-4" />
									</Button>
								</div>
							</div>
						{/if}
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{/if}
</div>

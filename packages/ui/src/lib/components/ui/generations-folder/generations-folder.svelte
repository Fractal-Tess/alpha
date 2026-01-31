<script lang="ts">
	import { Button } from '@lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '@lib/components/ui/card';
	import { Badge } from '@lib/components/ui/badge';
	import { Input } from '@lib/components/ui/input';
	import { Spinner } from '@lib/components/ui/spinner';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger
	} from '@lib/components/ui/dropdown-menu';
	import {
		AlertDialog,
		AlertDialogAction,
		AlertDialogCancel,
		AlertDialogContent,
		AlertDialogDescription,
		AlertDialogFooter,
		AlertDialogHeader,
		AlertDialogTitle
	} from '@lib/components/ui/alert-dialog';
	import {
		Check,
		X,
		MoreVertical,
		Pencil,
		Trash2,
		FileText,
		Filter
	} from 'lucide-svelte';
	import {
		type Generation,
		type GenerationType,
		generationTypeIcons,
		generationTypeLabels,
		type GenerationsFolderProps
	} from './types';

	let {
		generations,
		sourceDocuments,
		onGenerationClick,
		onRename,
		onDelete,
		onFilterByType,
		onFilterBySource
	}: GenerationsFolderProps = $props();

	let editingId = $state<string | null>(null);
	let editingName = $state('');
	let deleteConfirmId = $state<string | null>(null);
	let filterType = $state<GenerationType | 'all'>('all');
	let filterSource = $state<string>('all');

	const filteredGenerations = $derived(() => {
		let result = generations;
		if (filterType !== 'all') {
			result = result.filter((g) => g.type === filterType);
		}
		if (filterSource !== 'all') {
			result = result.filter((g) => g.sourceDocumentIds.includes(filterSource));
		}
		return result.sort((a, b) => b.updatedAt - a.updatedAt);
	});

	const typeOptions: { value: GenerationType | 'all'; label: string }[] = [
		{ value: 'all', label: 'All Types' },
		{ value: 'flashcards', label: 'Flashcards' },
		{ value: 'quiz', label: 'Quiz' },
		{ value: 'notes', label: 'Notes' },
		{ value: 'summary', label: 'Summary' }
	];

	function startEditing(generation: Generation) {
		editingId = generation.id;
		editingName = generation.name;
	}

	function saveEdit() {
		if (editingId && editingName.trim()) {
			onRename(editingId, editingName.trim());
			editingId = null;
			editingName = '';
		}
	}

	function cancelEdit() {
		editingId = null;
		editingName = '';
	}

	function confirmDelete(id: string) {
		deleteConfirmId = id;
	}

	function executeDelete() {
		if (deleteConfirmId) {
			onDelete(deleteConfirmId);
			deleteConfirmId = null;
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			saveEdit();
		} else if (event.key === 'Escape') {
			cancelEdit();
		}
	}

	function setFilterType(type: GenerationType | 'all') {
		filterType = type;
		onFilterByType?.(type);
	}

	function setFilterSource(sourceId: string) {
		filterSource = sourceId;
		onFilterBySource?.(sourceId);
	}

	function getSourceDocumentNames(docIds: string[]): string[] {
		return docIds
			.map((id) => sourceDocuments.find((doc) => doc.id === id)?.name)
			.filter((name): name is string => !!name);
	}
</script>

<Card class="w-full">
	<CardHeader class="pb-3">
		<div class="flex items-center justify-between">
			<CardTitle class="flex items-center gap-2 text-lg">
				<span class="text-xl">✨</span>
				AI Generations
			</CardTitle>
			<div class="flex items-center gap-2">
				<DropdownMenu>
					<DropdownMenuTrigger asChild let:builder>
						<Button variant="outline" size="sm" builders={[builder]}>
							<Filter class="mr-2 h-4 w-4" />
							Type: {typeOptions.find((t) => t.value === filterType)?.label}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						{#each typeOptions as option}
							<DropdownMenuItem onclick={() => setFilterType(option.value)}>
								{option.label}
							</DropdownMenuItem>
						{/each}
					</DropdownMenuContent>
				</DropdownMenu>

				{#if sourceDocuments.length > 0}
					<DropdownMenu>
						<DropdownMenuTrigger asChild let:builder>
							<Button variant="outline" size="sm" builders={[builder]}>
								<FileText class="mr-2 h-4 w-4" />
								Source
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuItem onclick={() => setFilterSource('all')}>
								All Sources
							</DropdownMenuItem>
							{#each sourceDocuments as doc}
								<DropdownMenuItem onclick={() => setFilterSource(doc.id)}>
									{doc.name}
								</DropdownMenuItem>
							{/each}
						</DropdownMenuContent>
					</DropdownMenu>
				{/if}
			</div>
		</div>
	</CardHeader>

	<CardContent>
		{#if generations.length === 0}
			<div class="flex flex-col items-center justify-center py-12 text-center">
				<div class="mb-4 text-4xl">✨</div>
				<h3 class="mb-2 text-lg font-medium">No generations yet</h3>
				<p class="text-muted-foreground max-w-sm text-sm">
					Upload documents and generate flashcards, quizzes, notes, or summaries using AI.
				</p>
			</div>
		{:else if filteredGenerations().length === 0}
			<div class="flex flex-col items-center justify-center py-12 text-center">
				<div class="mb-4 text-4xl">🔍</div>
				<h3 class="mb-2 text-lg font-medium">No matching generations</h3>
				<p class="text-muted-foreground text-sm">
					Try adjusting your filters to see more results.
				</p>
			</div>
		{:else}
			<div class="space-y-2">
				{#each filteredGenerations() as generation (generation.id)}
					<div
						class="hover:bg-accent group flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors"
						onclick={() => onGenerationClick(generation)}
						onkeydown={(e) => e.key === 'Enter' && onGenerationClick(generation)}
						role="button"
						tabindex="0"
					>
						<div class="flex min-w-0 flex-1 items-center gap-3">
							<span class="text-2xl">{generationTypeIcons[generation.type]}</span>

							<div class="min-w-0 flex-1">
								{#if editingId === generation.id}
									<Input
										type="text"
										bind:value={editingName}
										onkeydown={handleKeyDown}
										onblur={saveEdit}
										autofocus
										class="h-8"
										onclick={(e) => e.stopPropagation()}
									/>
								{:else}
									<div class="flex items-center gap-2">
										<span class="truncate font-medium">{generation.name}</span>
										{#if generation.status === 'generating'}
											<Spinner size="sm" />
										{:else if generation.status === 'ready'}
											<Check class="h-4 w-4 text-green-500" />
										{:else if generation.status === 'failed'}
											<X class="h-4 w-4 text-red-500" />
										{/if}
									</div>
								{/if}

								<div class="mt-1 flex flex-wrap items-center gap-1">
									<Badge variant="secondary" class="text-xs">
										{generationTypeLabels[generation.type]}
									</Badge>

									{#each getSourceDocumentNames(generation.sourceDocumentIds).slice(0, 2) as docName}
										<Badge variant="outline" class="text-xs">
											{docName}
										</Badge>
									{/each}

									{#if generation.sourceDocumentIds.length > 2}
										<Badge variant="outline" class="text-xs">
											+{generation.sourceDocumentIds.length - 2} more
										</Badge>
									{/if}
								</div>
							</div>
						</div>

						<div class="flex items-center gap-1 opacity-0 group-hover:opacity-100">
							<Button
								variant="ghost"
								size="icon"
								class="h-8 w-8"
								onclick={(e) => {
									e.stopPropagation();
									startEditing(generation);
								}}
							>
								<Pencil class="h-4 w-4" />
							</Button>

							<Button
								variant="ghost"
								size="icon"
								class="h-8 w-8 text-destructive hover:text-destructive"
								onclick={(e) => {
									e.stopPropagation();
									confirmDelete(generation.id);
								}}
							>
								<Trash2 class="h-4 w-4" />
							</Button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</CardContent>
</Card>

<AlertDialog open={deleteConfirmId !== null} onOpenChange={() => (deleteConfirmId = null)}>
	<AlertDialogContent>
		<AlertDialogHeader>
			<AlertDialogTitle>Delete Generation</AlertDialogTitle>
			<AlertDialogDescription>
				Are you sure you want to delete this generation? This action cannot be undone.
			</AlertDialogDescription>
		</AlertDialogHeader>
		<AlertDialogFooter>
			<AlertDialogCancel onclick={() => (deleteConfirmId = null)}>Cancel</AlertDialogCancel>
			<AlertDialogAction onclick={executeDelete} class="bg-destructive text-destructive-foreground">
				Delete
			</AlertDialogAction>
		</AlertDialogFooter>
	</AlertDialogContent>
</AlertDialog>

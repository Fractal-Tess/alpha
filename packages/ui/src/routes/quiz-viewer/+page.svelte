<script lang="ts">
	import { page } from "$app/stores";
	import QuizViewer from "@lib/components/ui/quiz-viewer/quiz-viewer.svelte";
	import type { QuizItem, QuizAnswer, QuizResults } from "@lib/components/ui/quiz-viewer/types.js";

	const sampleQuestions: QuizItem[] = [
		{
			id: "1",
			question: "What is the capital of France?",
			options: ["London", "Paris", "Berlin", "Madrid"],
			correctIndex: 1,
			explanation:
				"Paris is the capital and largest city of France, located in the north-central part of the country.",
		},
		{
			id: "2",
			question: "What is 2 + 2?",
			options: ["3", "4", "5", "6"],
			correctIndex: 1,
			explanation: "2 plus 2 equals 4, which is a basic arithmetic fact.",
		},
		{
			id: "3",
			question: "What is the largest planet in our solar system?",
			options: ["Earth", "Mars", "Jupiter", "Saturn"],
			correctIndex: 2,
			explanation:
				"Jupiter is the largest planet in our solar system, with a mass more than two and a half times that of all the other planets combined.",
		},
	];

	const params = $page.url.searchParams;
	const emptyParam = params.get("empty");

	let questions = $state(emptyParam === "true" ? [] : sampleQuestions);

	$effect(() => {
		const url = $page.url;
		const newEmpty = url.searchParams.get("empty");

		if (newEmpty === "true" && questions.length > 0) {
			questions = [];
		} else if (newEmpty !== "true" && questions.length === 0) {
			questions = sampleQuestions;
		}
	});

	function handleAnswer(answer: QuizAnswer) {
		console.log("Answered:", answer);
	}

	function handleComplete(results: QuizResults) {
		console.log("Quiz complete:", results);
	}
</script>

<div class="flex min-h-screen flex-col items-center justify-center bg-background p-8">
	<h1 class="mb-8 text-3xl font-bold">Quiz Viewer Demo</h1>

	<QuizViewer
		{questions}
		onAnswer={handleAnswer}
		onComplete={handleComplete}
	/>

	<div class="mt-8 flex flex-col gap-2 text-sm text-muted-foreground">
		<p>URL params for testing:</p>
		<ul class="list-inside list-disc">
			<li><code>?empty=true</code> - Show empty state</li>
		</ul>
	</div>
</div>

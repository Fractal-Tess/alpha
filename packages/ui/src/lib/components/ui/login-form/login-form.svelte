<script lang="ts">
	import Logo from "../../../../components/Logo.svelte";
	import {
		FieldGroup,
		Field,
		FieldLabel,
		FieldDescription,
		FieldSeparator,
	} from "../field/index.js";
	import { Input } from "../input/index.js";
	import { Button } from "../button/index.js";
	import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs/index.js";
	import { toast } from "svelte-sonner";

	// Props for the login form
	let {
		onSignIn,
		onSignUp,
		isLoading = false,
		error = "",
	}: {
		onSignIn: (email: string, password: string) => void;
		onSignUp: (name: string, email: string, password: string) => void;
		isLoading?: boolean;
		error?: string;
	} = $props();

	// Form state
	let email = $state("");
	let password = $state("");
	let name = $state("");
	let activeTab = $state("signin");

	const id = $props.id();

	function handleSignIn(e: Event) {
		e.preventDefault();
		onSignIn(email, password);
	}

	function handleSignUp(e: Event) {
		e.preventDefault();
		onSignUp(name, email, password);
	}

	function showNotImplemented(provider: string) {
		toast.info(`${provider} login is not implemented yet`, {
			description: "Please use email and password to sign in.",
		});
	}
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-col items-center gap-2 text-center">
		<a href="/" class="flex flex-col items-center gap-2 font-medium">
			<Logo variant="light" class="h-12 w-auto" />
			<span class="sr-only">Alpha</span>
		</a>
		<h1 class="text-xl font-bold">
			{activeTab === 'signin' ? 'Welcome back' : 'Create account'}
		</h1>
		<FieldDescription>
			{activeTab === 'signin'
				? 'Sign in to continue your learning journey'
				: 'Start your AI-powered study journey today'}
		</FieldDescription>
	</div>

	<Tabs bind:value={activeTab} class="w-full">
		<TabsList class="grid w-full grid-cols-2">
			<TabsTrigger value="signin">Sign In</TabsTrigger>
			<TabsTrigger value="signup">Sign Up</TabsTrigger>
		</TabsList>

		<TabsContent value="signin">
			<form onsubmit={handleSignIn}>
				<FieldGroup>
					<Field>
						<FieldLabel for="email-{id}">Email</FieldLabel>
						<Input
							id="email-{id}"
							type="email"
							placeholder="name@example.com"
							bind:value={email}
							required
							disabled={isLoading}
						/>
					</Field>
					<Field>
						<FieldLabel for="password-{id}">Password</FieldLabel>
						<Input
							id="password-{id}"
							type="password"
							placeholder="Enter your password"
							bind:value={password}
							required
							disabled={isLoading}
						/>
					</Field>
					{#if error}
						<p class="text-sm text-red-500">{error}</p>
					{/if}
					<Field>
						<Button type="submit" class="w-full" disabled={isLoading}>
							{isLoading ? 'Signing in...' : 'Sign In'}
						</Button>
					</Field>
				</FieldGroup>
			</form>
		</TabsContent>

		<TabsContent value="signup">
			<form onsubmit={handleSignUp}>
				<FieldGroup>
					<Field>
						<FieldLabel for="name-{id}">Name</FieldLabel>
						<Input
							id="name-{id}"
							type="text"
							placeholder="John Doe"
							bind:value={name}
							required
							disabled={isLoading}
						/>
					</Field>
					<Field>
						<FieldLabel for="signup-email-{id}">Email</FieldLabel>
						<Input
							id="signup-email-{id}"
							type="email"
							placeholder="name@example.com"
							bind:value={email}
							required
							disabled={isLoading}
						/>
					</Field>
					<Field>
						<FieldLabel for="signup-password-{id}">Password</FieldLabel>
						<Input
							id="signup-password-{id}"
							type="password"
							placeholder="Create a password"
							bind:value={password}
							required
							minlength={8}
							disabled={isLoading}
						/>
					</Field>
					{#if error}
						<p class="text-sm text-red-500">{error}</p>
					{/if}
					<Field>
						<Button type="submit" class="w-full" disabled={isLoading}>
							{isLoading ? 'Creating account...' : 'Create Account'}
						</Button>
					</Field>
				</FieldGroup>
			</form>
		</TabsContent>
	</Tabs>

	<FieldSeparator>Or continue with</FieldSeparator>

	<Field class="grid gap-3 grid-cols-2">
		<Button 
			variant="outline" 
			type="button" 
			disabled={isLoading} 
			class="w-full"
			onclick={() => showNotImplemented('Apple')}
		>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="mr-2 h-4 w-4">
				<path
					d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
					fill="currentColor"
				/>
			</svg>
			Apple
		</Button>
		<Button 
			variant="outline" 
			type="button" 
			disabled={isLoading} 
			class="w-full"
			onclick={() => showNotImplemented('Google')}
		>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="mr-2 h-4 w-4">
				<path
					d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
					fill="currentColor"
				/>
			</svg>
			Google
		</Button>
		<Button 
			variant="outline" 
			type="button" 
			disabled={isLoading} 
			class="w-full"
			onclick={() => showNotImplemented('Facebook')}
		>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="mr-2 h-4 w-4">
				<path
					d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
					fill="currentColor"
				/>
			</svg>
			Facebook
		</Button>
		<Button 
			variant="outline" 
			type="button" 
			disabled={isLoading} 
			class="w-full"
			onclick={() => showNotImplemented('GitHub')}
		>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="mr-2 h-4 w-4">
				<path
					d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
					fill="currentColor"
				/>
			</svg>
			GitHub
		</Button>
	</Field>

	<FieldDescription class="px-6 text-center text-xs">
		By clicking continue, you agree to our <a href="/terms" class="underline">Terms of Service</a> and
		<a href="/privacy" class="underline">Privacy Policy</a>.
	</FieldDescription>
</div>

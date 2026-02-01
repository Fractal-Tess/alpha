<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { LoginForm } from '@alpha/ui/shadcn/login-form';
	import { goto } from '$app/navigation';

	let isLoading = $state(false);
	let error = $state('');

	async function handleSignIn(email: string, password: string) {
		isLoading = true;
		error = '';
		
		const result = await authClient.signIn.email({
			email,
			password,
		});
		
		isLoading = false;
		
		if (result.error) {
			error = result.error.message || 'Sign in failed';
		} else {
			goto('/dashboard');
		}
	}

	async function handleSignUp(name: string, email: string, password: string) {
		isLoading = true;
		error = '';
		
		const result = await authClient.signUp.email({
			email,
			password,
			name,
		});
		
		isLoading = false;
		
		if (result.error) {
			error = result.error.message || 'Sign up failed';
		} else {
			goto('/dashboard');
		}
	}
</script>

<div class="flex min-h-screen w-full items-center justify-center p-4">
	<div class="w-full max-w-sm">
		<LoginForm 
			onSignIn={handleSignIn} 
			onSignUp={handleSignUp}
			{isLoading}
			{error}
		/>
	</div>
</div>

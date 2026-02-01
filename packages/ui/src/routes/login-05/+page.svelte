<script lang="ts">
	import { LoginForm } from "@lib/components/ui/login-form/index.js";
</script>

<div class="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
	<div class="w-full max-w-sm">
		<LoginForm 
			onSignIn={(email, password) => console.log('Sign in:', email, password)}
			onSignUp={(name, email, password) => console.log('Sign up:', name, email, password)}
		/>
	</div>
</div>

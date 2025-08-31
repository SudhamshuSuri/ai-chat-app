<script>
	import { SignIn } from 'svelte-clerk';
</script>

<div
	class="flex h-screen items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"
>
	<SignIn redirectUrl="/" signUpUrl="/register" />
</div>

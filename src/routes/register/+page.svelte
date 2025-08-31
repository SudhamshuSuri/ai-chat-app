<script>
	import { SignUp } from 'svelte-clerk';
</script>

<div
	class="flex h-screen items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"
>
	<SignUp redirectUrl="/" signInUrl="/login" />
</div>

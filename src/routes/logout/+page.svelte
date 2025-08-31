<script>
	import { SignOutButton } from 'svelte-clerk';
</script>

<div
	class="flex h-screen items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"
>
	<div class="rounded-lg border border-gray-700 bg-gray-800/90 p-8 shadow-xl backdrop-blur-sm">
		<h1 class="mb-4 text-2xl font-bold text-gray-100">Sign Out</h1>
		<p class="mb-6 text-gray-400">Are you sure you want to sign out?</p>
		<SignOutButton redirectUrl="/login" />
	</div>
</div>

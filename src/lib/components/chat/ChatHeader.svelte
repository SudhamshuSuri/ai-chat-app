<script>
	import { SignOutButton } from 'svelte-clerk';
</script>

<header
	class="sticky top-0 z-10 flex items-center justify-between border-b border-gray-700 bg-gray-800/90 px-6 py-4 shadow-md backdrop-blur"
>
	<div class="flex items-center gap-2">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-7 w-7 text-purple-400"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
		</svg>
		<span class="text-xl font-bold tracking-tight text-gray-100">S3 Chat</span>
	</div>
	<div class="flex items-center gap-4">
		<a
			href="/logout"
			class="rounded-lg bg-purple-700 px-3 py-1 text-sm text-gray-300 transition-colors hover:bg-purple-600 hover:text-white"
		>
			Logout
		</a>
	</div>
</header>

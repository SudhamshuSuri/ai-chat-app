<script>
	import '../app.css';
	import { ClerkProvider } from 'svelte-clerk';
	import { goto } from '$app/navigation';

	let { children } = $props();
</script>

<ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY} afterSignOutUrl="/login">
	{@render children()}
</ClerkProvider>

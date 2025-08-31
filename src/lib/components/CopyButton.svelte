<script>
	export let textToCopy = '';
	let copied = false;

	async function copyText() {
		try {
			await navigator.clipboard.writeText(textToCopy);
			copied = true;
			setTimeout(() => copied = false, 1500);
		} catch (err) {
			console.error('Copy failed', err);
		}
	}
</script>

<button
	class="ml-2 p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-gray-200 transition-colors"
	on:click={copyText}
	aria-label="Copy to clipboard"
>
	{#if copied}
		<svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M5 13l4 4L19 7" /></svg>
	{:else}
		<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
	{/if}
</button>
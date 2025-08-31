<script>
	import { createEventDispatcher } from 'svelte';

	// Props
	let { userInput, loading = false, error = '' } = $props();

	// Local state for textarea value
	let localUserInput = $state(userInput || '');

	// Sync local state with prop when prop changes
	$effect(() => {
		localUserInput = userInput || '';
	});

	// Dispatch event when local state changes
	$effect(() => {
		dispatch('input', localUserInput);
	});

	// Dispatch events to parent
	const dispatch = createEventDispatcher();

	// Local functions
	function handleSubmit(e) {
		e.preventDefault();
		dispatch('sendMessage');
	}

	function handleKeyPress(e) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			dispatch('sendMessage');
		}
	}

	function handleButtonClick() {
		dispatch('sendMessage');
	}

	// Auto-resize textarea
	function autoResize(node) {
		function resize() {
			node.style.height = 'auto';
			node.style.height = node.scrollHeight + 'px';
		}
		node.addEventListener('input', resize);
		$effect(resize);
		return {
			destroy() {
				node.removeEventListener('input', resize);
			}
		};
	}
</script>

<!-- Input Form -->
<form
	class="fixed bottom-0 left-0 z-20 w-full border-t border-gray-800 bg-gray-900/95 py-4 shadow-inner backdrop-blur"
	onsubmit={handleSubmit}
>
	<div class="mx-auto flex max-w-5xl items-start gap-2">
		<textarea
			use:autoResize
			bind:value={localUserInput}
			placeholder="Type your message..."
			class="scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800 max-h-40 min-h-[44px] flex-1 resize-none overflow-y-auto rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-base text-gray-100 placeholder-gray-400 shadow-sm
			focus:ring-2 focus:ring-purple-500 focus:outline-none"
			onkeydown={handleKeyPress}
			disabled={loading}
			style="
			scrollbar-width: thin;
			scrollbar-color: #6b7280 #1f2937;
		"
		></textarea>
		<button
			type="button"
			class="mt-1 flex h-[40px] min-h-[40px] items-center justify-center rounded-lg bg-purple-600 px-4 py-2 font-semibold text-white shadow transition hover:bg-purple-700 disabled:opacity-50"
			disabled={loading || !localUserInput.trim()}
			style="min-width: 40px;"
			onclick={handleButtonClick}
		>
			Send
		</button>
	</div>
	{#if error}
		<div class="mt-4 rounded border border-red-700 bg-red-900 px-4 py-2 text-center text-red-400">
			<p class="font-bold">Error:</p>
			<p>{error}</p>
			<p class="mt-1 text-sm">Please try again. If the issue persists, contact support.</p>
		</div>
	{/if}
</form>

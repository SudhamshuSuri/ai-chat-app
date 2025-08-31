<script>
	import { createEventDispatcher } from 'svelte';

	export let searchResults = [];

	const dispatch = createEventDispatcher();

	function handleSessionSelect(sessionId) {
		dispatch('sessionSelect', { sessionId });
	}
</script>

<div class="mt-3 max-h-[calc(100vh-400px)] space-y-2 overflow-y-auto">
	{#if searchResults.length > 0}
		{#each searchResults as result}
			<div
				class="cursor-pointer rounded-lg border border-gray-700 bg-gray-700/50 p-3 text-sm transition-colors hover:bg-gray-600/50"
				onclick={() => handleSessionSelect(result.id)}
			>
				<div class="truncate font-medium text-gray-100">
					{result.title || 'Untitled Chat'}
				</div>
				{#if result.matching_content}
					<div class="mt-1 truncate text-xs text-gray-400">
						{result.matching_content}
					</div>
				{/if}
				<div class="mt-1 text-xs text-gray-500">
					{new Date(result.updated_at).toLocaleDateString()}
				</div>
			</div>
		{/each}
	{:else if searchResults && searchResults.length === 0 && searchQuery?.trim()}
		<div class="rounded-lg border border-gray-700 bg-gray-700/50 p-3 text-sm text-gray-300">
			No results found
		</div>
	{:else}
		<div class="rounded-lg border border-gray-700 bg-gray-700/50 p-3 text-sm text-gray-300">
			Start typing to search
		</div>
	{/if}
</div>

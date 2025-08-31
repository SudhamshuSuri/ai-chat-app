<script>
	import { createEventDispatcher } from 'svelte';

	// Props
	let {
		sessions = [],
		currentSessionId = null,
		searchQuery = '',
		searchResults = [],
		editingSessionId = null,
		editingTitle = ''
	} = $props();

	// Local state for editing title
	let localEditingTitle = $state(editingTitle);

	// Sync local state with prop
	$effect(() => {
		localEditingTitle = editingTitle;
	});

	// Dispatch events to parent
	const dispatch = createEventDispatcher();

	// Local functions
	function startEditingTitle(sessionId, currentTitle) {
		dispatch('editTitle', { sessionId, title: currentTitle });
	}

	function saveTitleEdit() {
		dispatch('saveTitle');
	}

	function cancelTitleEdit() {
		dispatch('cancelTitle');
	}

	function createNewSession() {
		dispatch('newSession');
	}

	function loadSession(sessionId) {
		dispatch('loadSession', { sessionId });
	}

	function deleteSession(sessionId) {
		dispatch('deleteSession', { sessionId });
	}

	// Focus input element
	function focusInput(node) {
		node.focus();
		node.select();
	}
</script>

<!-- Left Sidebar -->
<div class="flex w-64 flex-col bg-gray-800/90 backdrop-blur">
	<div class="flex-1 overflow-hidden p-4">
		<h3 class="mb-4 text-lg font-semibold text-gray-100">Chats</h3>
		<button
			class="w-full rounded-lg bg-purple-600 px-3 py-2 text-sm font-medium text-white hover:bg-purple-700"
			onclick={createNewSession}
		>
			New Chat
		</button>

		<!-- Search Section -->
		<div class="mt-6">
			<h4 class="mb-3 text-sm font-medium text-gray-300">Search</h4>
			<input
				type="text"
				placeholder="Search conversations..."
				bind:value={searchQuery}
				class="w-full rounded-lg border border-gray-700 bg-gray-700 px-3 py-2 text-sm text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none"
			/>
			<div class="mt-3 max-h-[calc(100vh-400px)] space-y-2 overflow-hidden">
				{#if searchResults.length > 0}
					{#each searchResults as result}
						<div
							class="flex h-8 cursor-pointer items-center bg-transparent px-2 py-1 text-sm transition-shadow hover:shadow-lg"
							onclick={() => loadSession(result.id)}
						>
							<div class="flex flex-1 items-center gap-2 truncate font-medium text-gray-100">
								<span class="truncate">{result.title || 'Untitled Chat'}</span>
								{#if result.matching_content}
									<span class="ml-2 truncate text-xs text-gray-400">
										{result.matching_content}
									</span>
								{/if}
							</div>
						</div>
					{/each}
				{:else if searchQuery.trim()}
					<div class="rounded-lg border border-gray-700 bg-gray-700/50 p-3 text-sm text-gray-300">
						No results found
					</div>
				{:else}
					<div class="my-3 rounded-lg border-t border-gray-700 bg-transparent"></div>
				{/if}
			</div>
		</div>

		<!-- Sessions Section -->
		<div class="mt-6">
			<h4 class="mb-3 text-sm font-medium text-gray-300">Recent Chats</h4>
			<div class="max-h-[calc(100vh-500px)] space-y-1 overflow-hidden">
				{#each sessions as session}
					<div
						class="group relative flex h-8 items-center px-2 py-1 text-sm transition-shadow hover:shadow-lg {currentSessionId ===
						session.id
							? 'bg-purple-900/20'
							: 'bg-transparent'}"
					>
						<!-- Single title area that spans full width -->
						<div class="flex-1 cursor-pointer pr-8" onclick={() => loadSession(session.id)}>
							{#if editingSessionId === session.id}
								<div class="flex items-center gap-2">
									<input
										value={localEditingTitle}
										class="flex-1 rounded border border-purple-500 bg-gray-700 px-2 py-1 text-sm text-gray-100 focus:outline-none"
										oninput={(e) => {
											localEditingTitle = e.target.value;
											dispatch('titleInput', e.target.value);
										}}
										onkeydown={(e) => {
											if (e.key === 'Enter') saveTitleEdit();
											if (e.key === 'Escape') cancelTitleEdit();
										}}
										use:focusInput
									/>
									<button
										class="p-1 text-green-400 hover:text-green-300"
										onclick={saveTitleEdit}
										title="Save title"
									>
										<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M5 13l4 4L19 7"
											/>
										</svg>
									</button>
									<button
										class="p-1 text-red-400 hover:text-red-300"
										onclick={cancelTitleEdit}
										title="Cancel editing"
									>
										<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M6 18L18 6M6 6l12 12"
											/>
										</svg>
									</button>
								</div>
							{:else}
								<div class="flex items-center gap-2 font-medium text-gray-300">
									<span class="truncate">{session.title || 'Untitled Chat'}</span>
									{#if session.id.startsWith('local-')}
										<span class="rounded bg-yellow-900/20 px-1 py-0.5 text-xs text-yellow-400">
											LOCAL
										</span>
									{/if}
								</div>
							{/if}
						</div>

						<!-- Action buttons - only visible on hover -->
						{#if editingSessionId !== session.id}
							<button
								class="absolute top-1 right-8 rounded p-1 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-gray-700/50 hover:text-gray-200"
								onclick={() => startEditingTitle(session.id, session.title || 'Untitled Chat')}
								title="Edit title"
							>
								<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
									/>
								</svg>
							</button>

							<button
								class="absolute top-1 right-2 rounded p-1 text-red-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600/20 hover:text-red-300"
								onclick={(e) => {
									e.stopPropagation();
									deleteSession(session.id);
								}}
								title="Delete conversation"
							>
								<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
									/>
								</svg>
							</button>
						{/if}
					</div>
				{:else}
					<div class="rounded-lg border border-gray-700 bg-gray-700/50 p-3 text-sm text-gray-300">
						No conversations yet
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

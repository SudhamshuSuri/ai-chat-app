<script>
	import { createEventDispatcher } from 'svelte';
	import SessionItem from './SessionItem.svelte';
	import SearchResults from './SearchResults.svelte';

	export let sessions = [];
	export let searchQuery = '';
	export let searchResults = [];
	export let editingSessionId = null;
	export let editingTitle = '';

	const dispatch = createEventDispatcher();

	function handleNewChat() {
		dispatch('newChat');
	}

	function handleSessionSelect(sessionId) {
		dispatch('sessionSelect', { sessionId });
	}

	function handleSessionDelete(sessionId) {
		dispatch('sessionDelete', { sessionId });
	}

	function handleTitleEdit(sessionId, title) {
		dispatch('titleEdit', { sessionId, title });
	}

	function handleSearchInput(event) {
		dispatch('searchInput', { query: event.target.value });
	}
</script>

<div class="w-64 bg-gray-800/90 backdrop-blur">
	<div class="p-4">
		<h3 class="mb-4 text-lg font-semibold text-gray-100">Chats</h3>
		<button
			class="w-full rounded-lg bg-purple-600 px-3 py-2 text-sm font-medium text-white hover:bg-purple-700"
			onclick={handleNewChat}
		>
			New Chat
		</button>

		<!-- Search Section -->
		<div class="mt-6">
			<h4 class="mb-3 text-sm font-medium text-gray-300">Search</h4>
			<input
				type="text"
				placeholder="Search conversations..."
				value={searchQuery}
				on:input={handleSearchInput}
				class="w-full rounded-lg border border-gray-700 bg-gray-700 px-3 py-2 text-sm text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none"
			/>
			<SearchResults {searchResults} on:sessionSelect={handleSessionSelect} />
		</div>

		<!-- Sessions Section -->
		<div class="mt-6">
			<h4 class="mb-3 text-sm font-medium text-gray-300">Recent Chats</h4>
			<div class="max-h-[calc(100vh-500px)] space-y-1 overflow-y-auto">
				{#each sessions as session}
					<SessionItem
						{session}
						{editingSessionId}
						{editingTitle}
						on:select={() => handleSessionSelect(session.id)}
						on:delete={() => handleSessionDelete(session.id)}
						on:titleEdit={handleTitleEdit}
					/>
				{:else}
					<div class="rounded-lg border border-gray-700 bg-gray-700/50 p-3 text-sm text-gray-300">
						No conversations yet
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

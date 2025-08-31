<script>
	import { createEventDispatcher } from 'svelte';

	export let session;
	export let editingSessionId = null;
	export let editingTitle = '';

	const dispatch = createEventDispatcher();

	let localTitle = editingTitle;

	$: if (editingSessionId === session.id && editingTitle !== localTitle) {
		localTitle = editingTitle;
	}

	function handleSelect() {
		dispatch('select');
	}

	function handleDelete(event) {
		event.stopPropagation();
		dispatch('delete');
	}

	function startEditing() {
		dispatch('titleEdit', {
			sessionId: session.id,
			title: session.title || 'Untitled Chat'
		});
	}

	function saveEdit() {
		dispatch('titleEdit', {
			sessionId: session.id,
			title: localTitle,
			save: true
		});
	}

	function cancelEdit() {
		dispatch('titleEdit', {
			sessionId: session.id,
			cancel: true
		});
	}

	function handleKeyDown(event) {
		if (event.key === 'Enter') {
			saveEdit();
		} else if (event.key === 'Escape') {
			cancelEdit();
		}
	}
</script>

<div
	class="group relative flex h-8 items-center px-2 py-1 text-sm transition-shadow hover:shadow-lg {session.id ===
	editingSessionId
		? 'bg-purple-900/20'
		: 'bg-transparent'}"
>
	{#if editingSessionId === session.id}
		<div class="flex flex-1 items-center gap-2">
			<input
				bind:value={localTitle}
				class="flex-1 rounded border border-purple-500 bg-gray-700 px-2 py-1 text-sm text-gray-100 focus:outline-none"
				on:keydown={handleKeyDown}
				use:focusInput
			/>
			<button class="p-1 text-green-400 hover:text-green-300" onclick={saveEdit} title="Save title">
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
				onclick={cancelEdit}
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
		<div class="flex cursor-pointer items-center pr-8" onclick={handleSelect}>
			<div class="flex flex-1 items-center gap-2 truncate font-medium text-gray-100">
				<span class="truncate">{session.title || 'Untitled Chat'}</span>
				{#if session.id.startsWith('local-')}
					<span class="rounded bg-yellow-900/20 px-1 py-0.5 text-xs text-yellow-400"> LOCAL </span>
				{/if}
			</div>
		</div>

		<!-- Edit button -->
		<button
			class="absolute top-2 right-8 rounded p-1 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-gray-200"
			onclick={startEditing}
			title="Edit title"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
				/>
			</svg>
		</button>

		<!-- Delete button -->
		<button
			class="absolute top-2 right-2 rounded p-1 text-red-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600/20 hover:text-red-300"
			onclick={handleDelete}
			title="Delete conversation"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

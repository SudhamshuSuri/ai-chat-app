<script>
	import MessageBubble from './MessageBubble.svelte';

	export let messages = [];
	export let loading = false;
	export let chatContainer = null;

	// Auto-scroll to bottom when new messages arrive
	$: if (messages.length > 0 && chatContainer) {
		setTimeout(() => {
			chatContainer.scrollTop = chatContainer.scrollHeight;
		}, 10);
	}
</script>

<main class="flex-1 px-2 sm:px-0">
	<div class="mx-auto flex min-h-[calc(100vh-120px)] max-w-5xl flex-col pb-32">
		<div class="flex-1" bind:this={chatContainer}>
			<div class="flex flex-col gap-3 py-6">
				{#if messages.filter((m) => m.role !== 'system').length === 0}
					<div class="flex justify-center">
						<div
							class="rounded-2xl border border-gray-700 bg-gray-800/90 p-6 text-center shadow-lg backdrop-blur-sm"
						>
							<h2 class="mb-2 text-xl font-semibold text-gray-100">Welcome to S3 Chat!</h2>
							<p class="text-gray-400">Start a conversation with the AI assistant. Ask anything!</p>
						</div>
					</div>
				{/if}
				{#each messages.filter((m) => m.role !== 'system') as msg, i}
					<MessageBubble {msg} {loading} {i} />
				{/each}
			</div>
		</div>
	</div>
</main>

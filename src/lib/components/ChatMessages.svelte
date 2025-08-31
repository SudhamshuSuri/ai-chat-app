<script>
	import MarkdownRenderer from './MarkdownRenderer.svelte';
	import CopyButton from './CopyButton.svelte';

	// Props
	let { messages = [], loading = false, chatContainer = null } = $props();
</script>

<!-- Chat Messages Area -->
<div class="flex-1 overflow-y-auto" bind:this={chatContainer}>
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
			<div class="flex w-full {msg.role === 'user' ? 'justify-end' : 'justify-start'}">
				<div
					class="relative max-w-[80%] rounded-2xl px-4 py-2 text-base whitespace-pre-line shadow
				{msg.role === 'user'
						? 'rounded-br-md bg-purple-600 text-white'
						: 'rounded-bl-md border border-gray-700 bg-gray-800 text-gray-100'}"
				>
					{#if msg.role === 'user'}
						{msg.content}
					{:else}
						<div class="mb-2 flex items-center justify-between">
							<CopyButton textToCopy={msg.content} />
							{#if loading && i === messages.filter((m) => m.role !== 'system').length - 1}
								<span class="inline-flex items-center space-x-1">
									<span class="h-2 w-2 animate-pulse rounded-full bg-gray-400 delay-75"></span>
									<span class="h-2 w-2 animate-pulse rounded-full bg-gray-400 delay-150"></span>
									<span class="h-2 w-2 animate-pulse rounded-full bg-gray-400 delay-200"></span>
								</span>
							{/if}
						</div>
						<MarkdownRenderer content={msg.content} />
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>

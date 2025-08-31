<script>
	import MarkdownRenderer from '$lib/components/MarkdownRenderer.svelte';
	import CopyButton from '$lib/components/CopyButton.svelte';

	export let msg;
	export let loading = false;
	export let i = 0;
</script>

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
			<MarkdownRenderer content={msg.content} />
			<CopyButton textToCopy={msg.content} />
			{#if loading && i === 0}
				<span class="ml-2 inline-flex items-center space-x-1">
					<span class="h-2 w-2 animate-pulse rounded-full bg-gray-400 delay-75"></span>
					<span class="h-2 w-2 animate-pulse rounded-full bg-gray-400 delay-150"></span>
					<span class="h-2 w-2 animate-pulse rounded-full bg-gray-400 delay-200"></span>
				</span>
			{/if}
		{/if}
	</div>
</div>

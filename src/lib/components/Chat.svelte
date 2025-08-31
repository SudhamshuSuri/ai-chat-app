<script>
	import Thread from './Thread.svelte';
	import { chatStore } from '../stores/chat.js';

	$: ({ messages, loading, error } = $chatStore);
</script>

<div class="chat">
	<Thread {messages} />

	{#if loading}
		<div class="loading">AI is thinking...</div>
	{/if}

	{#if error}
		<div class="error">{error}</div>
	{/if}
</div>

<style>
	.chat {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.loading {
		padding: 1rem;
		color: #9ca3af;
		font-style: italic;
	}

	.error {
		padding: 1rem;
		color: #ef4444;
	}
</style>

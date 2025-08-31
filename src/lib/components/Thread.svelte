<script>
	import Message from './Message.svelte';

	export let messages = [];
</script>

<div class="thread">
	{#each messages as message (message.id || message.content)}
		<Message {message} />
	{/each}
</div>

<style>
	.thread {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 1rem;
	}
</style>

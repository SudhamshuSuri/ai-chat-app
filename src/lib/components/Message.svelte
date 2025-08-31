<script>
	export let message;
</script>

<div
	class="message"
	class:user={message.role === 'user'}
	class:assistant={message.role === 'assistant'}
>
	<div class="content">
		{@html message.content.replace(/\n/g, '<br>')}
	</div>
</div>

<style>
	.message {
		margin: 0.5rem 0;
		padding: 0.75rem;
		border-radius: 0.5rem;
		max-width: 80%;
	}

	.user {
		background-color: #3b82f6;
		color: white;
		margin-left: auto;
		text-align: right;
	}

	.assistant {
		background-color: #374151;
		color: white;
	}

	.content {
		word-wrap: break-word;
	}
</style>

<script>
	export let session;
	export let isActive = false;
	export let onClick = () => {};
</script>

<div class="session" class:active={isActive} onclick={onClick}>
	<div class="title">{session.title}</div>
	<div class="date">{new Date(session.created_at).toLocaleDateString()}</div>
</div>

<style>
	.session {
		padding: 0.75rem;
		border-radius: 0.5rem;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.session:hover {
		background-color: #374151;
	}

	.active {
		background-color: #3b82f6;
	}

	.title {
		font-weight: 500;
	}

	.date {
		font-size: 0.875rem;
		color: #9ca3af;
	}
</style>

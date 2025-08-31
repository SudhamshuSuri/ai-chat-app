<script>
	import ChatSidebar from '$lib/components/ChatSidebar.svelte';
	import ChatMessages from '$lib/components/ChatMessages.svelte';
	import ChatInput from '$lib/components/ChatInput.svelte';
	import ChatHeader from '$lib/components/ChatHeader.svelte';
	import {
		chatStore,
		initializeChat,
		loadSessions,
		createNewSession,
		loadSession,
		sendMessage as sendMessageStore,
		deleteChatSession,
		updateTitle,
		searchChats,
		startEditingTitle,
		saveTitleEdit as saveTitleEditStore,
		setEditingSession,
		cancelTitleEdit,
		markHydrated,
		createInitialSession,
		setHydrated,
		setCreatedInitialSession
	} from '$lib/stores/chat.svelte.js';

	let chatContainer = $state(null);
	let userInput = $state('');
	let searchTimeout = $state(null);
	let lastSearchQuery = $state('');

	// Use the chat store
	let sessions = $derived($chatStore.sessions);
	let currentSessionId = $derived($chatStore.currentSessionId);
	let hasCreatedInitialSession = $derived($chatStore.hasCreatedInitialSession);

	// For bind props, use store values directly
	let searchQuery = $state($chatStore.searchQuery);
	let editingTitle = $derived($chatStore.editingTitle);

	// Get editing session ID from store
	let editingSessionId = $derived($chatStore.editingSessionId);

	// Local function to save title edits
	function saveTitleEdit() {
		const currentTitle = $chatStore.editingTitle;
		if (editingSessionId && currentTitle.trim()) {
			saveTitleEditStore(editingSessionId, currentTitle);
		}
	}

	$effect(() => {
		searchQuery = $chatStore.searchQuery;
	});

	$effect(() => {
		if (searchQuery !== $chatStore.searchQuery) {
			setSearchQuery(searchQuery);
		}
	});

	$effect(() => {
		editingTitle = $chatStore.editingTitle;
	});

	$effect(() => {
		if (chatContainer) {
			setTimeout(() => {
				chatContainer.scrollTop = chatContainer.scrollHeight;
			}, 10);
		}
	});

	async function sendMessage() {
		try {
			const messageToSend = userInput; // Store the current value
			userInput = ''; // Clear input immediately
			await sendMessageStore(messageToSend);
		} catch (error) {
			console.error('Send message error:', error);
			// The error is already set in the store
		}
	}

	// Auto-resize textarea
	function autoResize(node) {
		function resize() {
			node.style.height = 'auto';
			node.style.height = node.scrollHeight + 'px';
		}
		node.addEventListener('input', resize);
		$effect(resize);
		return {
			destroy() {
				node.removeEventListener('input', resize);
			}
		};
	}

	// Focus input element
	function focusInput(node) {
		node.focus();
		node.select();
	}

	function handleKeyPress(e) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	}

	// loadSessions is now from store

	// Generate smart title from first message

	async function deleteSession(sessionId) {
		try {
			const res = await fetch(`/api/sessions?id=${sessionId}`, {
				method: 'DELETE'
			});

			if (res.ok) {
				// Refresh sessions from database
				await loadSessions();

				// If current session was deleted, create a new one
				if (currentSessionId === sessionId) {
					await createNewSession();
				}

				console.log('✅ Session deleted successfully');
			} else {
				console.error('Failed to delete session:', await res.text());
			}
		} catch (error) {
			console.error('Error deleting session:', error);
		}
	}

	// Mark when hydration is complete
	$effect(() => {
		setHydrated(true);
	});

	// Create initial session if none exist (only once)
	$effect(() => {
		if (
			!$chatStore.hasCreatedInitialSession &&
			$chatStore.sessions.length === 0 &&
			!$chatStore.currentSessionId
		) {
			setCreatedInitialSession(true);
			// Small delay to ensure DOM is ready
			setTimeout(() => {
				createNewSession();
			}, 100);
		}
	});

	// Debounced search
	$effect(() => {
		if (searchQuery !== lastSearchQuery) {
			lastSearchQuery = searchQuery;
			if (searchTimeout) clearTimeout(searchTimeout);
			searchTimeout = setTimeout(() => {
				if (searchQuery?.trim()) {
					searchChats(searchQuery);
				} else {
					searchResults = [];
				}
			}, 300);
		}
	});

	// Create initial session if none exist (only once)
	$effect(() => {
		if (!hasCreatedInitialSession && sessions.length === 0 && !currentSessionId) {
			setCreatedInitialSession(true);
			// Small delay to ensure DOM is ready
			setTimeout(() => {
				createNewSession();
			}, 100);
		}
	});

	// Auto-select first session if available and none selected
	$effect(() => {
		if (!currentSessionId && sessions.length > 0) {
			loadSession(sessions[0].id);
		}
	});

	// Test function for database connectivity (call from browser console)
	async function testDatabaseConnection() {
		try {
			console.log('🧪 Testing database connection...');

			// Test session creation
			const sessionRes = await fetch('/api/sessions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ title: 'Test Session' })
			});

			if (sessionRes.ok) {
				const testSession = await sessionRes.json();
				console.log('✅ Session creation successful:', testSession);

				// Test message saving
				const messageRes = await fetch('/api/messages', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						sessionId: testSession.id,
						senderType: 'user',
						content: 'Test message'
					})
				});

				if (messageRes.ok) {
					console.log('✅ Message saving successful');
				} else {
					console.log('❌ Message saving failed:', await messageRes.text());
				}

				// Clean up test session
				await fetch(`/api/sessions?id=${testSession.id}`, { method: 'DELETE' });
				console.log('🧹 Cleaned up test session');
			} else {
				console.log('❌ Session creation failed:', await sessionRes.text());
			}
		} catch (error) {
			console.error('❌ Database test failed:', error);
		}
	}

	// Test LaTeX rendering function
	async function testLatexRendering() {
		const testMessage = `# LaTeX Test

## Inline Math
This is an inline equation: $E = mc^2$

## Display Math
$$
\\sum_{i=1}^n i = \\frac{n(n+1)}{2}
$$

## Greek Letters
Alpha: $\\alpha$, Beta: $\\beta$, Gamma: $\\gamma$

## Fractions and Roots
Fraction: $\\frac{1}{2}$, Square root: $\\sqrt{x}$, Cube root: $\\sqrt[3]{x}$

## Integrals and Derivatives
Integral: $\\int_{a}^{b} x^2 \\,dx$, Derivative: $\\frac{d}{dx}x^2 = 2x$

## Matrices
$$
\\begin{pmatrix}
a & b \\\\
c & d
\\end{pmatrix}
$$

## Limits and Series
Limit: $\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$

Series: $\\sum_{n=0}^\\infty \\frac{1}{n!} = e$
`;

		// Add test message to chat
		messages = [
			{ role: 'system', content: 'You are a helpful AI assistant.' },
			{ role: 'user', content: 'Show me LaTeX rendering test' },
			{ role: 'assistant', content: testMessage }
		];
		currentSessionId = 'test-latex';
		console.log('🧮 LaTeX test message added to chat');
	}

	// Test hydration fix
	function testHydration() {
		console.log('🧪 Testing hydration compatibility...');
		console.log('Browser:', typeof window !== 'undefined');
		console.log('Svelte version: 5 (with runes)');
		console.log('Current session:', currentSessionId);
		console.log('Messages count:', messages.length);
		console.log('Sessions loaded:', sessions.length);
		console.log('KaTeX loaded:', typeof window !== 'undefined' && window.katex ? 'Yes' : 'No');
		return 'Hydration test completed successfully!';
	}

	// Expose test functions to window for console access
	if (typeof window !== 'undefined') {
		window.testDatabaseConnection = testDatabaseConnection;
		window.testLatexRendering = testLatexRendering;
		window.testHydration = testHydration;
	}
</script>

<!-- Dark background gradient -->
<div class="fixed inset-0 -z-10 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"></div>

<!-- Main layout -->
<div class="flex h-screen w-full overflow-hidden text-gray-100">
	<ChatSidebar
		sessions={$chatStore.sessions}
		currentSessionId={$chatStore.currentSessionId}
		bind:searchQuery
		searchResults={$chatStore.searchResults}
		editingSessionId={$chatStore.editingSessionId}
		{editingTitle}
		on:newSession={createNewSession}
		on:loadSession={({ detail }) => loadSession(detail.sessionId)}
		on:deleteSession={({ detail }) => deleteChatSession(detail.sessionId)}
		on:editTitle={({ detail }) => startEditingTitle(detail.sessionId, detail.title)}
		on:titleInput={(e) => {
			// Update the store's editing title
			setEditingSession($chatStore.editingSessionId, e.detail);
		}}
		on:saveTitle={saveTitleEdit}
		on:cancelTitle={cancelTitleEdit}
	/>

	<!-- Main Content -->
	<div class="flex flex-1 flex-col overflow-hidden">
		<ChatHeader />

		<!-- Chat area -->
		<main class="flex-1 overflow-y-auto px-2 sm:px-0">
			<div class="mx-auto flex min-h-full max-w-5xl flex-col pb-32">
				<ChatMessages
					messages={$chatStore.messages}
					loading={$chatStore.loading}
					bind:chatContainer
				/>
			</div>
		</main>

		<ChatInput
			{userInput}
			loading={$chatStore.loading}
			error={$chatStore.error}
			on:sendMessage={sendMessage}
			on:input={(e) => {
				console.log('Main page received input event:', e.detail);
				userInput = e.detail;
			}}
		/>
	</div>
</div>

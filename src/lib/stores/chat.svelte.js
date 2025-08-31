// @ts-nocheck - Disable TypeScript checking for this file to focus on functionality

import { writable } from 'svelte/store';

// Import services
import {
	getSessions as apiGetSessions,
	createSession as apiCreateSession,
	deleteSession as apiDeleteSession,
	updateSessionTitle as apiUpdateSessionTitle,
	getMessages as apiGetMessages,
	saveMessage as apiSaveMessage,
	searchConversations as apiSearchConversations
} from '../services/api.js';

import {
	sendMessage as chatSendMessage,
	generateSmartTitle,
	generateLocalTitle
} from '../services/chat.js';

/**
 * @typedef {Object} Message
 * @property {'user' | 'assistant' | 'system'} role
 * @property {string} content
 */

/**
 * @typedef {Object} Session
 * @property {string} id
 * @property {string} title
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} ChatState
 * @property {Message[]} messages
 * @property {boolean} loading
 * @property {string} error
 * @property {Session[]} sessions
 * @property {string|null} currentSessionId
 * @property {string} searchQuery
 * @property {any[]} searchResults
 * @property {string|null} editingSessionId
 * @property {string} editingTitle
 * @property {boolean} isHydrated
 * @property {boolean} hasInitialized
 * @property {boolean} hasCreatedInitialSession
 * @property {number|null} searchTimeout
 * @property {string} lastSearchQuery
 */

// Chat state store
export const chatStore = writable(
	/** @type {ChatState} */ ({
		messages: [{ role: 'system', content: 'You are a helpful AI assistant.' }],
		loading: false,
		error: '',
		sessions: [],
		currentSessionId: null,
		searchQuery: '',
		searchResults: [],
		editingSessionId: null,
		editingTitle: '',
		isHydrated: false,
		hasInitialized: false,
		hasCreatedInitialSession: false,
		searchTimeout: null,
		lastSearchQuery: ''
	})
);

// Helper functions for common operations
/**
 * @param {Message} message
 */
export function addMessage(message) {
	chatStore.update((state) => ({
		...state,
		messages: [...state.messages, message]
	}));
}

/**
 * @param {Message[]} messages
 */
export function updateMessages(messages) {
	chatStore.update((state) => ({
		...state,
		messages
	}));
}

/**
 * @param {boolean} loading
 */
export function setLoading(loading) {
	chatStore.update((state) => ({
		...state,
		loading
	}));
}

/**
 * @param {string} error
 */
export function setError(error) {
	chatStore.update((state) => ({
		...state,
		error
	}));
}

/**
 * @param {Session[]} sessions
 */
export function setSessions(sessions) {
	chatStore.update((state) => ({
		...state,
		sessions
	}));
}

/**
 * @param {string|null} sessionId
 */
export function setCurrentSession(sessionId) {
	chatStore.update((state) => ({
		...state,
		currentSessionId: sessionId
	}));
}

/**
 * @param {string} query
 */
export function setSearchQuery(query) {
	chatStore.update((state) => ({
		...state,
		searchQuery: query
	}));
}

/**
 * @param {any[]} results
 */
export function setSearchResults(results) {
	chatStore.update((state) => ({
		...state,
		searchResults: results
	}));
}

/**
 * @param {string|null} sessionId
 * @param {string} title
 */
export function setEditingSession(sessionId, title = '') {
	chatStore.update((state) => ({
		...state,
		editingSessionId: sessionId,
		editingTitle: title
	}));
}

export function clearEditing() {
	chatStore.update((state) => ({
		...state,
		editingSessionId: null,
		editingTitle: ''
	}));
}

/**
 * @param {boolean} hydrated
 */
export function setHydrated(hydrated) {
	chatStore.update((state) => ({
		...state,
		isHydrated: hydrated
	}));
}

/**
 * @param {boolean} initialized
 */
export function setInitialized(initialized) {
	chatStore.update((state) => ({
		...state,
		hasInitialized: initialized
	}));
}

/**
 * @param {boolean} created
 */
export function setCreatedInitialSession(created) {
	chatStore.update((state) => ({
		...state,
		hasCreatedInitialSession: created
	}));
}

// Business logic functions

export function initializeChat() {
	setInitialized(true);
	loadSessions();
}

export async function loadSessions() {
	try {
		const sessions = await apiGetSessions();
		setSessions(sessions);
	} catch (error) {
		setError('Failed to load sessions');
	}
}

export async function createNewSession() {
	setLoading(true);
	const newSession = createLocalSession();
	loadSessions();
	setLoading(false);
	return newSession;
}

function createLocalSession() {
	const localSessionId = 'local-' + Date.now();
	setCurrentSession(localSessionId);
	chatStore.update((state) => ({
		...state,
		messages: [{ role: 'system', content: 'You are a helpful AI assistant.' }]
	}));
	return { id: localSessionId, title: generateLocalTitle() };
}

export async function loadSession(sessionId) {
	try {
		setLoading(true);
		if (sessionId.startsWith('local-')) {
			setCurrentSession(sessionId);
			chatStore.update((state) => ({
				...state,
				messages: [{ role: 'system', content: 'You are a helpful AI assistant.' }]
			}));
			return;
		}

		const sessionMessages = await apiGetMessages(sessionId);
		const messages = [
			{ role: 'system', content: 'You are a helpful AI assistant.' },
			...sessionMessages.map((msg) => ({
				role: msg.sender_type === 'user' ? 'user' : 'assistant',
				content: msg.content
			}))
		];
		chatStore.update((state) => ({ ...state, messages }));
		setCurrentSession(sessionId);
	} catch (error) {
		setError('Failed to load session');
	} finally {
		setLoading(false);
	}
}

export async function sendMessage(userInput) {
	if (!userInput.trim()) {
		return;
	}

	try {
		setLoading(true);
		let currentState;
		chatStore.subscribe((state) => {
			currentState = state;
		})();

		// Ensure we have a current session
		if (!currentState.currentSessionId) {
			createNewSession();
			// Re-get the state after creating session
			chatStore.subscribe((state) => {
				currentState = state;
			})();
		}

		// Use the chat service for sending messages
		const result = await chatSendMessage(
			userInput,
			currentState,
			(messages) => chatStore.update((state) => ({ ...state, messages })),
			apiSaveMessage,
			apiSaveMessage,
			async (sessionId, title) => {
				const smartTitle = generateSmartTitle(title);
				await apiUpdateSessionTitle(sessionId, smartTitle);
				loadSessions();
			}
		);

		// If a local session was converted to a database session, update the current session ID
		if (result && result.newSessionId) {
			setCurrentSession(result.newSessionId);
			loadSessions(); // Refresh sessions list to include the new session
		}
	} catch (error) {
		setError('Failed to send message');
	} finally {
		setLoading(false);
	}
}

export async function deleteChatSession(sessionId) {
	try {
		setLoading(true);
		await apiDeleteSession(sessionId);
		loadSessions();
		let currentId;
		chatStore.subscribe((state) => {
			currentId = state.currentSessionId;
		})();
		if (currentId === sessionId) {
			createNewSession();
		}
	} catch (error) {
		setError('Failed to delete session');
	} finally {
		setLoading(false);
	}
}

export async function updateTitle(sessionId, title) {
	try {
		await apiUpdateSessionTitle(sessionId, title);
		loadSessions();
	} catch (error) {
		setError('Failed to update title');
	}
}

export async function searchChats(query) {
	try {
		setSearchQuery(query);
		if (!query.trim()) {
			setSearchResults([]);
			return;
		}
		const results = await apiSearchConversations(query);
		setSearchResults(results);
	} catch (error) {
		setSearchResults([]);
	}
}

export function startEditingTitle(sessionId, currentTitle) {
	setEditingSession(sessionId, currentTitle);
}

export async function saveTitleEdit(sessionId, newTitle) {
	try {
		await updateTitle(sessionId, newTitle);
		clearEditing();
	} catch (error) {
		// Error already handled in updateTitle
	}
}

export function cancelTitleEdit() {
	clearEditing();
}

export function markHydrated() {
	setHydrated(true);
}

export async function createInitialSession() {
	setCreatedInitialSession(true);
	setTimeout(() => createNewSession(), 100);
}

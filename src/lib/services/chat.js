// Chat Service - Business logic for chat operations

import { sendChatMessage } from './api.js';
import { processStreamingResponse } from './streaming.js';

/**
 * @typedef {Object} ChatState
 * @property {Array<{role: string, content: string}>} messages
 * @property {string} currentSessionId
 */

/**
 * Send a message and handle the complete flow
 * @param {string} userInput - User's message
 * @param {ChatState} currentState - Current chat state
 * @param {Function} updateMessages - Function to update messages in store
 * @param {Function} saveUserMessage - Function to save user message
 * @param {Function} saveAssistantMessage - Function to save assistant message
 * @param {Function} updateTitleIfNeeded - Function to update title if first message
 * @returns {Promise<{newSessionId?: string} | void>}
 */
export async function sendMessage(
	userInput,
	currentState,
	updateMessages,
	saveUserMessage,
	saveAssistantMessage,
	updateTitleIfNeeded
) {
	if (!userInput.trim()) {
		return;
	}

	/** @type {Array<{role: string, content: string}>} */
	const messages = currentState.messages;
	/** @type {string} */
	const currentSessionId = currentState.currentSessionId;

	const userMessage = { role: 'user', content: userInput };
	const newMessages = [...messages, userMessage, { role: 'assistant', content: '' }];
	updateMessages(newMessages);

	const userMessageResult = await saveUserMessage(currentSessionId, 'user', userInput);

	// Use the new session ID if it was converted, otherwise use the original
	let actualSessionId = currentSessionId;
	if (userMessageResult && userMessageResult.newSessionId) {
		actualSessionId = userMessageResult.newSessionId;
	}

	// Generate smart title from first user message
	const isFirstUserMessage =
		messages.filter((/** @type {{role: string}} */ m) => m.role === 'user').length === 1;
	if (isFirstUserMessage && actualSessionId && !actualSessionId.startsWith('local-')) {
		await updateTitleIfNeeded(actualSessionId, userInput);
	}

	const messagesForAI = messages.concat([userMessage]);
	const response = await sendChatMessage(messagesForAI);

	await processStreamingResponse(
		response,
		(/** @type {string} */ _chunk, /** @type {string} */ accumulated) => {
			const updatedMessages = [
				...messages,
				userMessage,
				{ role: 'assistant', content: accumulated }
			];
			updateMessages(updatedMessages);
		},
		async (/** @type {string} */ finalResponse) => {
			const assistantMessageResult = await saveAssistantMessage(
				actualSessionId,
				'assistant',
				finalResponse
			);

			// Generate smart title from first AI response if no title was set yet
			const isFirstAssistantMessage =
				messages.filter((/** @type {{role: string}} */ m) => m.role === 'assistant').length === 0;
			if (isFirstAssistantMessage && actualSessionId && !actualSessionId.startsWith('local-')) {
				// Only generate title from AI if we haven't generated one from user message
				const hasUserMessage = messages.some(
					(/** @type {{role: string}} */ m) => m.role === 'user'
				);
				if (!hasUserMessage) {
					await updateTitleIfNeeded(actualSessionId, finalResponse);
				}
			}

			// If the assistant message also triggered session conversion, use that session ID
			if (assistantMessageResult && assistantMessageResult.newSessionId) {
				actualSessionId = assistantMessageResult.newSessionId;
			}
		}
	);

	// Return the session ID that was actually used (new one if converted)
	if (actualSessionId !== currentSessionId) {
		return { newSessionId: actualSessionId };
	}
}

/**
 * Generate a smart title from the first message
 * @param {string} message - The first user message
 * @returns {string} - Generated title
 */
export function generateSmartTitle(message) {
	if (!message || message.trim().length === 0) {
		return generateLocalTitle();
	}

	// Common question patterns to detect
	const questionPatterns = [
		{
			pattern:
				/^(what|how|why|when|where|who|which|can you|could you|would you|do you|are you|is there|should i)/i,
			prefix: ''
		},
		{ pattern: /^(explain|tell me about|help me with|show me)/i, prefix: '' },
		{ pattern: /^(i need|please)/i, prefix: '' }
	];

	let processedMessage = message.trim();

	// Apply question pattern transformations
	for (const { pattern, prefix } of questionPatterns) {
		if (pattern.test(processedMessage)) {
			processedMessage = prefix + processedMessage;
			break;
		}
	}

	// Clean the message
	let cleanMessage = processedMessage
		.replace(/\s+/g, ' ') // Replace multiple spaces with single space
		.replace(/[^\w\s.,!?-]/g, '') // Remove special characters except basic punctuation
		.replace(
			/\b(i|me|my|you|your|it|this|that|these|those|he|she|him|her|we|us|our|they|them|their)\b/gi,
			''
		) // Remove pronouns
		.replace(/\s+/g, ' ') // Clean up extra spaces again
		.trim()
		.substring(0, 60); // Limit length

	// Don't cut words in half
	const lastSpace = cleanMessage.lastIndexOf(' ');
	if (lastSpace > 30 && cleanMessage.length > 50) {
		cleanMessage = cleanMessage.substring(0, lastSpace);
	}

	// Capitalize first letter
	if (cleanMessage.length > 0) {
		cleanMessage = cleanMessage.charAt(0).toUpperCase() + cleanMessage.slice(1);
	}

	// Add ellipsis if truncated
	const originalLength = processedMessage.length;
	if (cleanMessage.length < originalLength && cleanMessage.length > 0) {
		cleanMessage += '...';
	}

	return cleanMessage || generateLocalTitle();
}

/**
 * Generate a local title for sessions
 * @returns {string} - Generated local title
 */
export function generateLocalTitle() {
	const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	return `Chat ${timestamp}`;
}

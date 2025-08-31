<script>
	import { marked } from 'marked';
	import hljs from 'highlight.js';
	import 'highlight.js/styles/github-dark.css';
	import { browser } from '$app/environment';

	export let content = '';

	// Only import KaTeX on client-side to avoid hydration issues
	let katex = null;
	let katexLoaded = false;

	if (browser) {
		import('katex')
			.then((module) => {
				katex = module.default;
				katexLoaded = true;
				// Trigger re-render when KaTeX is loaded
				renderedHtml = renderedHtml;
			})
			.catch((err) => {
				console.warn('KaTeX failed to load:', err);
			});

		// Also load KaTeX CSS
		import('katex/dist/katex.min.css').catch((err) => {
			console.warn('KaTeX CSS failed to load:', err);
		});
	}

	// Configure marked with custom renderer for syntax highlighting and LaTeX
	const renderer = new marked.Renderer();

	renderer.code = function (code, language) {
		const validLang = hljs.getLanguage(language || '') ? language || '' : 'plaintext';
		const highlighted = hljs.highlight(code || '', { language: validLang }).value;
		return `<pre class="hljs"><code class="hljs language-${validLang}">${highlighted}</code></pre>`;
	};

	// Handle inline math expressions ($...$) - only on client
	renderer.codespan = function (text) {
		// Check if it's a LaTeX math expression
		if (text.startsWith('$') && text.endsWith('$') && text.length > 2) {
			if (browser && katexLoaded && katex) {
				try {
					const latex = text.slice(1, -1); // Remove $...$
					return katex.renderToString(latex, {
						throwOnError: false,
						displayMode: false
					});
				} catch (error) {
					console.warn('KaTeX inline math error:', error);
					return `<code>${text}</code>`; // Fallback to code
				}
			} else {
				// Server-side or KaTeX not loaded - return as plain text
				return `<code>${text}</code>`;
			}
		}
		return `<code>${text}</code>`; // Regular inline code
	};

	marked.setOptions({
		renderer: renderer,
		gfm: true,
		breaks: true
	});

	let renderedHtml = '';
	$: {
		try {
			let processedContent = content || '';

			// Handle display math expressions ($$...$$ or \[...\]) - only on client
			if (browser && katexLoaded && katex) {
				processedContent = processedContent
					// Replace $$...$$ with KaTeX display mode
					.replace(/\$\$([^$]+)\$\$/g, (match, latex) => {
						try {
							return katex.renderToString(latex, {
								throwOnError: false,
								displayMode: true
							});
						} catch (error) {
							console.warn('KaTeX display math error:', error);
							return match; // Keep original if error
						}
					})
					// Replace \[...\] with KaTeX display mode
					.replace(/\\\[([^\\]+)\\\]/g, (match, latex) => {
						try {
							return katex.renderToString(latex, {
								throwOnError: false,
								displayMode: true
							});
						} catch (error) {
							console.warn('KaTeX display math error:', error);
							return match; // Keep original if error
						}
					});
			}

			const result = marked.parse(processedContent);
			renderedHtml = typeof result === 'string' ? result : '';
		} catch (error) {
			console.error('Markdown parsing error:', error);
			renderedHtml = content || '';
		}
	}
</script>

<!-- Safe rendering with client-side checks -->
<div class="prose prose-invert dark:prose-invert max-w-none">
	{#if browser && !katexLoaded && content?.includes('$')}
		<div class="math-loading-notice">
			<small class="text-gray-400">Loading mathematical expressions...</small>
		</div>
	{/if}
	{@html renderedHtml}
</div>

<style>
	/* KaTeX styling for dark theme */
	.katex {
		font-size: 1.1em;
		color: #f9fafb;
	}

	.katex-display {
		margin: 1rem 0;
		text-align: center;
	}

	.katex-display > .katex {
		font-size: 1.2em;
	}

	/* Math expression colors */
	.katex .base {
		color: #f9fafb;
	}

	.katex .strut {
		display: inline-block;
	}

	.katex .frac-line {
		border-bottom-style: solid;
		border-bottom-width: 0.04em;
		border-bottom-color: #f9fafb;
	}

	.katex .sizing.reset-size6.size1,
	.katex .sizing.reset-size6.size2,
	.katex .sizing.reset-size6.size3,
	.katex .sizing.reset-size6.size4,
	.katex .sizing.reset-size6.size5,
	.katex .sizing.reset-size6.size6 {
		font-size: 1em;
	}

	/* Ensure math expressions are visible on dark background */
	.katex .mord {
		color: #f9fafb;
	}

	.katex .mbin {
		color: #f9fafb;
	}

	.katex .mrel {
		color: #f9fafb;
	}

	.katex .mopen {
		color: #f9fafb;
	}

	.katex .mclose {
		color: #f9fafb;
	}

	.katex .mpunct {
		color: #f9fafb;
	}

	.katex .msupsub {
		text-shadow: none;
	}

	/* Fix for inline math spacing */
	.katex:not(.katex-display) {
		display: inline-block;
		vertical-align: middle;
		margin: 0 0.1em;
	}

	/* Loading notice for math expressions */
	.math-loading-notice {
		background: rgba(55, 65, 81, 0.5);
		border: 1px solid rgba(75, 85, 99, 0.5);
		border-radius: 0.375rem;
		padding: 0.5rem;
		margin: 0.5rem 0;
		text-align: center;
	}

	/* Fallback styling for unrendered math expressions */
	.prose :global(code) {
		/* Style inline code that might contain math */
		font-family: 'JetBrains Mono', 'Fira Code', monospace;
		background: rgba(55, 65, 81, 0.5);
		padding: 0.125rem 0.25rem;
		border-radius: 0.25rem;
		font-size: 0.875em;
	}

	/* Ensure proper spacing around math expressions */
	.prose :global(.katex) {
		line-height: 1.2;
	}

	.prose :global(.katex-display) {
		line-height: 1.4;
	}
</style>

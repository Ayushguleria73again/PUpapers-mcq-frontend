/**
 * PRE-RENDER MARKDOWN CLEANER
 * A final pass before ReactMarkdown to ensure zero-duplication and KaTeX safety.
 */
export const cleanMarkdownForRendering = (content: string) => {
    if (!content) return '';
    let cleaned = content;

    // 1. Remove residual line-level duplications
    // Often caused by block selectors on some physics sites
    const lines = cleaned.split('\n');
    const uniqueLines: string[] = [];
    let lastLine = '';

    for (const line of lines) {
        const trimmed = line.trim();
        // Skip if it's an exact duplicate of the previous line and not empty
        if (trimmed && trimmed === lastLine) continue;
        uniqueLines.push(line);
        lastLine = trimmed;
    }
    cleaned = uniqueLines.join('\n');

    // 2. Ensure math blocks are properly wrapped for remark-math
    // Detects $...$ and converts them to $$...$$ if they are alone on a line for better display
    cleaned = cleaned.replace(/^(\$.*\$)$/gm, '\n\n$1\n\n');

    // 3. Normalize minus and times symbols (Final safety check)
    cleaned = cleaned.replace(/−/g, '-');
    cleaned = cleaned.replace(/×/g, '\\times');

    return cleaned;
};

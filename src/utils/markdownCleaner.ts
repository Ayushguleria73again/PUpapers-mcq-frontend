/**
 * PRE-RENDER MARKDOWN CLEANER (ACADEMIC GRADE)
 * Standardizes escaped LaTeX, fixes broken exponents, and ensures KaTeX compatibility.
 */
export const cleanMarkdownForRendering = (content: string) => {
    if (!content) return '';
    let cleaned = content;

    // 1. FIX ESCAPED LATEX WRAPPERS: \[ \] -> $$
    // We convert escaped brackets often found in DB storage to standard Markdown Math
    cleaned = cleaned.replace(/\\\[/g, '$$$$');
    cleaned = cleaned.replace(/\\\]/g, '$$$$');

    // 2. UNESCAPE MATH COMMANDS: \\times -> \times, \\frac -> \frac
    // Fixes double-escaping issues from DB/JSON storage
    cleaned = cleaned.replace(/\\\\([a-z]+)/g, '\\$1');

    // 3. NORMALIZE EXPONENTS: ML2 -> ML^2
    // Dimensional analysis shorthand normalization
    cleaned = cleaned.replace(/([MLTPQ])(\-?\d+)/g, (match, variable, value) => {
        return `${variable}^{${value}}`;
    });

    // 4. PREVENT CHARACTER SPLITTING (M L T)
    // Ensures math blocks are treated as single KaTeX entities
    // This often happens when spaces are inserted between characters in a math formula
    cleaned = cleaned.replace(/([MLT])\s+([MLT])/g, '$1$2');

    // 5. LINE-LEVEL DEDUPLICATION
    const lines = cleaned.split('\n');
    const uniqueLines: string[] = [];
    let lastLine = '';

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && trimmed === lastLine) continue;
        uniqueLines.push(line);
        lastLine = trimmed;
    }
    cleaned = uniqueLines.join('\n');

    // 6. SYMBOL NORMALIZATION
    cleaned = cleaned.replace(/−/g, '-');
    cleaned = cleaned.replace(/×/g, '\\times');

    return cleaned.trim();
};

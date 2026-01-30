/**
 * PRE-RENDER MARKDOWN CLEANER (ACADEMIC GRADE)
 * Standardizes escaped LaTeX, fixes fragmented math blocks, and prevents character splitting.
 */
export const cleanMarkdownForRendering = (content: string) => {
    if (!content) return '';
    let cleaned = content;

    // 1. FIX DOUBLE-ESCAPED COMMANDS (from DB storage)
    // \\times -> \times, \\frac -> \frac
    cleaned = cleaned.replace(/\\\\([a-z]+)/g, '\\$1');

    // 2. CONSOLIDATE FRAGMENTED DIMENSIONAL SYMBOLS (M L T)
    // Joins M, L, T, P, Q if they are split by spaces or newlines
    cleaned = cleaned.replace(/([MLTPQ])\n+([MLTPQ])/g, '$1$2');
    cleaned = cleaned.replace(/([MLTPQ])\s+([MLTPQ])/g, '$1$2');

    // 3. EQUATION CONSOLIDATION: $$P$$ = ML2 -> $$ P = ML^2 $$
    // This handles cases where only part of the equation was wrapped in math markers
    const rawLines = cleaned.split('\n');
    const consolidatedLines = rawLines.map(line => {
        const trimmed = line.trim();
        if (trimmed.includes('$$') && !trimmed.startsWith('$$')) {
            // Remove all existing markers and re-wrap the whole cohesive line
            let equation = trimmed.replace(/\$\$/g, '').trim();
            // Normalize shorthand exponents (ML2 -> ML^{2})
            equation = equation.replace(/([MLTPQ])(\-?\d+)/g, '$1^{$2}');
            return `$$ ${equation} $$`;
        }
        return line;
    });
    cleaned = consolidatedLines.join('\n');

    // 4. WRAPPER CONVERSION: \[ \] -> $$
    cleaned = cleaned.replace(/\\\[/g, ' $$ ');
    cleaned = cleaned.replace(/\\\]/g, ' $$ ');

    // 5. NORMALIZE REMAINING SHORTHANDS
    cleaned = cleaned.replace(/([MLTPQ])(\-?\d+)/g, '$1^{$2}');

    // 6. SYMBOL STANDARDIZATION
    cleaned = cleaned.replace(/−/g, '-');
    cleaned = cleaned.replace(/×/g, '\\times');

    // 7. LINE-LEVEL DEDUPLICATION & CLEANUP
    const finalLines = cleaned.split('\n');
    const uniqueLines: string[] = [];
    let lastLine = '';

    for (const line of finalLines) {
        const trimmed = line.trim();
        if (trimmed && trimmed === lastLine) continue;
        uniqueLines.push(line);
        lastLine = trimmed;
    }

    return uniqueLines.join('\n').trim();
};

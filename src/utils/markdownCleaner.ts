/**
 * SUPREME MARKDOWN CLEANER (EDTECH GRADE)
 * Solves:
 * 1. Vertical Fragmentation (M\nL\nT -> MLT)
 * 2. Mixed Math Markers ($P$ = ML2 -> $$ P = ML^2 $$)
 * 3. Double Escaping (\\times -> \times)
 * 4. Exponent Shorthand (ML2 -> ML^{2})
 */
export const cleanMarkdownForRendering = (content: string) => {
    if (!content) return '';
    let cleaned = content;

    // 1. UNESCAPE PASS
    // Fixes double-escaping from JSON/DB storage
    cleaned = cleaned.replace(/\\\\([a-z]+)/g, '\\$1');
    cleaned = cleaned.replace(/\\\[/g, ' $$ ');
    cleaned = cleaned.replace(/\\\]/g, ' $$ ');

    // 2. VERTICAL CHARACTER RECONSTRUCTION (The "Vertical Stack" Fix)
    // Aggressively pulls lone dimensional symbols and signs from newlines
    // This solves the: M \n L \n T \n - \n 2 problem
    const charsToJoin = /[MLTPQ0-9\-\^−]/;
    const lines = cleaned.split('\n');
    const reconstructed: string[] = [];
    let mathBuffer = '';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        // If it's a very short line (1-2 chars) and matches math symbols
        if (line.length > 0 && line.length <= 2 && charsToJoin.test(line)) {
            mathBuffer += line;
        } else {
            if (mathBuffer) {
                // If the next line is also a continuation of an equation but slightly longer
                if (line.startsWith('=') || line.startsWith('+') || line.startsWith('-')) {
                    mathBuffer += ' ' + line;
                } else {
                    reconstructed.push(`$$ ${mathBuffer} $$`);
                    mathBuffer = '';
                    if (line) reconstructed.push(line);
                }
            } else {
                if (line) reconstructed.push(line);
            }
        }
    }
    if (mathBuffer) reconstructed.push(`$$ ${mathBuffer} $$`);
    cleaned = reconstructed.join('\n');

    // 3. MIXED MARKER CONSOLIDATION (The "$P$ = ML2" Fix)
    // If a line contains $ but is mostly an equation, wrap the whole thing in $$
    cleaned = cleaned.split('\n').map(line => {
        const trimmed = line.trim();
        if ((trimmed.includes('$') || trimmed.includes('\\')) && !trimmed.startsWith('$$')) {
            // Remove existing markers and consolidate
            let eq = trimmed.replace(/\$\$?/g, '').trim();
            // Don't wrap if it's just plain text with a single random symbol
            if (eq.length > 1 && (eq.includes('=') || eq.includes('\\') || /[MLTPQ]\d+/.test(eq))) {
                return `$$ ${eq} $$`;
            }
        }
        return line;
    }).join('\n');

    // 4. EXPONENT NORMALIZATION (ML2 -> ML^{2})
    cleaned = cleaned.replace(/([MLTPQ])(\-?\d+)/g, '$1^{$2}');

    // 5. MATH SYMBOL STANDARDIZATION
    cleaned = cleaned.replace(/−/g, '-');
    cleaned = cleaned.replace(/×/g, '\\times');
    cleaned = cleaned.replace(/([MLTPQ])\s+([MLTPQ])/g, '$1$2'); // ML T -> MLT

    // 6. FINAL CLEANUP (Remove empty blocks and redundant markers)
    cleaned = cleaned.replace(/\$\$\s+\$\$/g, '');

    // Deduplicate lines that might have been doubled during reconstruction
    const finalLines = cleaned.split('\n');
    const unique: string[] = [];
    let prev = '';
    for (const l of finalLines) {
        const t = l.trim();
        if (t === prev && t.length > 0) continue;
        unique.push(l);
        prev = t;
    }

    return unique.join('\n').trim();
};

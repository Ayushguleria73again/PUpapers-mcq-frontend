/**
 * SUPREME MARKDOWN CLEANER (ACADEMIC GRADE - V4)
 * Handles extremely messy, fragmented, and duplicated mathematical content.
 */
export const cleanMarkdownForRendering = (content: string) => {
    if (!content) return '';
    let cleaned = content;

    // 1. UNESCAPE & WRAPPER NORMALIZATION
    cleaned = cleaned.replace(/\\\\([a-z]+)/g, '\\$1');
    cleaned = cleaned.replace(/\\\[/g, ' $$ ');
    cleaned = cleaned.replace(/\\\]/g, ' $$ ');

    // 2. AGGRESSIVE VERTICAL RECONSTRUCTION
    // Scraped data often splits EVERYTHING (words + math) into 1 char per line
    const lines = cleaned.split('\n');
    const reconstructed: string[] = [];
    let buffer = '';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        // If the line is 1 character or a symbol, it's likely part of a fragmented word/equation
        if (line.length > 0 && line.length <= 2) {
            buffer += line;
        } else {
            if (buffer) {
                // Determine if the completed buffer looks like math or text
                const isMath = /[\d\+\-\=\^×\\$\(\)]/.test(buffer) || /[MLTPQ]/.test(buffer);
                if (isMath) reconstructed.push(`$$ ${buffer} $$`);
                else reconstructed.push(buffer);
                buffer = '';
            }
            if (line) reconstructed.push(line);
        }
    }
    if (buffer) reconstructed.push(buffer);
    cleaned = reconstructed.join('\n');

    // 3. SHADOW CONTENT DEDUPLICATION
    // Study sites often render: Text LaTeX Text
    // Example: muscle×speed=powermuscle×speed=power
    cleaned = cleaned.split('\n').map(line => {
        const mid = Math.floor(line.length / 2);
        const firstHalf = line.substring(0, mid).trim();
        const secondHalf = line.substring(mid).trim();
        if (firstHalf === secondHalf && line.length > 4) return firstHalf;
        return line;
    }).join('\n');

    // 4. EQUATION UNIFICATION ($P$ = ML2 -> $$ P = ML^2 $$)
    cleaned = cleaned.split('\n').map(line => {
        const trimmed = line.trim();
        if ((trimmed.includes('$') || trimmed.includes('\\') || trimmed.includes('=')) && !trimmed.startsWith('$$')) {
            let eq = trimmed.replace(/\$\$?/g, '').trim();
            // Wrap if it contains dimensional symbols or assignments
            if (eq.length > 1 && (/[MLTPQ]\w*/.test(eq) || eq.includes('='))) {
                return `$$ ${eq} $$`;
            }
        }
        return line;
    }).join('\n');

    // 5. DIMENSIONAL NORMALIZATION (ML2 -> ML^{2})
    cleaned = cleaned.replace(/([MLTPQ])(\-?\d+)/g, '$1^{$2}');

    // 6. SYMBOL CORRECTION
    cleaned = cleaned.replace(/−/g, '-');
    cleaned = cleaned.replace(/×/g, '\\times');
    // Remove space between dimensional units (M L T -> MLT)
    cleaned = cleaned.replace(/([MLTPQ])\s+([MLTPQ])/g, '$1$2');

    // 7. REMOVE REDUNDANT HEADERS & NOISE
    cleaned = cleaned.replace(/Explanation\s*Explanation/gi, 'Explanation');
    cleaned = cleaned.replace(/###\s*Step\s*\d+:\s*###/gi, (match) => match.replace(/###/g, '').trim());

    // 8. FINAL DEDUPLICATION
    const finalLines = cleaned.split('\n');
    const unique: string[] = [];
    let last = '';
    for (const l of finalLines) {
        const t = l.trim();
        if (t === last && t.length > 0) continue;
        unique.push(l);
        last = t;
    }

    return unique.join('\n').trim();
};

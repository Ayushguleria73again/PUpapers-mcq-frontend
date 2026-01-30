/**
 * SUPREME MARKDOWN CLEANER (ACADEMIC GRADE - V5)
 * Solves:
 * 1. Fragmentation Overlap (Joined buffer vs next line redundancy)
 * 2. Mixed Math Markers ($P$ = ML2 -> $$ P = ML^2 $$)
 * 3. Shadow Content Deduplication (Mirror strings)
 * 4. Vertical Stack Removal
 */
export const cleanMarkdownForRendering = (content: string) => {
    if (!content) return '';
    let cleaned = content;

    // 1. UNESCAPE & WRAPPER NORMALIZATION
    cleaned = cleaned.replace(/\\\\([a-z]+)/g, '\\$1');
    cleaned = cleaned.replace(/\\\[/g, ' $$ ');
    cleaned = cleaned.replace(/\\\]/g, ' $$ ');

    // 2. AGGRESSIVE VERTICAL RECONSTRUCTION + REDUNDANCY CHECK
    const lines = cleaned.split('\n');
    const reconstructed: string[] = [];
    let buffer = '';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const nextLine = (lines[i + 1] || '').trim();

        // If line is very short, it's a fragment
        if (line.length > 0 && line.length <= 2) {
            buffer += line;
        } else {
            if (buffer) {
                // REDUNDANCY CHECK: If we just built "muscle" and the NEXT line is "muscle" or "muscle×speed", discard buffer
                const cleanBuffer = buffer.replace(/[\s\$\(\)]/g, '');
                const cleanNext = nextLine.replace(/[\s\$\(\)]/g, '');

                if (!cleanNext.startsWith(cleanBuffer) || cleanBuffer.length < 2) {
                    const isMath = /[\d\+\-\=\^×\\$\(\)]/.test(buffer) || /[MLTPQ]/.test(buffer);
                    if (isMath) reconstructed.push(`$$ ${buffer} $$`);
                    else reconstructed.push(buffer);
                }
                buffer = '';
            }
            if (line) reconstructed.push(line);
        }
    }
    if (buffer) reconstructed.push(buffer);
    cleaned = reconstructed.join('\n');

    // 3. FUZZY SHADOW DEDUPLICATION (Fixes "powermower" or "M=PM=P")
    cleaned = cleaned.split('\n').map(line => {
        const text = line.trim();
        if (text.length < 4) return line;

        // Check for perfect mirror or fuzzy mirrored half
        const mid = Math.floor(text.length / 2);
        const first = text.substring(0, mid).trim();
        const second = text.substring(mid).trim();

        if (first === second || first.replace(/\s/g, '') === second.replace(/\s/g, '')) {
            return first;
        }
        return line;
    }).join('\n');

    // 4. EQUATION UNIFICATION
    cleaned = cleaned.split('\n').map(line => {
        const trimmed = line.trim();
        if ((trimmed.includes('$') || trimmed.includes('\\') || trimmed.includes('=')) && !trimmed.startsWith('$$')) {
            let eq = trimmed.replace(/\$\$?/g, '').trim();
            if (eq.length > 1 && (/[MLTPQ]\w*/.test(eq) || eq.includes('=') || eq.includes('\\'))) {
                return `$$ ${eq} $$`;
            }
        }
        return line;
    }).join('\n');

    // 5. DIMENSIONAL NORMALIZATION (ML2 -> ML^{2})
    cleaned = cleaned.replace(/([MLTPQ])(\-?\d+)/g, '$1^{$2}');

    // 6. SYMBOL CORRECTION & CHARACTER JOINING
    cleaned = cleaned.replace(/−/g, '-');
    cleaned = cleaned.replace(/×/g, '\\times');
    cleaned = cleaned.replace(/([MLTPQ])\s+([MLTPQ])/g, '$1$2');

    // 7. FINAL LINE-LEVEL DEDUPLICATION (Case Insensitive)
    const finalLines = cleaned.split('\n');
    const unique: string[] = [];
    let lastNormalized = '';

    for (const l of finalLines) {
        const t = l.trim();
        const normalized = t.replace(/[\s\$\(\)]/g, '').toLowerCase();
        if (normalized && normalized === lastNormalized) continue;
        unique.push(l);
        lastNormalized = normalized;
    }

    return unique.join('\n').trim();
};

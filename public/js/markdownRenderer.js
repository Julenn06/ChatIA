export class MarkdownRenderer {
    static cache = new Map();
    static maxCacheSize = 100;
    static patterns = {
        hr1: /^---+$/gm,
        hr2: /^\*\*\*+$/gm,
        codeBlock: /```(\w+)?\n([\s\S]*?)```/g,
        linkMd: /\[([^\]]+)\]\(([^)]+)\)/g,
        urlHttps: /(^|\s)(https?:\/\/[^\s<]+)/g,
        urlWww: /(^|\s)(www\.[^\s<]+)/g,
        h3: /^### (.+)$/gm,
        h2: /^## (.+)$/gm,
        h1: /^# (.+)$/gm,
        bold1: /\*\*(.+?)\*\*/g,
        bold2: /__(.+?)__/g,
        italic1: /\*(.+?)\*/g,
        italic2: /_(.+?)_/g,
        code: /`([^`]+)`/g,
        bullet: /^[\-\*\+] (.+)$/,
        number: /^\d+\. (.+)$/
    };

    static render(text) {
        if (this.cache.has(text)) {
            const cached = this.cache.get(text);
            this.cache.delete(text);
            this.cache.set(text, cached);
            return cached;
        }

        let html = text;
        html = html.replace(this.patterns.hr1, '<hr>');
        html = html.replace(this.patterns.hr2, '<hr>');
        const codeBlocks = [];
        html = html.replace(this.patterns.codeBlock, (match, lang, code) => {
            const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
            codeBlocks.push(`<pre><code>${code}</code></pre>`);
            return placeholder;
        });
        html = html.replace(this.patterns.linkMd, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
        html = html.replace(this.patterns.urlHttps, '$1<a href="$2" target="_blank" rel="noopener noreferrer">$2</a>');
        html = html.replace(this.patterns.urlWww, '$1<a href="http://$2" target="_blank" rel="noopener noreferrer">$2</a>');
        html = html.replace(this.patterns.h3, '<h3>$1</h3>');
        html = html.replace(this.patterns.h2, '<h2>$1</h2>');
        html = html.replace(this.patterns.h1, '<h1>$1</h1>');
        html = this.renderTables(html);
        html = html.replace(this.patterns.bold1, '<strong>$1</strong>');
        html = html.replace(this.patterns.bold2, '<strong>$1</strong>');
        html = html.replace(this.patterns.italic1, '<em>$1</em>');
        html = html.replace(this.patterns.italic2, '<em>$1</em>');
        html = html.replace(this.patterns.code, '<code>$1</code>');
        html = this.renderLists(html);
        html = this.renderParagraphs(html);
        codeBlocks.forEach((code, index) => {
            html = html.replace(`__CODE_BLOCK_${index}__`, code);
        });
        if (this.cache.size >= this.maxCacheSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(text, html);

        return html;
    }

    static renderTables(html) {
        const tableRegex = /(\|.+\|\n)+/g;
        return html.replace(tableRegex, (match) => {
            const lines = match.trim().split('\n');
            if (lines.length < 2) return match;
            
            const parts = ['<table>'];
            const headers = lines[0].split('|').filter(cell => cell.trim());
            parts.push('<thead><tr>');
            for (const header of headers) {
                parts.push(`<th>${header.trim()}</th>`);
            }
            parts.push('</tr></thead><tbody>');
            for (let i = 1; i < lines.length; i++) {
                if (lines[i].includes('---')) continue;
                
                const cells = lines[i].split('|').filter(cell => cell.trim());
                if (cells.length === 0) continue;
                
                parts.push('<tr>');
                for (const cell of cells) {
                    parts.push(`<td>${cell.trim()}</td>`);
                }
                parts.push('</tr>');
            }
            parts.push('</tbody></table>');
            
            return parts.join('');
        });
    }

    static renderLists(html) {
        const lines = html.split('\n');
        const processed = [];
        let inList = false;
        let listType = null;

        for (const line of lines) {
            const bulletMatch = line.match(this.patterns.bullet);
            const numberMatch = line.match(this.patterns.number);

            if (bulletMatch) {
                if (!inList || listType !== 'ul') {
                    if (inList) processed.push(`</${listType}>`);
                    processed.push('<ul>');
                    inList = true;
                    listType = 'ul';
                }
                processed.push(`<li>${bulletMatch[1]}</li>`);
            } else if (numberMatch) {
                if (!inList || listType !== 'ol') {
                    if (inList) processed.push(`</${listType}>`);
                    processed.push('<ol>');
                    inList = true;
                    listType = 'ol';
                }
                processed.push(`<li>${numberMatch[1]}</li>`);
            } else {
                if (inList) {
                    processed.push(`</${listType}>`);
                    inList = false;
                    listType = null;
                }
                processed.push(line);
            }
        }

        if (inList) {
            processed.push(`</${listType}>`);
        }

        return processed.join('\n');
    }

    static renderParagraphs(html) {
        const blocks = html.split('\n\n');
        return blocks.map(block => {
            block = block.trim();
            if (!block) return '';
            if (block.startsWith('<')) return block;
            return '<p>' + block.replace(/\n/g, '<br>') + '</p>';
        }).join('\n');
    }
}

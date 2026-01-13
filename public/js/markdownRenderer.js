/**
 * MarkdownRenderer - Renderizado de Markdown a HTML (Optimizado)
 */
export class MarkdownRenderer {
    // Caché para renderizados previos
    static cache = new Map();
    static maxCacheSize = 100;

    // Regex pre-compiladas para mejor rendimiento
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
        // Verificar caché
        if (this.cache.has(text)) {
            return this.cache.get(text);
        }

        let html = text;

        // Usar regex pre-compiladas para mejor rendimiento
        // Líneas horizontales (--- o ***)
        html = html.replace(this.patterns.hr1, '<hr>');
        html = html.replace(this.patterns.hr2, '<hr>');

        // Bloques de código (```code```) - preservar antes de procesar enlaces
        const codeBlocks = [];
        html = html.replace(this.patterns.codeBlock, (match, lang, code) => {
            const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
            codeBlocks.push(`<pre><code>${code}</code></pre>`);
            return placeholder;
        });

        // Enlaces markdown [text](url)
        html = html.replace(this.patterns.linkMd, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

        // URLs automáticas (detectar http://, https://, www.)
        html = html.replace(this.patterns.urlHttps, '$1<a href="$2" target="_blank" rel="noopener noreferrer">$2</a>');
        html = html.replace(this.patterns.urlWww, '$1<a href="http://$2" target="_blank" rel="noopener noreferrer">$2</a>');
        
        // Headers (debe ir antes que negritas)
        html = html.replace(this.patterns.h3, '<h3>$1</h3>');
        html = html.replace(this.patterns.h2, '<h2>$1</h2>');
        html = html.replace(this.patterns.h1, '<h1>$1</h1>');

        // Tablas
        html = this.renderTables(html);

        // Negritas (**text** o __text__)
        html = html.replace(this.patterns.bold1, '<strong>$1</strong>');
        html = html.replace(this.patterns.bold2, '<strong>$1</strong>');

        // Cursiva (*text* o _text_) - debe ir después de negritas
        html = html.replace(this.patterns.italic1, '<em>$1</em>');
        html = html.replace(this.patterns.italic2, '<em>$1</em>');

        // Código inline (`code`)
        html = html.replace(this.patterns.code, '<code>$1</code>');

        // Listas
        html = this.renderLists(html);

        // Párrafos
        html = this.renderParagraphs(html);

        // Restaurar bloques de código
        codeBlocks.forEach((code, index) => {
            html = html.replace(`__CODE_BLOCK_${index}__`, code);
        });

        // Guardar en caché (con límite de tamaño)
        if (this.cache.size >= this.maxCacheSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(text, html);

        return html;
    }

    /**
     * Limpiar caché manualmente si es necesario
     */
    static clearCache() {
        this.cache.clear();
    }

    static renderTables(html) {
        const tableRegex = /(\|.+\|\n)+/g;
        return html.replace(tableRegex, (match) => {
            const lines = match.trim().split('\n');
            if (lines.length < 2) return match;
            
            let tableHtml = '<table>';
            
            // Primera fila como headers
            const headers = lines[0].split('|').filter(cell => cell.trim());
            tableHtml += '<thead><tr>';
            headers.forEach(header => {
                tableHtml += `<th>${header.trim()}</th>`;
            });
            tableHtml += '</tr></thead>';
            
            // Resto de filas (saltando la línea separadora |---|)
            tableHtml += '<tbody>';
            for (let i = 1; i < lines.length; i++) {
                if (lines[i].includes('---')) continue;
                
                const cells = lines[i].split('|').filter(cell => cell.trim());
                if (cells.length === 0) continue;
                
                tableHtml += '<tr>';
                cells.forEach(cell => {
                    tableHtml += `<td>${cell.trim()}</td>`;
                });
                tableHtml += '</tr>';
            }
            tableHtml += '</tbody></table>';
            
            return tableHtml;
        });
    }

    static renderLists(html) {
        const lines = html.split('\n');
        const processed = [];
        let inList = false;
        let listType = null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
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
            // No envolver si ya es HTML
            if (block.startsWith('<')) return block;
            // Convertir saltos simples en <br>
            return '<p>' + block.replace(/\n/g, '<br>') + '</p>';
        }).join('\n');
    }
}

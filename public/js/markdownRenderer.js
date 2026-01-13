/**
 * MarkdownRenderer - Renderizado de Markdown a HTML
 */
export class MarkdownRenderer {
    static render(text) {
        let html = text;

        // Líneas horizontales (--- o ***)
        html = html.replace(/^---+$/gm, '<hr>');
        html = html.replace(/^\*\*\*+$/gm, '<hr>');

        // Bloques de código (```code```) - preservar antes de procesar enlaces
        const codeBlocks = [];
        html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
            codeBlocks.push(`<pre><code>${code}</code></pre>`);
            return placeholder;
        });

        // Enlaces markdown [text](url)
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

        // URLs automáticas (detectar http://, https://, www.)
        html = html.replace(/(^|\s)(https?:\/\/[^\s<]+)/g, '$1<a href="$2" target="_blank" rel="noopener noreferrer">$2</a>');
        html = html.replace(/(^|\s)(www\.[^\s<]+)/g, '$1<a href="http://$2" target="_blank" rel="noopener noreferrer">$2</a>');
        
        // Headers (debe ir antes que negritas)
        html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
        html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
        html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

        // Tablas
        html = this.renderTables(html);

        // Negritas (**text** o __text__)
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

        // Cursiva (*text* o _text_) - debe ir después de negritas
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
        html = html.replace(/_(.+?)_/g, '<em>$1</em>');

        // Código inline (`code`)
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Listas
        html = this.renderLists(html);

        // Párrafos
        html = this.renderParagraphs(html);

        // Restaurar bloques de código
        codeBlocks.forEach((code, index) => {
            html = html.replace(`__CODE_BLOCK_${index}__`, code);
        });

        return html;
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
            const bulletMatch = line.match(/^[\-\*\+] (.+)$/);
            const numberMatch = line.match(/^\d+\. (.+)$/);

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

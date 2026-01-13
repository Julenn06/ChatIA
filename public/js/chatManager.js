/**
 * ChatManager - Gestión principal del chat (Optimizado)
 */
import { MarkdownRenderer } from './markdownRenderer.js';
import { PerformanceUtils } from './performanceUtils.js';

export class ChatManager {
    constructor(fileHandler) {
        this.fileHandler = fileHandler;
        this.conversationHistory = [];
        this.isWaitingForResponse = false;
        this.autoScroll = true;
        this.abortController = null;
        this.lastUserMessage = '';
        
        this.messagesContainer = document.getElementById('messagesContainer');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.sendButtonText = document.getElementById('sendButtonText');
        this.sendButtonIcon = document.getElementById('sendButtonIcon');
        this.typingIndicator = document.getElementById('typingIndicator');
        
        // Optimizaciones de rendimiento
        this.renderThrottle = 100; // ms entre renderizados
        this.lastRenderTime = 0;
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        // Auto-resize textarea (optimizado con throttle)
        const resizeTextarea = PerformanceUtils.throttle(() => {
            this.messageInput.style.height = 'auto';
            this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 150) + 'px';
        }, 50);
        
        this.messageInput.addEventListener('input', resizeTextarea);
        
        // Enviar con Enter (Shift+Enter para nueva línea)
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSendOrStop();
            }
        });
        
        // Click en botón
        this.sendButton.addEventListener('click', () => this.handleSendOrStop());
        
        // Detectar scroll manual del usuario (optimizado con debounce)
        const handleScroll = PerformanceUtils.debounce(() => {
            const isNearBottom = this.messagesContainer.scrollHeight - 
                                 this.messagesContainer.scrollTop - 
                                 this.messagesContainer.clientHeight < 100;
            this.autoScroll = isNearBottom;
        }, 100);
        
        this.messagesContainer.addEventListener('scroll', handleScroll, { passive: true });
    }
    
    async handleSendOrStop() {
        if (this.isWaitingForResponse) {
            this.stopGeneration();
        } else {
            await this.sendMessage();
        }
    }
    
    stopGeneration() {
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }
        this.isWaitingForResponse = false;
        this.updateSendButton(false);
        this.removeTypingIndicator();
    }
    
    updateSendButton(isGenerating) {
        if (isGenerating) {
            this.sendButton.classList.add('stop');
            this.sendButtonText.textContent = 'Detener';
            this.sendButtonIcon.textContent = '⬛';
        } else {
            this.sendButton.classList.remove('stop');
            this.sendButtonText.textContent = '';
            this.sendButtonIcon.textContent = '➤';
        }
    }
    
    async sendMessage() {
        if (this.isWaitingForResponse) return;
        
        const message = this.messageInput.value.trim();
        const fileData = this.fileHandler.getFileData();
        
        // Si hay archivo pero no mensaje, usar un mensaje por defecto
        let finalMessage = message;
        if (fileData.content && !message) {
            if (fileData.type && fileData.type.startsWith('image/')) {
                finalMessage = "¿Qué ves en esta imagen?";
            } else {
                finalMessage = "Analiza este archivo:";
            }
        }
        
        if (!finalMessage && !fileData.content) return;
        
        // Guardar último mensaje del usuario para regeneración
        this.lastUserMessage = finalMessage;
        
        // Determinar qué mostrar en el mensaje del usuario
        let displayMessage = message || '';
        let displayImage = null;
        
        // Para archivos adjuntos
        if (this.fileHandler.hasFile()) {
            if (fileData.type && fileData.type.startsWith('image/')) {
                displayMessage = displayMessage || "Imagen adjunta";
                displayImage = fileData.dataUrl;
            } else {
                displayMessage = displayMessage ? 
                    `${displayMessage}\n\n📎 ${fileData.file.name}` : 
                    `📎 ${fileData.file.name}`;
            }
        }
        
        // Agregar mensaje del usuario
        this.addMessage('user', displayMessage, displayImage);
        
        // Preparar contenido para enviar a la IA
        let contentToSend = finalMessage;
        if (fileData.content) {
            contentToSend = `${finalMessage}\n\n${fileData.content}`;
        }
        
        this.conversationHistory.push({ role: 'user', content: contentToSend });
        
        // Limpiar input y archivo
        this.messageInput.value = '';
        this.messageInput.style.height = 'auto';
        this.fileHandler.removeFile();
        
        this.isWaitingForResponse = true;
        this.updateSendButton(true);
        this.typingIndicator.classList.add('active');
        
        // Crear AbortController para poder cancelar la petición
        this.abortController = new AbortController();
        
        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: this.conversationHistory
                }),
                signal: this.abortController.signal
            });
            
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            
            this.typingIndicator.classList.remove('active');
            
            await this.streamResponse(response);
            
        } catch (error) {
            this.typingIndicator.classList.remove('active');
            
            if (error.name === 'AbortError') {
                console.log('Generación detenida por el usuario');
            } else {
                console.error('Error:', error);
                this.addMessage('assistant', 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.');
            }
        } finally {
            this.isWaitingForResponse = false;
            this.updateSendButton(false);
            this.abortController = null;
            this.messageInput.focus();
        }
    }
    
    async streamResponse(response) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = '';
        let pendingUpdate = false;
        
        // Crear el mensaje del asistente
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message assistant';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = 'AI';
        
        const wrapper = document.createElement('div');
        wrapper.className = 'message-content-wrapper';
        
        const header = document.createElement('div');
        header.className = 'message-header';
        
        const sender = document.createElement('span');
        sender.className = 'message-sender';
        sender.textContent = 'AI Assistant';
        
        const time = document.createElement('span');
        time.className = 'message-time';
        time.textContent = this.getCurrentTime();
        
        header.appendChild(sender);
        header.appendChild(time);
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        wrapper.appendChild(header);
        wrapper.appendChild(contentDiv);
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(wrapper);
        this.messagesContainer.appendChild(messageDiv);
        
        // Función optimizada para actualizar el contenido
        const updateContent = () => {
            if (!pendingUpdate) {
                pendingUpdate = true;
                requestAnimationFrame(() => {
                    contentDiv.innerHTML = MarkdownRenderer.render(assistantMessage);
                    this.scrollToBottom();
                    pendingUpdate = false;
                });
            }
        };
        
        // Throttle para limitar frecuencia de renderizado
        const throttledUpdate = PerformanceUtils.throttle(updateContent, this.renderThrottle);
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') continue;
                    
                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.content) {
                            assistantMessage += parsed.content;
                            // Usar throttle para limitar renderizados
                            throttledUpdate();
                        }
                    } catch (e) {
                        // Ignorar errores de parsing
                    }
                }
            }
        }
        
        // Renderizado final (asegurar que se muestre todo)
        updateContent();
        
        // Agregar botones de acción al final
        const actions = this.createMessageActions(assistantMessage);
        wrapper.appendChild(actions);
        
        this.conversationHistory.push({ role: 'assistant', content: assistantMessage });
    }
    
    createMessageActions(messageContent) {
        const actions = document.createElement('div');
        actions.className = 'message-actions';
        
        const regenerateBtn = document.createElement('button');
        regenerateBtn.className = 'message-btn';
        regenerateBtn.textContent = '🔄 Otra respuesta';
        regenerateBtn.onclick = () => this.regenerateLastResponse();
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'message-btn';
        copyBtn.textContent = '📋 Copiar';
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(messageContent);
            copyBtn.textContent = '✓ Copiado';
            setTimeout(() => copyBtn.textContent = '📋 Copiar', 2000);
        };
        
        actions.appendChild(regenerateBtn);
        actions.appendChild(copyBtn);
        
        return actions;
    }
    
    async regenerateLastResponse() {
        if (!this.lastUserMessage || this.isWaitingForResponse) return;
        
        // Remover último mensaje del asistente
        const messages = this.messagesContainer.querySelectorAll('.message.assistant');
        if (messages.length > 0) {
            const lastAssistantMsg = messages[messages.length - 1];
            lastAssistantMsg.remove();
            
            // Remover del historial
            this.conversationHistory.pop();
        }
        
        // Reenviar último mensaje del usuario
        this.messageInput.value = this.lastUserMessage;
        await this.sendMessage();
    }
    
    addMessage(role, content, imageUrl = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = role === 'user' ? 'TÚ' : 'AI';
        
        const wrapper = document.createElement('div');
        wrapper.className = 'message-content-wrapper';
        
        const header = document.createElement('div');
        header.className = 'message-header';
        
        const sender = document.createElement('span');
        sender.className = 'message-sender';
        sender.textContent = role === 'user' ? 'Tú' : 'AI Assistant';
        
        const time = document.createElement('span');
        time.className = 'message-time';
        time.textContent = this.getCurrentTime();
        
        header.appendChild(sender);
        header.appendChild(time);
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        // Renderizar markdown para mensajes de la IA
        if (role === 'assistant') {
            contentDiv.innerHTML = MarkdownRenderer.render(content);
        } else {
            contentDiv.textContent = content;
        }
        
        // Agregar imagen si existe
        if (imageUrl) {
            const img = document.createElement('img');
            img.src = imageUrl;
            img.className = 'message-image';
            contentDiv.appendChild(img);
        }
        
        wrapper.appendChild(header);
        wrapper.appendChild(contentDiv);
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(wrapper);
        this.messagesContainer.appendChild(messageDiv);
        
        this.scrollToBottom();
    }
    
    clearChat() {
        this.conversationHistory = [];
        this.lastUserMessage = '';
        this.messagesContainer.innerHTML = `
            <div class="message assistant">
                <div class="message-avatar">AI</div>
                <div class="message-content-wrapper">
                    <div class="message-header">
                        <span class="message-sender">AI Assistant</span>
                        <span class="message-time">${this.getCurrentTime()}</span>
                    </div>
                    <div class="message-content">
                        ¡Bienvenido! Soy tu asistente de IA profesional. Utilizo múltiples servicios de última generación (Groq, Cerebras & Gemini) para ofrecerte las mejores respuestas. ¿En qué puedo ayudarte hoy?
                    </div>
                </div>
            </div>
        `;
    }
    
    scrollToBottom() {
        if (this.autoScroll) {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }
    }
    
    removeTypingIndicator() {
        this.typingIndicator.classList.remove('active');
    }
    
    getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    }
}

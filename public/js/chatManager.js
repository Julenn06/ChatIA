import { MarkdownRenderer } from './markdownRenderer.js';
import { PerformanceUtils } from './performanceUtils.js';

export class ChatManager {
    constructor(fileHandler) {
        this.fileHandler = fileHandler;
        this.conversationHistory = [];
        this.isWaitingForResponse = false;
        this.autoScroll = true;
        this.abortController = null;
        
        this.messagesContainer = document.getElementById('messagesContainer');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.sendButtonText = document.getElementById('sendButtonText');
        this.sendButtonIcon = document.getElementById('sendButtonIcon');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.renderThrottle = 100;
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        const resizeTextarea = PerformanceUtils.throttle(() => {
            this.messageInput.style.height = 'auto';
            this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 150) + 'px';
        }, 50);
        
        this.messageInput.addEventListener('input', resizeTextarea);
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSendOrStop();
            }
        });
        this.sendButton.addEventListener('click', () => this.handleSendOrStop());
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
        let finalMessage = message;
        if (fileData.content && !message) {
            if (fileData.type && fileData.type.startsWith('image/')) {
                finalMessage = "¿Qué ves en esta imagen?";
            } else {
                finalMessage = "Analiza este archivo:";
            }
        }
        
        if (!finalMessage && !fileData.content) return;
        let displayMessage = message || '';
        let displayImage = null;
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
        this.addMessage('user', displayMessage, displayImage);
        let contentToSend = finalMessage;
        if (fileData.content) {
            contentToSend = `${finalMessage}\n\n${fileData.content}`;
        }
        
        this.conversationHistory.push({ role: 'user', content: contentToSend });
        this.messageInput.value = '';
        this.messageInput.style.height = 'auto';
        this.fileHandler.removeFile();
        this.isWaitingForResponse = true;
        this.updateSendButton(true);
        this.typingIndicator.classList.add('active');
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
            
            this.removeTypingIndicator();
            
            await this.streamResponse(response);
            
        } catch (error) {
            this.removeTypingIndicator();
            
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
    
    createMessageElement(role, senderText) {
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
        sender.textContent = senderText;
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
        return { messageDiv, contentDiv };
    }
    
    async streamResponse(response) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = '';
        let pendingUpdate = false;
        const { messageDiv, contentDiv } = this.createMessageElement('assistant', 'AI Assistant');
        this.messagesContainer.appendChild(messageDiv);
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
                            throttledUpdate();
                        }
                    } catch (e) {
                    }
                }
            }
        }
        updateContent();
        this.conversationHistory.push({ role: 'assistant', content: assistantMessage });
    }
    
    addMessage(role, content, imageUrl = null) {
        const senderText = role === 'user' ? 'Tú' : 'AI Assistant';
        const { messageDiv, contentDiv } = this.createMessageElement(role, senderText);
        
        if (role === 'assistant') {
            contentDiv.innerHTML = MarkdownRenderer.render(content);
        } else {
            contentDiv.textContent = content;
        }
        
        if (imageUrl) {
            const img = document.createElement('img');
            img.src = imageUrl;
            img.className = 'message-image';
            contentDiv.appendChild(img);
        }
        
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    clearChat() {
        this.conversationHistory = [];
        const { messageDiv } = this.createMessageElement('assistant', 'AI Assistant');
        messageDiv.querySelector('.message-content').innerHTML = '¡Bienvenido! Soy tu asistente de IA profesional. Utilizo múltiples servicios de última generación (Groq y Cerebras) para ofrecerte las mejores respuestas. ¿En qué puedo ayudarte hoy?';
        this.messagesContainer.innerHTML = '';
        this.messagesContainer.appendChild(messageDiv);
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

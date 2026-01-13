/**
 * Main Application Entry Point
 */
import { FileHandler } from './fileHandler.js';
import { ChatManager } from './chatManager.js';

// Instancias globales
let fileHandler;
let chatManager;

// Inicializar aplicación
function initializeApp() {
    fileHandler = new FileHandler();
    chatManager = new ChatManager(fileHandler);
    
    // Vincular eventos globales
    setupGlobalEvents();
    
    // Focus en input al cargar
    document.getElementById('messageInput').focus();
}

function setupGlobalEvents() {
    // Botón de adjuntar archivo
    document.querySelector('.btn-attach').addEventListener('click', () => {
        document.getElementById('fileInput').click();
    });
    
    // Input de archivo
    document.getElementById('fileInput').addEventListener('change', (e) => {
        fileHandler.handleFileSelect(e);
    });
    
    // Botón de remover archivo
    window.removeFile = () => fileHandler.removeFile();
    
    // Botón de limpiar chat
    window.clearChat = () => chatManager.clearChat();
}

// Iniciar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

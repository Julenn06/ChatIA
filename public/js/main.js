import { FileHandler } from './fileHandler.js';
import { ChatManager } from './chatManager.js';

let fileHandler;
let chatManager;
let btnAttach;
let fileInput;

function initializeApp() {
    btnAttach = document.querySelector('.btn-attach');
    fileInput = document.getElementById('fileInput');
    
    fileHandler = new FileHandler();
    chatManager = new ChatManager(fileHandler);
    setupGlobalEvents();
    document.getElementById('messageInput').focus();
}

function setupGlobalEvents() {
    btnAttach.addEventListener('click', () => {
        fileInput.click();
    });
    fileInput.addEventListener('change', (e) => {
        fileHandler.handleFileSelect(e);
    });
    window.removeFile = () => fileHandler.removeFile();
    window.clearChat = () => chatManager.clearChat();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

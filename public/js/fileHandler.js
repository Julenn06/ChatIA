/**
 * FileHandler - Manejo de archivos adjuntos
 */
export class FileHandler {
    constructor() {
        this.attachedFile = null;
        this.fileContent = null;
        this.fileDataUrl = null;
        this.fileType = null;
        
        this.fileAttachment = document.getElementById('fileAttachment');
        this.fileName = document.getElementById('fileName');
        this.fileSize = document.getElementById('fileSize');
        this.filePreview = document.getElementById('filePreview');
        this.fileInput = document.getElementById('fileInput');
        this.dropZone = document.getElementById('dropZone');
        this.messagesContainer = document.getElementById('messagesContainer');
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        // Drag and Drop
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.messagesContainer.addEventListener(eventName, this.preventDefaults, false);
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            this.messagesContainer.addEventListener(eventName, () => {
                this.dropZone.classList.add('active');
            });
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            this.messagesContainer.addEventListener(eventName, () => {
                this.dropZone.classList.remove('active');
            });
        });
        
        this.messagesContainer.addEventListener('drop', async (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            
            if (files.length > 0) {
                await this.handleFileSelect({ target: { files: [files[0]] } });
            }
        });
    }
    
    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    async handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        this.attachedFile = file;
        this.fileType = file.type;
        
        // Mostrar información del archivo
        this.fileName.textContent = file.name;
        this.fileSize.textContent = this.formatFileSize(file.size);
        this.fileAttachment.classList.add('active');
        
        // Preview de imagen
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.fileDataUrl = e.target.result;
                this.filePreview.innerHTML = `<img src="${e.target.result}" alt="preview">`;
            };
            reader.readAsDataURL(file);
        } else if (file.type.startsWith('text/') || file.name.match(/\.(txt|md|js|ts|json|csv|py|html|css)$/)) {
            this.filePreview.innerHTML = '<span class="file-icon">📄</span>';
        } else if (file.type === 'application/pdf') {
            this.filePreview.innerHTML = '<span class="file-icon">📕</span>';
        } else {
            this.filePreview.innerHTML = '<span class="file-icon">📎</span>';
        }
        
        // Procesar el archivo
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.fileContent = result.content;
                if (result.base64) {
                    this.fileDataUrl = result.base64;
                }
            } else {
                alert('Error procesando archivo: ' + result.error);
                this.removeFile();
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error subiendo archivo');
            this.removeFile();
        }
    }
    
    removeFile() {
        this.attachedFile = null;
        this.fileContent = null;
        this.fileDataUrl = null;
        this.fileType = null;
        this.fileAttachment.classList.remove('active');
        this.filePreview.innerHTML = '<span class="file-icon">📎</span>';
        this.fileInput.value = '';
    }
    
    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
    
    getFileData() {
        return {
            file: this.attachedFile,
            content: this.fileContent,
            dataUrl: this.fileDataUrl,
            type: this.fileType
        };
    }
    
    hasFile() {
        return this.attachedFile !== null;
    }
}

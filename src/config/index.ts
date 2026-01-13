export const config = {
  // Server
  port: process.env.PORT ?? 3000,
  
  // File Upload
  maxFileSize: 5 * 1024 * 1024, // 5MB
  maxContentLength: 8000, // 8k caracteres
  
  // AI Services
  services: {
    groq: {
      enabled: !!process.env.GROQ_API_KEY,
      model: "moonshotai/kimi-k2-instruct-0905",
      temperature: 0.6,
      maxTokens: 4096,
    },
    cerebras: {
      enabled: !!process.env.CEREBRAS_API_KEY,
      model: 'zai-glm-4.6',
      temperature: 0.6,
      maxTokens: 40960,
    },
    gemini: {
      enabled: !!process.env.GEMINI_API_KEY,
      model: 'gemini-1.5-pro',
      temperature: 0.7,
      maxTokens: 8192,
    }
  },
  
  // Allowed file types
  allowedFileTypes: {
    images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    documents: ['application/pdf'],
    text: ['text/plain', 'text/markdown', 'text/csv', 'text/html', 'text/css'],
    code: ['.js', '.ts', '.json', '.py', '.md', '.txt', '.html', '.css', '.csv']
  }
};

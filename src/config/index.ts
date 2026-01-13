import { LIMITS } from '../constants';

export const config = {
  // Server
  port: process.env.PORT ?? LIMITS.DEFAULT_PORT,
  
  // AI Services - Track which services are enabled
  services: {
    groq: {
      enabled: !!process.env.GROQ_API_KEY
    },
    cerebras: {
      enabled: !!process.env.CEREBRAS_API_KEY
    }
  }
};

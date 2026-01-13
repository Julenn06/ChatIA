/**
 * System limits and constraints
 */

export const LIMITS = {
  /** Maximum file size in bytes (5MB) */
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  
  /** Maximum content length for text extraction (8k characters) */
  MAX_CONTENT_LENGTH: 8000,
  
  /** Maximum number of failover attempts */
  MAX_FAILOVER_ATTEMPTS: 3,
  
  /** Default server port */
  DEFAULT_PORT: 3000
} as const;

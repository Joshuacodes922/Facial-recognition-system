/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Request type for /api/verify-face
 */
export interface VerifyFaceRequest {
  image: string; // base64 encoded image
}

/**
 * Response type for /api/verify-face
 */
export interface VerifyFaceResponse {
  valid: boolean;
  confidence: number;
  message: string;
}

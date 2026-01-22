/**
 * Gemini API Client for Image Generation
 * Uses Google's Imagen 3 model to generate squad logos/avatars
 */

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const IMAGEN_MODEL = 'imagen-3.0-generate-002';

interface ImagenRequest {
  instances: Array<{
    prompt: string;
  }>;
  parameters: {
    sampleCount: number;
    aspectRatio?: string;
    personGeneration?: 'dont_allow' | 'allow_adult';
    safetyFilterLevel?: 'block_low_and_above' | 'block_medium_and_above' | 'block_only_high';
  };
}

interface ImagenResponse {
  predictions: Array<{
    bytesBase64Encoded: string;
    mimeType: string;
  }>;
}

export class GeminiClient {
  private static instance: GeminiClient;
  private apiKey: string;

  private constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    this.apiKey = apiKey;
  }

  static getInstance(): GeminiClient {
    if (!GeminiClient.instance) {
      GeminiClient.instance = new GeminiClient();
    }
    return GeminiClient.instance;
  }

  /**
   * Check if Gemini API key is configured
   */
  static isConfigured(): boolean {
    return !!process.env.GEMINI_API_KEY;
  }

  /**
   * Generate a squad logo/avatar image
   * @param squadName - Name of the squad
   * @param description - Optional description of the squad's purpose
   * @returns Base64 data URL for the image
   */
  async generateSquadImage(
    squadName: string,
    description?: string
  ): Promise<string> {
    const prompt = this.buildPrompt(squadName, description);

    const requestBody: ImagenRequest = {
      instances: [{ prompt }],
      parameters: {
        sampleCount: 1,
        aspectRatio: '1:1',
        personGeneration: 'dont_allow',
        safetyFilterLevel: 'block_medium_and_above',
      },
    };

    const response = await fetch(
      `${GEMINI_API_BASE}/models/${IMAGEN_MODEL}:predict?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errorText}`);
    }

    const data: ImagenResponse = await response.json();

    if (!data.predictions || data.predictions.length === 0) {
      throw new Error('No image generated from Gemini API');
    }

    const prediction = data.predictions[0];
    const mimeType = prediction.mimeType || 'image/png';
    const base64Data = prediction.bytesBase64Encoded;

    return `data:${mimeType};base64,${base64Data}`;
  }

  /**
   * Build the prompt for squad image generation
   */
  private buildPrompt(squadName: string, description?: string): string {
    const descriptionPart = description
      ? `The team's mission: ${description}.`
      : '';

    return `Create a stylized crypto/web3 squad logo for a team called "${squadName}". ${descriptionPart} Style: Modern, cyberpunk aesthetic with neon accents, professional and clean design. Make it suitable as a profile avatar/icon. No text, letters, or words in the image. Abstract geometric shapes, mascot character, or symbolic imagery preferred.`;
  }
}

// Export factory function for easy testing
export function createGeminiClient(): GeminiClient {
  return GeminiClient.getInstance();
}

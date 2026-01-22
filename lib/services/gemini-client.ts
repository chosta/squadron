/**
 * Gemini API Client for Image Generation
 * Uses Gemini's native image generation capabilities
 * and Gemini Flash for vision analysis
 */

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_IMAGE_MODEL = 'gemini-2.5-flash-image';
const GEMINI_FLASH_MODEL = 'gemini-2.0-flash';

interface GeminiImageGenerationRequest {
  contents: Array<{
    parts: Array<{
      text: string;
    }>;
  }>;
  generationConfig: {
    responseModalities: string[];
    responseMimeType?: string;
  };
}

interface GeminiImageGenerationResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text?: string;
        inlineData?: {
          mimeType: string;
          data: string;
        };
      }>;
    };
  }>;
}

export interface MemberAvatarInfo {
  avatarUrl: string;
  role: string;
  isCaptain: boolean;
}

export interface GenerateSquadAvatarOptions {
  squadName: string;
  description?: string;
  memberDescriptions: string[];
  captainDescription: string;
  memberRoles: string[];
  captainRole: string;
}

interface GeminiGenerateContentResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
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
    return this.generateImageWithGemini(prompt);
  }

  /**
   * Generate an image using Gemini's native image generation
   */
  private async generateImageWithGemini(prompt: string): Promise<string> {
    const requestBody: GeminiImageGenerationRequest = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    };

    const response = await fetch(
      `${GEMINI_API_BASE}/models/${GEMINI_IMAGE_MODEL}:generateContent?key=${this.apiKey}`,
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

    const data: GeminiImageGenerationResponse = await response.json();

    // Find the image part in the response
    const candidate = data.candidates?.[0];
    if (!candidate?.content?.parts) {
      throw new Error('No content generated from Gemini API');
    }

    const imagePart = candidate.content.parts.find(part => part.inlineData);
    if (!imagePart?.inlineData) {
      throw new Error('No image generated from Gemini API');
    }

    const { mimeType, data: base64Data } = imagePart.inlineData;
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

  /**
   * Analyze member avatar images using Gemini Flash vision model
   * @param members - Array of member avatar info
   * @returns Array of descriptions for each avatar
   */
  async analyzeAvatars(members: MemberAvatarInfo[]): Promise<string[]> {
    const descriptions: string[] = [];

    for (const member of members) {
      if (!member.avatarUrl) {
        descriptions.push('No avatar available');
        continue;
      }

      try {
        const description = await this.analyzeImage(member.avatarUrl);
        descriptions.push(description);
      } catch (error) {
        console.error('Failed to analyze avatar:', error);
        descriptions.push('Avatar analysis unavailable');
      }
    }

    return descriptions;
  }

  /**
   * Analyze a single image using Gemini Flash
   */
  private async analyzeImage(imageUrl: string): Promise<string> {
    const prompt = `Describe this avatar image briefly in 1-2 sentences. Focus on:
- Visual style (cartoon, realistic, pixel art, etc.)
- Dominant colors
- Key visual elements or themes
- Overall vibe/aesthetic

Keep it concise and descriptive.`;

    // Handle base64 data URLs
    let imageData: { inlineData: { mimeType: string; data: string } } | { fileData: { mimeType: string; fileUri: string } };

    if (imageUrl.startsWith('data:')) {
      const matches = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        throw new Error('Invalid base64 data URL');
      }
      imageData = {
        inlineData: {
          mimeType: matches[1],
          data: matches[2],
        },
      };
    } else {
      // Fetch the image and convert to base64
      const response = await fetch(imageUrl);
      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const contentType = response.headers.get('content-type') || 'image/jpeg';

      imageData = {
        inlineData: {
          mimeType: contentType,
          data: base64,
        },
      };
    }

    const requestBody = {
      contents: [
        {
          parts: [
            imageData,
            { text: prompt },
          ],
        },
      ],
    };

    const response = await fetch(
      `${GEMINI_API_BASE}/models/${GEMINI_FLASH_MODEL}:generateContent?key=${this.apiKey}`,
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

    const data: GeminiGenerateContentResponse = await response.json();

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('No response from Gemini vision model');
    }

    return data.candidates[0].content.parts[0].text.trim();
  }

  /**
   * Generate a squad avatar image with team member context
   * Uses Gemini's native image generation for reliable results
   */
  async generateSquadAvatar(options: GenerateSquadAvatarOptions): Promise<string> {
    const prompt = this.buildSquadAvatarPrompt(options);
    return this.generateImageWithGemini(prompt);
  }

  /**
   * Build prompt for squad avatar generation with member context
   */
  private buildSquadAvatarPrompt(options: GenerateSquadAvatarOptions): string {
    const {
      squadName,
      description,
      memberDescriptions,
      captainDescription,
      memberRoles,
      captainRole,
    } = options;

    const theme = this.inferTheme(description);
    const memberCount = memberDescriptions.length + 1; // +1 for captain

    // Build member descriptions
    const memberLines = memberDescriptions
      .map((desc, i) => `- Member ${i + 2}: ${desc} - Role: ${memberRoles[i] || 'Member'}`)
      .join('\n');

    const descriptionPart = description
      ? `Team mission: ${description}`
      : 'A collaborative team working together';

    return `Create a stylized team illustration for "${squadName}" (${memberCount} members).

${descriptionPart}

Team composition (represent each member artistically):
- CAPTAIN (center, prominent): ${captainDescription} - Role: ${captainRole}
${memberLines}

Style guidelines:
- ${theme} aesthetic
- 4:3 landscape format, suitable as a team banner
- The captain should be at the center/forefront, larger or more prominent
- Other members arranged around the captain
- Artistic/stylized interpretation - not photorealistic
- No text or letters in the image
- Cohesive color palette that ties the team together`;
  }

  /**
   * Infer visual theme from squad description keywords
   */
  private inferTheme(description?: string): string {
    if (!description) {
      return 'Modern professional';
    }

    const desc = description.toLowerCase();

    // Crypto/Web3 terms
    if (/crypto|web3|blockchain|defi|nft|token|dao|decentralized/i.test(desc)) {
      return 'Cyberpunk with neon accents and futuristic elements';
    }

    // Gaming terms
    if (/game|gaming|esports|play|stream|twitch/i.test(desc)) {
      return 'Vibrant action-oriented with dynamic energy';
    }

    // Sports terms
    if (/sport|athletic|fitness|team|compete|champion/i.test(desc)) {
      return 'Athletic and dynamic with bold colors';
    }

    // Tech/Development terms
    if (/tech|code|develop|engineer|software|hack/i.test(desc)) {
      return 'Clean tech-inspired with digital elements';
    }

    // Creative/Art terms
    if (/art|creative|design|music|content/i.test(desc)) {
      return 'Artistic and expressive with creative flair';
    }

    return 'Modern professional';
  }
}

// Export factory function for easy testing
export function createGeminiClient(): GeminiClient {
  return GeminiClient.getInstance();
}

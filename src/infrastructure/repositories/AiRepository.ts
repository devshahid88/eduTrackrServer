import { GoogleGenAI } from "@google/genai";

export class AiRepository {
    private genAI: GoogleGenAI;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not configured in environment variables');
        }

        // Initialize the Gemini API with your API key
        this.genAI = new GoogleGenAI({ apiKey });
    }

    async generateResponse(prompt: string): Promise<string> {
        try {
            const response = await this.genAI.models.generateContent({
                model: "gemini-2.0-flash",
                contents: prompt,
            });

            if (!response.text) {
                throw new Error('No response text received from Gemini API');
            }

            return response.text;
        } catch (error: any) {
            console.error('Error generating AI response:', error);
            
            // Handle specific error cases
            if (error.status === 403) {
                throw new Error('Invalid or missing Gemini API key. Please check your .env configuration.');
            }
            
            if (error.status === 404) {
                throw new Error('Gemini model not found. Please check the model name and API version.');
            }
            
            if (error.status === 429) {
                throw new Error('Rate limit exceeded for Gemini API. Please try again later.');
            }
            
            throw new Error(`Failed to generate AI response: ${error.message || 'Unknown error'}`);
        }
    }
} 
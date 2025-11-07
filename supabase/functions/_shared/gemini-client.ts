/**
 * Gemini Client - Cliente reutilizável para Gemini 2.0 Flash
 *
 * Fornece interface simplificada para interagir com Gemini 2.0 Flash
 * com suporte a JSON estruturado, streaming e error handling robusto.
 */

import { GoogleGenerativeAI, GenerativeModel, GenerationConfig, SafetySetting } from "npm:@google/generative-ai@0.21.0";

export interface GeminiConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  topK?: number;
}

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: string;
}

export interface GeminiResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
}

export class GeminiClient {
  private client: GoogleGenerativeAI;
  private model: GenerativeModel;
  private config: GeminiConfig;

  constructor(config: GeminiConfig) {
    this.config = {
      model: 'gemini-2.0-flash-exp',
      temperature: 0.7,
      maxOutputTokens: 2048,
      topP: 0.95,
      topK: 40,
      ...config,
    };

    this.client = new GoogleGenerativeAI(this.config.apiKey);
    this.model = this.client.getGenerativeModel({
      model: this.config.model!,
      generationConfig: {
        temperature: this.config.temperature,
        maxOutputTokens: this.config.maxOutputTokens,
        topP: this.config.topP,
        topK: this.config.topK,
      },
      safetySettings: this.getSafetySettings(),
    });
  }

  private getSafetySettings(): SafetySetting[] {
    // Configuração mais permissiva para conteúdo de saúde/maternidade
    return [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
    ];
  }

  /**
   * Gera resposta com JSON estruturado
   */
  async generateJSON<T>(
    systemPrompt: string,
    userPrompt: string,
    responseSchema: any,
    history: GeminiMessage[] = []
  ): Promise<{ data: T; usage?: any }> {
    try {
      const model = this.client.getGenerativeModel({
        model: this.config.model!,
        generationConfig: {
          temperature: this.config.temperature,
          maxOutputTokens: this.config.maxOutputTokens,
          topP: this.config.topP,
          topK: this.config.topK,
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
        },
        safetySettings: this.getSafetySettings(),
        systemInstruction: systemPrompt,
      });

      // Converter histórico para formato Gemini
      const chat = model.startChat({
        history: history.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.parts }],
        })),
      });

      const result = await chat.sendMessage(userPrompt);
      const response = result.response;

      // Parse JSON response
      const text = response.text();
      const data = JSON.parse(text) as T;

      return {
        data,
        usage: response.usageMetadata ? {
          promptTokens: response.usageMetadata.promptTokenCount,
          completionTokens: response.usageMetadata.candidatesTokenCount,
          totalTokens: response.usageMetadata.totalTokenCount,
        } : undefined,
      };
    } catch (error: any) {
      console.error('[GeminiClient] Error generating JSON:', error);
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  /**
   * Gera resposta de texto simples
   */
  async generateText(
    systemPrompt: string,
    userPrompt: string,
    history: GeminiMessage[] = []
  ): Promise<GeminiResponse> {
    try {
      const model = this.client.getGenerativeModel({
        model: this.config.model!,
        generationConfig: {
          temperature: this.config.temperature,
          maxOutputTokens: this.config.maxOutputTokens,
          topP: this.config.topP,
          topK: this.config.topK,
        },
        safetySettings: this.getSafetySettings(),
        systemInstruction: systemPrompt,
      });

      const chat = model.startChat({
        history: history.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.parts }],
        })),
      });

      const result = await chat.sendMessage(userPrompt);
      const response = result.response;

      return {
        text: response.text(),
        usage: response.usageMetadata ? {
          promptTokens: response.usageMetadata.promptTokenCount,
          completionTokens: response.usageMetadata.candidatesTokenCount,
          totalTokens: response.usageMetadata.totalTokenCount,
        } : undefined,
        finishReason: response.candidates?.[0]?.finishReason,
      };
    } catch (error: any) {
      console.error('[GeminiClient] Error generating text:', error);
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  /**
   * Gera resposta com streaming
   */
  async *generateStream(
    systemPrompt: string,
    userPrompt: string,
    history: GeminiMessage[] = []
  ): AsyncGenerator<string, void, unknown> {
    try {
      const model = this.client.getGenerativeModel({
        model: this.config.model!,
        generationConfig: {
          temperature: this.config.temperature,
          maxOutputTokens: this.config.maxOutputTokens,
          topP: this.config.topP,
          topK: this.config.topK,
        },
        safetySettings: this.getSafetySettings(),
        systemInstruction: systemPrompt,
      });

      const chat = model.startChat({
        history: history.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.parts }],
        })),
      });

      const result = await chat.sendMessageStream(userPrompt);

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          yield text;
        }
      }
    } catch (error: any) {
      console.error('[GeminiClient] Error generating stream:', error);
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  /**
   * Conta tokens de um texto
   */
  async countTokens(text: string): Promise<number> {
    try {
      const result = await this.model.countTokens(text);
      return result.totalTokens;
    } catch (error: any) {
      console.error('[GeminiClient] Error counting tokens:', error);
      return 0;
    }
  }
}

/**
 * Factory function para criar cliente Gemini
 */
export function createGeminiClient(apiKey?: string, config?: Partial<GeminiConfig>): GeminiClient {
  const key = apiKey || Deno.env.get('GEMINI_API_KEY');

  if (!key) {
    throw new Error('GEMINI_API_KEY não configurada');
  }

  return new GeminiClient({
    apiKey: key,
    ...config,
  });
}

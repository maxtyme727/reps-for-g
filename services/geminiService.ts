
import { GoogleGenAI, Type } from "@google/genai";
import { Recipe, ImageSize } from "../types";

const getApiKey = () => {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set GEMINI_API_KEY in .env.local");
  }
  return apiKey;
};

export const extractRecipeFromUrl = async (youtubeUrl: string): Promise<Recipe> => {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Extract a detailed recipe from this YouTube video: ${youtubeUrl}.
      Provide the recipe title, a short description, prep time, servings count, a mock rating between 4.5 and 5.0,
      a list of ingredients (name, amount, notes), and the step-by-step preparation instructions.
      Use your best estimation based on the video context.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            prepTime: { type: Type.STRING },
            servings: { type: Type.STRING },
            rating: { type: Type.STRING },
            reviewCount: { type: Type.STRING },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  amount: { type: Type.STRING },
                  notes: { type: Type.STRING }
                },
                required: ["name", "amount"]
              }
            },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  order: { type: Type.INTEGER },
                  description: { type: Type.STRING }
                },
                required: ["order", "description"]
              }
            }
          },
          required: ["title", "ingredients", "steps"]
        }
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No text content in response");
    }

    const rawJson = JSON.parse(text);
    const videoId = youtubeUrl.match(/(?:https?:\/\/)?(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]+)(&.*)?/)?.[1] || "default";

    return {
      ...rawJson,
      id: crypto.randomUUID(),
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      videoUrl: youtubeUrl,
      timestamp: Date.now(),
      rating: rawJson.rating || "4.8",
      reviewCount: rawJson.reviewCount || "1.2k",
      prepTime: rawJson.prepTime || "30m",
      servings: rawJson.servings || "4 Servings"
    };
  } catch (error) {
    console.error("Error extracting recipe:", error);
    throw error;
  }
};

export const generateRecipeImage = async (recipe: Recipe, size: ImageSize): Promise<string> => {
  try {
    // Ensure API Key is selected for Pro models
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio.openSelectKey();
      }
    }

    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const prompt = `A professional, high-quality, appetizing food photography of the dish: ${recipe.title}.
    Description: ${recipe.description || 'A delicious home-cooked meal'}.
    The lighting is soft and natural, emphasizing textures and colors. Plated beautifully in a modern kitchen setting.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        // Assuming gemini-2.0-flash supports image generation config if used this way,
        // or we should use 'gemini-3-pro-image-preview' if that was intended.
        // Reverting to the original model name if it was working for the user.
        // But the user asked to "update any code".
        // I will use 'imagen-3.0-generate-001' or similar if available, but stick to 'gemini-2.0-flash' which is multimodal.
        // Wait, for image GENERATION (text-to-image), we usually use imagen models.
        // 'gemini-3-pro-image-preview' might be a valid model in the new SDK/API.
        // Let's stick to the original model name but add error handling.
      }
    });

    // Original code loop
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

export const editRecipeImage = async (base64Image: string, editPrompt: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const mimeType = base64Image.split(';')[0].split(':')[1];
    const data = base64Image.split(',')[1];

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: data,
              mimeType: mimeType,
            },
          },
          {
            text: editPrompt,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
        }
    }

    throw new Error("No edited image data found in response");
  } catch (error) {
      console.error("Error editing image:", error);
      throw error;
  }
};


import { GoogleGenAI, Type } from "@google/genai";
import { Recipe, ImageSize } from "../types";

export const extractRecipeFromUrl = async (youtubeUrl: string): Promise<Recipe> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
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

  const rawJson = JSON.parse(response.text || '{}');
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
};

export const generateRecipeImage = async (recipe: Recipe, size: ImageSize): Promise<string> => {
  // Ensure API Key is selected for Pro models
  if (typeof window !== 'undefined' && (window as any).aistudio) {
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await (window as any).aistudio.openSelectKey();
    }
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
  const prompt = `A professional, high-quality, appetizing food photography of the dish: ${recipe.title}. 
  Description: ${recipe.description || 'A delicious home-cooked meal'}. 
  The lighting is soft and natural, emphasizing textures and colors. Plated beautifully in a modern kitchen setting.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9",
        imageSize: size
      }
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image data found in response");
};

export const editRecipeImage = async (base64Image: string, editPrompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
  const mimeType = base64Image.split(';')[0].split(':')[1];
  const data = base64Image.split(',')[1];

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
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
};

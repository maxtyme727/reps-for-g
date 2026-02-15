
import React, { useState } from 'react';
import { Recipe, ImageSize } from '../types';
import { generateRecipeImage, editRecipeImage } from '../services/geminiService';

interface RecipeDetailScreenProps {
  recipe: Recipe;
  onUpdateRecipe: (recipe: Recipe) => void;
}

const RecipeDetailScreen: React.FC<RecipeDetailScreenProps> = ({ recipe, onUpdateRecipe }) => {
  const [activeTab, setActiveTab] = useState<'ingredients' | 'steps'>('ingredients');
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [imageSize, setImageSize] = useState<ImageSize>('1K');
  const [editPrompt, setEditPrompt] = useState('');

  const toggleIngredient = (index: number) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedIngredients(newChecked);
  };

  const handleGenerateImage = async () => {
    setIsGenerating(true);
    try {
      const imageUrl = await generateRecipeImage(recipe, imageSize);
      onUpdateRecipe({ ...recipe, aiGeneratedImage: imageUrl });
    } catch (err) {
      console.error("Generation failed:", err);
      alert("Image generation failed. Ensure you have selected a paid API key for Pro models.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditImage = async () => {
    if (!recipe.aiGeneratedImage || !editPrompt) return;
    setIsEditing(true);
    try {
      const imageUrl = await editRecipeImage(recipe.aiGeneratedImage, editPrompt);
      onUpdateRecipe({ ...recipe, aiGeneratedImage: imageUrl });
      setEditPrompt('');
    } catch (err) {
      console.error("Editing failed:", err);
      alert("Failed to edit image.");
    } finally {
      setIsEditing(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: recipe.title,
      text: `Check out this recipe for ${recipe.title} I found with Reps For G!`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  return (
    <div className="pb-32 animate-fadeIn">
      {/* Video Thumbnail Section */}
      <div className="p-4">
        <div 
          className="relative flex items-center justify-center bg-zinc-800 bg-cover bg-center aspect-video rounded-xl overflow-hidden shadow-2xl group" 
          style={{ backgroundImage: `url("${recipe.thumbnailUrl}")` }}
        >
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all"></div>
          <a 
            href={recipe.videoUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="relative flex shrink-0 items-center justify-center rounded-full size-16 bg-primary/90 text-white shadow-lg transform group-hover:scale-110 transition-transform"
          >
            <span className="material-symbols-outlined !text-3xl filled-icon">play_arrow</span>
          </a>
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
            WATCH SOURCE
          </div>
        </div>
      </div>

      {/* AI Image Generation Section */}
      <div className="px-4 mb-8">
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-xl">auto_awesome</span>
              AI Food Photography
            </h3>
            <div className="flex bg-background-dark/50 p-1 rounded-lg border border-primary/20">
              {(['1K', '2K', '4K'] as ImageSize[]).map((size) => (
                <button
                  key={size}
                  onClick={() => setImageSize(size)}
                  className={`px-3 py-1 text-[10px] font-bold rounded ${imageSize === size ? 'bg-primary text-white' : 'text-primary/60 hover:text-primary'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {recipe.aiGeneratedImage ? (
            <div className="space-y-4">
              <div className="relative aspect-video rounded-lg overflow-hidden border border-primary/30 group">
                <img src={recipe.aiGeneratedImage} alt="AI Generated dish" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button onClick={handleGenerateImage} disabled={isGenerating} className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white">
                    <span className="material-symbols-outlined">refresh</span>
                  </button>
                </div>
              </div>
              
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Edit image: 'Add more herbs', 'Darker background'..."
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  className="flex-1 bg-background-dark/50 border-primary/20 rounded-lg text-sm placeholder:text-primary/30 focus:ring-primary focus:border-primary"
                />
                <button 
                  onClick={handleEditImage}
                  disabled={isEditing || !editPrompt}
                  className="bg-primary px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50"
                >
                  {isEditing ? '...' : 'Edit'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 space-y-4">
              <p className="text-sm text-primary/70">Visualize how the finished dish will look using Gemini 3 Pro.</p>
              <button 
                onClick={handleGenerateImage}
                disabled={isGenerating}
                className="w-full py-3 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {isGenerating ? (
                  <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined">camera</span>
                )}
                {isGenerating ? 'Cooking up pixels...' : `Generate ${imageSize} Photo`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recipe Title & Metadata */}
      <div className="px-4 pt-2">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-bold leading-tight tracking-tight flex-1">{recipe.title}</h1>
          <button 
            onClick={handleShare}
            className="shrink-0 size-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined">share</span>
          </button>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-zinc-400">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-primary text-sm">schedule</span>
            <span>{recipe.prepTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-primary text-sm">restaurant</span>
            <span>{recipe.servings}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-primary text-sm">star</span>
            <span>{recipe.rating}</span>
          </div>
          <div className="flex items-center gap-1 relative group">
            <span className="material-symbols-outlined text-primary text-sm">calendar_month</span>
            <input
              type="date"
              value={new Date(recipe.timestamp).toISOString().split('T')[0]}
              onChange={(e) => {
                if (e.target.value) {
                  onUpdateRecipe({ ...recipe, timestamp: new Date(e.target.value).getTime() });
                }
              }}
              className="bg-transparent border-none text-zinc-400 text-sm focus:ring-0 p-0 cursor-pointer w-[110px]"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 sticky top-0 bg-background-dark z-10 border-b border-white/10">
        <div className="flex px-4">
          <button 
            onClick={() => setActiveTab('ingredients')}
            className={`flex-1 flex flex-col items-center justify-center border-b-2 py-4 transition-colors ${activeTab === 'ingredients' ? 'border-primary text-white' : 'border-transparent text-zinc-500'}`}
          >
            <span className="text-sm font-bold">Ingredients</span>
          </button>
          <button 
            onClick={() => setActiveTab('steps')}
            className={`flex-1 flex flex-col items-center justify-center border-b-2 py-4 transition-colors ${activeTab === 'steps' ? 'border-primary text-white' : 'border-transparent text-zinc-500'}`}
          >
            <span className="text-sm font-bold">Steps</span>
          </button>
        </div>
      </div>

      {activeTab === 'ingredients' ? (
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">{recipe.ingredients.length} Items Needed</p>
            <button 
              onClick={() => {
                if (checkedIngredients.size === recipe.ingredients.length) {
                  setCheckedIngredients(new Set());
                } else {
                  setCheckedIngredients(new Set(recipe.ingredients.map((_, i) => i)));
                }
              }}
              className="text-primary text-xs font-bold flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">checklist</span>
              {checkedIngredients.size === recipe.ingredients.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          
          {recipe.ingredients.map((ing, idx) => (
            <label 
              key={idx}
              className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/5 hover:border-primary/30 transition-all cursor-pointer group"
            >
              <input 
                type="checkbox"
                checked={checkedIngredients.has(idx)}
                onChange={() => toggleIngredient(idx)}
                className="size-5 rounded border-zinc-600 bg-transparent text-primary focus:ring-primary focus:ring-offset-0 transition-all"
              />
              <div className="flex flex-col">
                <span className={`text-base font-medium transition-all ${checkedIngredients.has(idx) ? 'text-zinc-500 line-through' : 'text-white'}`}>
                  {ing.amount} {ing.name}
                </span>
                {ing.notes && <span className="text-xs text-zinc-500">{ing.notes}</span>}
              </div>
            </label>
          ))}
        </div>
      ) : (
        <div className="p-4 space-y-6 mt-4">
          <h3 className="text-lg font-bold mb-4">Preparation Steps</h3>
          {[...recipe.steps].sort((a,b) => a.order - b.order).map((step, idx, arr) => (
            <div key={idx} className="flex gap-4 group">
              <div className="flex flex-col items-center">
                <div className="size-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold shrink-0">
                  {step.order}
                </div>
                {idx < arr.length - 1 && <div className="w-0.5 h-full bg-white/10 mt-2"></div>}
              </div>
              <div className="pb-6">
                <p className="text-white leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Social Media Share Floating Bar */}
      <div className="px-4 mt-10">
        <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 text-center">Share this recipe</h4>
        <div className="flex justify-center gap-4">
          <button onClick={handleShare} className="size-12 bg-[#1DA1F2]/10 rounded-full flex items-center justify-center text-[#1DA1F2]">
            <span className="material-symbols-outlined">send</span>
          </button>
          <button onClick={handleShare} className="size-12 bg-[#E1306C]/10 rounded-full flex items-center justify-center text-[#E1306C]">
            <span className="material-symbols-outlined">photo_camera</span>
          </button>
          <button onClick={handleShare} className="size-12 bg-[#25D366]/10 rounded-full flex items-center justify-center text-[#25D366]">
            <span className="material-symbols-outlined">chat</span>
          </button>
        </div>
      </div>

      {/* Sticky Footer CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background-dark/80 backdrop-blur-xl border-t border-white/10 z-30">
        <div className="max-w-xl mx-auto flex gap-3">
          <button className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-95">
            <span className="material-symbols-outlined">menu_book</span>
            Save to My Cookbook
          </button>
          <button className="size-14 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center text-white transition-all">
            <span className="material-symbols-outlined">shopping_cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailScreen;

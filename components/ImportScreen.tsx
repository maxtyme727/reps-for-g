
import React, { useState } from 'react';
import { Recipe } from '../types';

interface ImportScreenProps {
  onExtract: (url: string) => void;
  isLoading: boolean;
  recentRecipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
}

const ImportScreen: React.FC<ImportScreenProps> = ({ 
  onExtract, 
  isLoading, 
  recentRecipes, 
  onSelectRecipe 
}) => {
  const [url, setUrl] = useState('');

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch (err) {
      console.error('Failed to read clipboard');
    }
  };

  const getTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} mins ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Yesterday';
  };

  return (
    <div className="px-4 py-6 animate-fadeIn">
      <section className="mb-8">
        <h2 className="text-2xl font-bold leading-tight mb-2">Add from YouTube</h2>
        <p className="text-primary/60 text-sm">Convert any cooking video into a step-by-step recipe in seconds.</p>
      </section>

      <section className="space-y-4 mb-10">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-300">YouTube URL</label>
          <div className="relative flex items-stretch">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-primary">
              <span className="material-symbols-outlined text-xl">link</span>
            </div>
            <input 
              className="block w-full pl-10 pr-24 py-4 bg-primary/5 border border-primary/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-base placeholder:text-primary/30" 
              placeholder="https://www.youtube.com/watch?v=..." 
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
            />
            <div className="absolute inset-y-2 right-2 flex items-center">
              <button 
                onClick={handlePaste}
                disabled={isLoading}
                className="px-4 h-full bg-primary/20 text-primary font-bold text-xs uppercase tracking-wider rounded-md hover:bg-primary/30 transition-all disabled:opacity-50"
              >
                Paste
              </button>
            </div>
          </div>
        </div>
        <button 
          onClick={() => onExtract(url)}
          disabled={isLoading || !url}
          className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">magic_button</span>
          )}
          {isLoading ? 'Extracting Recipe...' : 'Extract Recipe'}
        </button>
      </section>

      {recentRecipes.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Recent Extractions</h3>
            <button className="text-primary text-sm font-medium hover:underline">View all</button>
          </div>
          <div className="space-y-3">
            {recentRecipes.map((recipe) => (
              <div 
                key={recipe.id}
                onClick={() => onSelectRecipe(recipe)}
                className="flex items-center gap-4 p-3 bg-primary/5 border border-primary/10 rounded-xl hover:border-primary/30 transition-colors cursor-pointer group"
              >
                <div className="relative w-24 h-16 shrink-0 rounded-lg overflow-hidden">
                  <img 
                    className="w-full h-full object-cover" 
                    src={recipe.thumbnailUrl}
                    alt={recipe.title}
                    onError={(e) => {
                       (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${recipe.id}/300/200`;
                    }}
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-white filled-icon">play_circle</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm truncate">{recipe.title}</h4>
                  <p className="text-xs text-primary/50 mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">schedule</span> {getTimeAgo(recipe.timestamp)}
                  </p>
                </div>
                <span className="material-symbols-outlined text-slate-400">chevron_right</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ImportScreen;

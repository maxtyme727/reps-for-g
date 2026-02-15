
import React from 'react';
import { AppScreen } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeScreen: AppScreen;
  onScreenChange: (screen: AppScreen) => void;
  headerTitle: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeScreen, 
  onScreenChange, 
  headerTitle,
  showBackButton,
  onBack 
}) => {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background-dark text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-background-dark border-b border-primary/10 shrink-0">
        <div className="flex items-center gap-2">
          {showBackButton ? (
            <button 
              onClick={onBack}
              className="flex items-center justify-center size-10 rounded-full hover:bg-primary/10 transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
          ) : (
            <div className="size-10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined filled-icon">restaurant_menu</span>
            </div>
          )}
          <h1 className="text-lg font-bold tracking-tight">{headerTitle}</h1>
        </div>
        <button className="flex items-center justify-center size-10 rounded-full hover:bg-primary/10 transition-colors">
          <span className="material-symbols-outlined">help_outline</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-2xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="border-t border-primary/20 bg-background-dark/80 backdrop-blur-md px-4 pb-6 pt-3 shrink-0">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <button 
            onClick={() => onScreenChange('home')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeScreen === 'home' ? 'text-primary' : 'text-primary/40'}`}
          >
            <span className={`material-symbols-outlined ${activeScreen === 'home' ? 'filled-icon' : ''}`}>home</span>
            <span className="text-[10px] font-medium">Home</span>
          </button>
          <button 
            onClick={() => onScreenChange('import')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeScreen === 'import' ? 'text-primary' : 'text-primary/40'}`}
          >
            <span className={`material-symbols-outlined ${activeScreen === 'import' ? 'filled-icon' : ''}`}>add_circle</span>
            <span className="text-[10px] font-medium">Import</span>
          </button>
          <button 
            onClick={() => onScreenChange('recipe-detail')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeScreen === 'recipe-detail' ? 'text-primary' : 'text-primary/40'}`}
          >
            <span className={`material-symbols-outlined ${activeScreen === 'recipe-detail' ? 'filled-icon' : ''}`}>menu_book</span>
            <span className="text-[10px] font-medium">Recipes</span>
          </button>
          <button 
            onClick={() => onScreenChange('settings')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeScreen === 'settings' ? 'text-primary' : 'text-primary/40'}`}
          >
            <span className={`material-symbols-outlined ${activeScreen === 'settings' ? 'filled-icon' : ''}`}>settings</span>
            <span className="text-[10px] font-medium">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Layout;

import React, { useState, useEffect } from 'react';
import { AccessibilityProvider, useA11y } from './contexts/AccessibilityContext';
import { ViewMode, HistoryItem, SupportedLanguage } from './types';
import { TextToSpeech } from './components/TextToSpeech';
import { SpeechToText } from './components/SpeechToText';
import { Button } from './components/Button';
import { Settings, Type, Mic, History, Sun, Moon, Volume2, Minus, Plus } from 'lucide-react';

const MainContent: React.FC = () => {
  const { 
    fontSize, setFontSize, 
    highContrast, toggleHighContrast, 
    speechSpeed, setSpeechSpeed,
    getFontSizeClass 
  } = useA11y();
  
  const [mode, setMode] = useState<ViewMode>('TTS');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  // Load history from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('setuHistory');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) { console.error("Failed to load history"); }
    }
  }, []);

  const addToHistory = (text: string, language: SupportedLanguage) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      text,
      language,
      type: mode === 'TTS' ? 'TTS' : 'STT',
      timestamp: Date.now()
    };
    const newHistory = [newItem, ...history].slice(0, 50); // Keep last 50
    setHistory(newHistory);
    localStorage.setItem('setuHistory', JSON.stringify(newHistory));
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${highContrast ? 'bg-black text-yellow-300' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Header */}
      <header className={`sticky top-0 z-50 shadow-md ${highContrast ? 'bg-zinc-900 border-b border-yellow-300' : 'bg-white border-b border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${highContrast ? 'bg-yellow-300 text-black' : 'bg-indigo-600 text-white'}`}>
               <Volume2 size={24} />
             </div>
             <h1 className={`font-extrabold tracking-tight ${fontSize === 'extra-large' ? 'text-2xl' : 'text-xl'}`}>
               SetuAI
             </h1>
          </div>
          
          <div className="flex gap-2">
            <Button 
               label="Toggle High Contrast" 
               variant="icon" 
               onClick={toggleHighContrast}
               icon={highContrast ? <Sun size={24} /> : <Moon size={24} />} 
               className="rounded-full"
            />
            <Button 
               label="Settings" 
               variant="icon" 
               onClick={() => setShowSettings(!showSettings)}
               icon={<Settings size={24} />} 
               className={`rounded-full ${showSettings ? 'bg-gray-200 dark:bg-zinc-700' : ''}`}
            />
          </div>
        </div>

        {/* Accessibility Settings Panel */}
        {showSettings && (
          <div className={`border-t p-4 ${highContrast ? 'bg-zinc-900 border-yellow-800' : 'bg-slate-100 border-slate-200'}`}>
            <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <h3 className="font-bold uppercase text-sm opacity-70">Text Size</h3>
                <div className="flex gap-2">
                  <button onClick={() => setFontSize('normal')} className={`p-3 rounded-lg border-2 ${fontSize === 'normal' ? 'border-indigo-500 bg-indigo-50 dark:bg-zinc-700' : 'border-gray-300'}`}>A</button>
                  <button onClick={() => setFontSize('large')} className={`p-3 rounded-lg border-2 text-xl ${fontSize === 'large' ? 'border-indigo-500 bg-indigo-50 dark:bg-zinc-700' : 'border-gray-300'}`}>A</button>
                  <button onClick={() => setFontSize('extra-large')} className={`p-3 rounded-lg border-2 text-2xl font-bold ${fontSize === 'extra-large' ? 'border-indigo-500 bg-indigo-50 dark:bg-zinc-700' : 'border-gray-300'}`}>A</button>
                </div>
              </div>
              
              <div className="space-y-3">
                 <h3 className="font-bold uppercase text-sm opacity-70">Speech Speed: {speechSpeed.toFixed(1)}x</h3>
                 <div className="flex items-center gap-4">
                   <Button variant="secondary" label="Slower" onClick={() => setSpeechSpeed(Math.max(0.5, speechSpeed - 0.25))} icon={<Minus size={16} />} />
                   <div className="w-24 h-2 bg-gray-300 rounded-full overflow-hidden">
                     <div className="h-full bg-indigo-600" style={{ width: `${(speechSpeed - 0.5) / 1.5 * 100}%` }}></div>
                   </div>
                   <Button variant="secondary" label="Faster" onClick={() => setSpeechSpeed(Math.min(2.0, speechSpeed + 0.25))} icon={<Plus size={16} />} />
                 </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Navigation Tabs */}
      <nav className="max-w-4xl mx-auto mt-6 px-4">
        <div className={`flex rounded-xl p-1 ${highContrast ? 'bg-zinc-800 border border-yellow-300' : 'bg-white shadow-sm border border-slate-200'}`}>
          <button 
            onClick={() => setMode('TTS')}
            className={`flex-1 py-4 rounded-lg flex items-center justify-center gap-2 font-bold transition-all ${mode === 'TTS' 
              ? (highContrast ? 'bg-yellow-300 text-black' : 'bg-indigo-600 text-white shadow-md') 
              : 'hover:bg-gray-100 dark:hover:bg-zinc-700'}`}
          >
            <Type size={20} /> Text to Speech
          </button>
          <button 
            onClick={() => setMode('STT')}
            className={`flex-1 py-4 rounded-lg flex items-center justify-center gap-2 font-bold transition-all ${mode === 'STT' 
              ? (highContrast ? 'bg-yellow-300 text-black' : 'bg-indigo-600 text-white shadow-md') 
              : 'hover:bg-gray-100 dark:hover:bg-zinc-700'}`}
          >
            <Mic size={20} /> Speech to Text
          </button>
          <button 
            onClick={() => setMode('HISTORY')}
            className={`flex-1 py-4 rounded-lg flex items-center justify-center gap-2 font-bold transition-all ${mode === 'HISTORY' 
              ? (highContrast ? 'bg-yellow-300 text-black' : 'bg-indigo-600 text-white shadow-md') 
              : 'hover:bg-gray-100 dark:hover:bg-zinc-700'}`}
          >
            <History size={20} /> History
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 py-8 pb-32">
        {mode === 'TTS' && (
          <div className="animate-fade-in">
             <div className="text-center mb-6">
                <h2 className={`font-bold ${fontSize === 'extra-large' ? 'text-3xl' : 'text-2xl'} mb-2`}>Type to Speak</h2>
                <p className="opacity-70">Convert written text into natural sounding voice.</p>
             </div>
             <TextToSpeech onSaveHistory={addToHistory} />
          </div>
        )}

        {mode === 'STT' && (
          <div className="animate-fade-in">
             <div className="text-center mb-6">
                <h2 className={`font-bold ${fontSize === 'extra-large' ? 'text-3xl' : 'text-2xl'} mb-2`}>Speak to Type</h2>
                <p className="opacity-70">Convert your voice into written text accurately.</p>
             </div>
             <SpeechToText onSaveHistory={addToHistory} />
          </div>
        )}

        {mode === 'HISTORY' && (
          <div className="animate-fade-in">
             <div className="text-center mb-6">
                <h2 className={`font-bold ${fontSize === 'extra-large' ? 'text-3xl' : 'text-2xl'} mb-2`}>Saved Phrases & History</h2>
                <p className="opacity-70">Access your recently used translations and transcriptions.</p>
             </div>
             
             <div className="space-y-4">
                {history.length === 0 ? (
                  <div className="text-center py-12 opacity-50 border-2 border-dashed border-gray-300 rounded-xl">
                    <p>No history yet.</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <div key={item.id} className={`p-4 rounded-xl border-2 flex justify-between items-center ${highContrast ? 'border-yellow-900 bg-zinc-900' : 'border-indigo-50 bg-white shadow-sm'}`}>
                       <div className="flex-1">
                          <div className="flex gap-2 mb-2">
                             <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${highContrast ? 'bg-yellow-900 text-yellow-100' : 'bg-indigo-100 text-indigo-700'}`}>
                               {item.type}
                             </span>
                             <span className="text-xs opacity-60 flex items-center">{item.language}</span>
                             <span className="text-xs opacity-60 flex items-center">{new Date(item.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <p className={`${getFontSizeClass()} font-medium`}>{item.text}</p>
                       </div>
                    </div>
                  ))
                )}
             </div>
          </div>
        )}
      </main>

    </div>
  );
};

function App() {
  return (
    <AccessibilityProvider>
      <MainContent />
    </AccessibilityProvider>
  );
}

export default App;
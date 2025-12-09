import React, { useState, useRef, useEffect } from 'react';
import { useA11y } from '../contexts/AccessibilityContext';
import { SupportedLanguage } from '../types';
import { generateSpeech, decodeAudioData } from '../services/geminiService';
import { Button } from './Button';
import { Play, Square, RotateCcw, AlertCircle, Loader2 } from 'lucide-react';

interface TTSProps {
  onSaveHistory: (text: string, lang: SupportedLanguage) => void;
}

export const TextToSpeech: React.FC<TTSProps> = ({ onSaveHistory }) => {
  const { getFontSizeClass, speechSpeed } = useA11y();
  const [text, setText] = useState('');
  const [language, setLanguage] = useState<SupportedLanguage>(SupportedLanguage.Hindi);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    return () => {
      stopAudio();
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
      }
    };
  }, []);

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch (e) {
        // Ignore errors if already stopped
      }
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
  };

  const handleSpeak = async () => {
    if (!text.trim()) return;
    setError(null);
    stopAudio();
    setLoading(true);

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // Resume context if suspended (browser policy)
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const base64Audio = await generateSpeech(text, language, speechSpeed);
      const audioBuffer = await decodeAudioData(base64Audio, audioContextRef.current);

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      // Note: Gemini returns raw audio, pitch/speed modification via Web Audio API
      source.playbackRate.value = speechSpeed; 
      
      source.connect(audioContextRef.current.destination);
      
      source.onended = () => {
        setIsPlaying(false);
        sourceNodeRef.current = null;
      };

      sourceNodeRef.current = source;
      source.start();
      setIsPlaying(true);
      
      // Save to history on successful generation
      onSaveHistory(text, language);

    } catch (err: any) {
      console.error(err);
      setError("Failed to generate speech. Please try again. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const commonPhrases = [
    "I need help.",
    "Thank you.",
    "Where is the restroom?",
    "Please call a doctor.",
    "I am hungry."
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto p-2">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-indigo-50 dark:bg-zinc-800 p-4 rounded-xl">
        <label className={`font-bold ${getFontSizeClass()} dark:text-yellow-300`}>
          Select Language:
        </label>
        <select 
          value={language}
          onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
          className={`p-3 rounded-lg border-2 border-indigo-200 dark:border-zinc-600 bg-white dark:bg-black dark:text-yellow-300 w-full md:w-64 ${getFontSizeClass()}`}
          aria-label="Language Selector"
        >
          {Object.values(SupportedLanguage).map(lang => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
      </div>

      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Type in ${language} or English here...`}
          className={`w-full h-48 md:h-64 rounded-xl p-6 border-2 border-indigo-100 focus:border-indigo-500 dark:bg-black dark:border-zinc-700 dark:text-yellow-300 resize-none shadow-inner ${getFontSizeClass()}`}
          aria-label="Text to speech input"
        />
        {text && (
          <button 
            onClick={() => setText('')}
            className="absolute top-4 right-4 p-2 bg-gray-200 dark:bg-zinc-700 rounded-full hover:bg-gray-300"
            aria-label="Clear text"
          >
            <RotateCcw size={20} />
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg flex items-center gap-2">
          <AlertCircle />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isPlaying ? (
           <Button 
             variant="danger" 
             label="Stop Speaking" 
             onClick={stopAudio}
             className="w-full h-16"
             icon={<Square size={28} fill="currentColor" />}
           >
             STOP
           </Button>
        ) : (
          <Button 
            variant="primary" 
            label="Speak Text" 
            onClick={handleSpeak}
            disabled={loading || !text}
            className={`w-full h-16 ${loading ? 'opacity-70' : ''}`}
            icon={loading ? <Loader2 className="animate-spin" /> : <Play size={28} fill="currentColor" />}
          >
            {loading ? "Generating Audio..." : "SPEAK"}
          </Button>
        )}

        <div className="flex gap-2 overflow-x-auto pb-2">
          {commonPhrases.map((phrase, idx) => (
             <button
               key={idx}
               onClick={() => setText(phrase)}
               className="whitespace-nowrap px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100 hover:bg-indigo-100 dark:bg-zinc-800 dark:text-yellow-300 dark:border-zinc-600 font-medium"
             >
               {phrase}
             </button>
          ))}
        </div>
      </div>
    </div>
  );
};
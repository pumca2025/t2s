import React, { useState, useRef, useEffect } from 'react';
import { useA11y } from '../contexts/AccessibilityContext';
import { SupportedLanguage } from '../types';
import { transcribeAudio } from '../services/geminiService';
import { Button } from './Button';
import { Mic, Square, Copy, Check, AlertCircle, Loader2 } from 'lucide-react';

interface STTProps {
  onSaveHistory: (text: string, lang: SupportedLanguage) => void;
}

export const SpeechToText: React.FC<STTProps> = ({ onSaveHistory }) => {
  const { getFontSizeClass } = useA11y();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [language, setLanguage] = useState<SupportedLanguage>(SupportedLanguage.Hindi);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    setError(null);
    setTranscript('');
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks to release mic
        stream.getTracks().forEach(track => track.stop());
        
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      setError("Could not access microphone. Please allow permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      const result = await transcribeAudio(audioBlob, language);
      setTranscript(result);
      if (result) onSaveHistory(result, language);
    } catch (err) {
      console.error(err);
      setError("Failed to transcribe audio. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto p-2">
       <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-indigo-50 dark:bg-zinc-800 p-4 rounded-xl">
        <label className={`font-bold ${getFontSizeClass()} dark:text-yellow-300`}>
          Spoken Language:
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

      <div className="flex flex-col items-center justify-center py-8">
        {!isRecording && !isProcessing && (
          <button
            onClick={startRecording}
            className="w-48 h-48 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 shadow-2xl flex flex-col items-center justify-center gap-2 transition-transform active:scale-95 outline-none focus:ring-8 focus:ring-yellow-400"
            aria-label="Start Recording"
          >
            <Mic size={64} />
            <span className="text-xl font-bold">TAP TO SPEAK</span>
          </button>
        )}

        {isRecording && (
           <button
             onClick={stopRecording}
             className="w-48 h-48 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-2xl flex flex-col items-center justify-center gap-2 animate-pulse outline-none focus:ring-8 focus:ring-yellow-400"
             aria-label="Stop Recording"
           >
             <Square size={64} fill="currentColor" />
             <span className="text-xl font-bold">STOP</span>
           </button>
        )}

        {isProcessing && (
          <div className="w-48 h-48 rounded-full bg-gray-200 dark:bg-zinc-800 flex flex-col items-center justify-center gap-2">
            <Loader2 size={48} className="animate-spin text-indigo-600 dark:text-yellow-300" />
            <span className="text-lg font-medium dark:text-white">Processing...</span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg flex items-center gap-2">
          <AlertCircle />
          <span>{error}</span>
        </div>
      )}

      {transcript && (
        <div className="bg-white dark:bg-zinc-900 border-2 border-indigo-100 dark:border-zinc-700 rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4 border-b pb-2 dark:border-zinc-700">
             <h3 className="font-bold text-gray-500 dark:text-gray-400 uppercase text-sm">Transcript</h3>
             <Button 
               variant="secondary" 
               label="Copy Text" 
               onClick={copyToClipboard}
               className="!py-2 !px-4"
               icon={copied ? <Check size={18} /> : <Copy size={18} />}
             >
               {copied ? "Copied" : "Copy"}
             </Button>
          </div>
          <p className={`${getFontSizeClass()} dark:text-white leading-relaxed`}>
            {transcript}
          </p>
        </div>
      )}
    </div>
  );
};
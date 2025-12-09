import { GoogleGenAI, Modality } from "@google/genai";
import { SupportedLanguage } from '../types';

// Helper to decode base64 audio string to AudioBuffer
export const decodeAudioData = async (
  base64Data: string, 
  audioContext: AudioContext
): Promise<AudioBuffer> => {
  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return await audioContext.decodeAudioData(bytes.buffer);
};

// Helper to convert Blob to Base64
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  return new GoogleGenAI({ apiKey });
};

export const generateSpeech = async (
  text: string, 
  language: SupportedLanguage,
  speed: number = 1.0
): Promise<string> => {
  const ai = getClient();
  
  // We use the TTS preview model
  // Note: Speed isn't a direct param in the preview yet, but we can instruct in text or post-process.
  // We will prioritize the correct language pronunciation via prompt.
  
  const prompt = `Read the following text clearly and naturally in ${language}. Text: "${text}"`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { 
            // Selecting a clear voice. 'Kore' is often good for general tasks.
            voiceName: 'Kore' 
          },
        },
      },
    },
  });

  const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!audioData) {
    throw new Error("No audio data generated");
  }

  return audioData;
};

export const transcribeAudio = async (
  audioBlob: Blob, 
  language: SupportedLanguage
): Promise<string> => {
  const ai = getClient();
  const base64Audio = await blobToBase64(audioBlob);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        inlineData: {
          mimeType: audioBlob.type || "audio/wav",
          data: base64Audio
        }
      },
      {
        text: `Transcribe the spoken audio exactly into written text. The language is ${language}. formatted as plain text. Do not add any preamble.`
      }
    ],
  });

  return response.text || "";
};
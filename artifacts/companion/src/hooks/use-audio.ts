import { useState, useCallback, useRef } from 'react';

export function useAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const playBase64 = useCallback(async (base64String: string) => {
    initAudio();
    if (!audioContextRef.current) return;

    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
    }

    try {
      const binaryString = window.atob(base64String);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const audioBuffer = await audioContextRef.current.decodeAudioData(bytes.buffer);
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      
      source.onended = () => {
        setIsPlaying(false);
      };

      sourceNodeRef.current = source;
      source.start(0);
      setIsPlaying(true);
    } catch (e) {
      console.error("Failed to play audio", e);
      setIsPlaying(false);
    }
  }, []);

  const stopAudio = useCallback(() => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      setIsPlaying(false);
    }
  }, []);

  return { isPlaying, playBase64, stopAudio, initAudio };
}

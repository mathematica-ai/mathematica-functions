import { useState, useEffect } from 'react';

export function useSpeechSynthesis() {
  const [synthesis, setSynthesis] = useState<any>(null);
  const [voices, setVoices] = useState<any[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSynthesis(window.speechSynthesis);
    }
  }, []);

  useEffect(() => {
    if (!synthesis) return;

    const loadVoices = () => {
      const availableVoices = synthesis.getVoices();
      setVoices(availableVoices);
      const defaultVoice = availableVoices.find((voice: any) => voice.lang.startsWith('en-'));
      if (defaultVoice) setSelectedVoice(defaultVoice);
    };

    loadVoices();
    synthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      synthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, [synthesis]);

  const speak = (text: string, options = {}) => {
    if (!synthesis || !selectedVoice) return;

    synthesis.cancel();
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    Object.assign(utterance, options);
    synthesis.speak(utterance);

    return utterance;
  };

  const cancel = () => {
    if (synthesis) {
      synthesis.cancel();
    }
  };

  return {
    synthesis,
    voices,
    selectedVoice,
    setSelectedVoice,
    speak,
    cancel,
  };
} 
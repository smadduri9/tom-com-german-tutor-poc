import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import * as Speech from 'expo-speech';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import { audioMap, type AudioKey } from '../data/audioMap';
import type { Lang } from '../types';

// Recorded clips play when they exist; any other German is spoken by the device voice.
type AudioCtx = {
  play: (audioId: string | undefined, german: string, slow?: boolean) => void;
  speak: (text: string, lang: Lang | 'de') => void;
  stop: () => void;
};
const Ctx = createContext<AudioCtx | null>(null);

const VOICE_LANG: Record<Lang | 'de', string> = { de: 'de-DE', en: 'en-IN', te: 'te-IN', hi: 'hi-IN' };

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const player = useAudioPlayer(audioMap.p01);
  const current = useRef<AudioKey>('p01');

  useEffect(() => {
    // Without this, iPhones on silent mode play nothing.
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, []);

  const speak = useCallback((text: string, lang: Lang | 'de') => {
    Speech.stop();
    Speech.speak(text, { language: VOICE_LANG[lang], rate: lang === 'de' ? 0.9 : 1 });
  }, []);

  const stop = useCallback(() => {
    Speech.stop();
    player.pause();
  }, [player]);

  const play = useCallback(
    (audioId: string | undefined, german: string, slow = false) => {
      const key = (audioId ? (slow ? `${audioId}_slow` : audioId) : '') as AudioKey;
      const source = key ? audioMap[key] : undefined;
      if (!source) {
        Speech.stop();
        Speech.speak(german, { language: 'de-DE', rate: slow ? 0.6 : 0.9 });
        return;
      }
      (async () => {
        try {
          Speech.stop();
          if (current.current === key) await player.seekTo(0);
          else {
            player.replace(source);
            current.current = key;
          }
          player.play();
        } catch (e) {
          console.warn('audio error', e);
          Speech.speak(german, { language: 'de-DE', rate: slow ? 0.6 : 0.9 });
        }
      })();
    },
    [player],
  );

  const value = useMemo(() => ({ play, speak, stop }), [play, speak, stop]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAudio(): AudioCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAudio must be used inside AudioProvider');
  return v;
}

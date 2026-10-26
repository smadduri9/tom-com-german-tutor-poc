import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { Alert } from 'react-native';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import { audioMap, type AudioKey } from '../data/audioMap';
import { useApp } from '../state/AppContext';
import { t } from '../i18n/t';

type AudioCtx = { play: (audioId: string, slow?: boolean) => void };
const Ctx = createContext<AudioCtx | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const { lang } = useApp();
  const player = useAudioPlayer(audioMap.p01);
  const current = useRef<AudioKey>('p01');

  useEffect(() => {
    // Without this, iPhones on silent mode play nothing.
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, []);

  const play = useCallback(
    (audioId: string, slow = false) => {
      const key = (slow ? `${audioId}_slow` : audioId) as AudioKey;
      const source = audioMap[key];
      if (!source) {
        Alert.alert(t(lang, 'audioError'));
        return;
      }
      (async () => {
        try {
          if (current.current === key) {
            await player.seekTo(0);
          } else {
            player.replace(source);
            current.current = key;
          }
          player.play();
        } catch (e) {
          console.warn('audio error', e);
          Alert.alert(t(lang, 'audioError'));
        }
      })();
    },
    [player, lang],
  );

  const value = useMemo(() => ({ play }), [play]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAudio(): AudioCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAudio must be used inside AudioProvider');
  return v;
}

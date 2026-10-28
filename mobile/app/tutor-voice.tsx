import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import Svg, { Circle, Ellipse } from 'react-native-svg';
import { speakAnswer } from '../src/components/TutorMessage';
import { useApp } from '../src/state/AppContext';
import { useTutor } from '../src/state/TutorContext';
import { parseTutorAnswer } from '../src/logic/tutorLines';
import { t } from '../src/i18n/t';
import { space } from '../src/theme';

type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking';

// Wireframe globe: one circle and five ellipses.
function Orb({ state }: { state: VoiceState }) {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const speed = state === 'idle' ? 2400 : state === 'thinking' ? 700 : 1100;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: speed, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: speed, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [state, pulse]);
  const amount = state === 'idle' ? 0.03 : state === 'speaking' ? 0.12 : 0.08;
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1 + amount] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1] });
  return (
    <Animated.View style={{ transform: [{ scale }], opacity }}>
      <Svg width={240} height={240} viewBox="0 0 240 240">
        <Circle cx={120} cy={120} r={100} stroke="white" strokeWidth={1.5} fill="none" />
        <Ellipse cx={120} cy={120} rx={100} ry={35} stroke="white" strokeWidth={1} fill="none" />
        <Ellipse cx={120} cy={120} rx={100} ry={70} stroke="white" strokeWidth={1} fill="none" opacity={0.7} />
        <Ellipse cx={120} cy={120} rx={35} ry={100} stroke="white" strokeWidth={1} fill="none" />
        <Ellipse cx={120} cy={120} rx={70} ry={100} stroke="white" strokeWidth={1} fill="none" opacity={0.7} />
        <Ellipse cx={120} cy={120} rx={100} ry={8} stroke="white" strokeWidth={1} fill="none" opacity={0.5} />
      </Svg>
    </Animated.View>
  );
}

export default function TutorVoice() {
  const { lang } = useApp();
  const { ask } = useTutor();
  const [state, setState] = useState<VoiceState>('idle');
  const [caption, setCaption] = useState('');
  const alive = useRef(true);

  useEffect(
    () => () => {
      alive.current = false;
      Speech.stop();
    },
    [],
  );

  const waitForSpeech = async () => {
    // Poll until the queued utterances finish, then go back to idle.
    while (alive.current && (await Speech.isSpeakingAsync())) await new Promise((r) => setTimeout(r, 400));
    if (alive.current) setState('idle');
  };

  const onQuestion = async (q: string | undefined) => {
    const question = q?.trim();
    if (!question) return setState('idle');
    setCaption(question);
    setState('thinking');
    const answer = await ask(question, 'ask');
    if (!alive.current) return;
    if (!answer) return setState('idle');
    const firstDe = parseTutorAnswer(answer).find((b) => b.kind === 'de');
    setCaption(firstDe && firstDe.kind === 'de' ? firstDe.de : answer.split('\n')[0]);
    setState('speaking');
    speakAnswer(answer, lang);
    setTimeout(waitForSpeech, 600);
  };

  // Expo Go has no speech recognition yet, so the mic opens a text prompt for now.
  const onMic = () => {
    setState('listening');
    Alert.prompt(t(lang, 'voiceHint'), t(lang, 'voicePrompt'), [
      { text: t(lang, 'close'), style: 'cancel', onPress: () => setState('idle') },
      { text: t(lang, 'send'), onPress: (v?: string) => onQuestion(v) },
    ]);
  };

  const hint =
    state === 'listening' ? t(lang, 'voiceListening') : state === 'thinking' ? t(lang, 'thinking') : state === 'speaking' ? t(lang, 'voiceSpeaking') : t(lang, 'voiceHint');

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.top}>
        <Text style={styles.caption}>{t(lang, 'voiceCaption')}</Text>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={t(lang, 'close')} hitSlop={12} style={styles.close}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      </View>
      <View style={styles.center}>
        <Orb state={state} />
        {caption ? <Text style={styles.said}>{caption}</Text> : null}
      </View>
      <View style={styles.bottom}>
        <Text style={styles.hint}>{hint}</Text>
        <Pressable
          onPress={onMic}
          disabled={state === 'thinking'}
          accessibilityRole="button"
          accessibilityLabel={t(lang, 'voiceHint')}
          style={({ pressed }) => [styles.mic, (pressed || state === 'thinking') && { opacity: 0.7 }]}
        >
          <Text style={styles.micIcon}>🎙</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  top: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: space.md },
  caption: { color: '#BBB', fontSize: 13, letterSpacing: 2, fontWeight: '700' },
  close: { position: 'absolute', right: space.md, top: space.sm, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  closeText: { color: 'white', fontSize: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.lg },
  said: { color: 'white', fontSize: 18, lineHeight: 26, textAlign: 'center', marginTop: space.lg },
  bottom: { alignItems: 'center', paddingBottom: space.xl },
  hint: { color: '#CCC', fontSize: 16, marginBottom: space.md },
  mic: { width: 84, height: 84, borderRadius: 42, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' },
  micIcon: { fontSize: 34 },
});

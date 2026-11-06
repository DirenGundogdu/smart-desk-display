import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

// What the spoken text will be used for.
export type DictationTarget =
  | { kind: 'addItem' }
  | { kind: 'editItem'; id: string }
  | { kind: 'addList' }
  | { kind: 'renameList'; id: string };

// Used when the phone has no default recognizer (the Google app was removed during cleanup).
const FALLBACK_SERVICES = ['com.google.android.tts', 'com.google.android.as', 'com.google.android.googlequicksearchbox'];

function pickService(): string | undefined {
  if (Platform.OS !== 'android') return undefined;
  if (ExpoSpeechRecognitionModule.getDefaultRecognitionService().packageName) return undefined;
  const available = ExpoSpeechRecognitionModule.getSpeechRecognitionServices();
  return FALLBACK_SERVICES.find((p) => available.includes(p)) ?? available[0];
}

const tidy = (t: string) => {
  const s = t.trim().replace(/\s+/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export function useDictation(onText: (text: string, target: DictationTarget) => void) {
  const [target, setTarget] = useState<DictationTarget | null>(null);
  const [partial, setPartial] = useState('');
  const [error, setError] = useState<string | null>(null);
  const targetRef = useRef<DictationTarget | null>(null);
  const onTextRef = useRef(onText);
  useEffect(() => {
    onTextRef.current = onText;
  });
  const clearError = useCallback(() => setError(null), []);

  useSpeechRecognitionEvent('result', (e) => {
    const text = e.results[0]?.transcript ?? '';
    if (!e.isFinal) {
      setPartial(text);
      return;
    }
    const t = targetRef.current;
    if (t && text.trim()) onTextRef.current(tidy(text), t);
    targetRef.current = null;
  });

  useSpeechRecognitionEvent('end', () => {
    targetRef.current = null;
    setTarget(null);
    setPartial('');
  });

  useSpeechRecognitionEvent('error', (e) => {
    if (e.error === 'aborted') return;
    setError(e.error === 'no-speech' || e.error === 'speech-timeout' ? "Didn't catch that" : e.message || e.error);
  });

  const start = async (t: DictationTarget) => {
    setError(null);
    const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!perm.granted) {
      setError('Microphone permission denied');
      return;
    }
    targetRef.current = t;
    setTarget(t);
    setPartial('');
    try {
      ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: true,
        continuous: false,
        androidRecognitionServicePackage: pickService(),
      });
    } catch (err) {
      targetRef.current = null;
      setTarget(null);
      setError(String(err));
    }
  };

  // Stop listening and keep what was heard so far.
  const stop = () => ExpoSpeechRecognitionModule.stop();

  // Stop listening and discard.
  const cancel = () => {
    targetRef.current = null;
    ExpoSpeechRecognitionModule.abort();
  };

  return { target, partial, error, clearError, start, stop, cancel };
}

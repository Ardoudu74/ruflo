import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Colors } from '../../constants/Colors';
import { Type } from '../../constants/Typography';
import { Spacing, Radius } from '../../constants/Spacing';
import { useAuthStore } from '../../store/useAuthStore';
import type { Genre, BudgetTier, CrowdPref } from '../../types/auth';
import { verifyAge } from '../../services/ageGate';

const { width: W } = Dimensions.get('window');
const STEP_COUNT = 4;

const GENRES: Genre[] = [
  'Techno','House','Deep House','Tech House','Afro House',
  'Electronic','Hip-Hop','R&B','Latin','Reggaeton',
  'Commercial','Open Format','Drum & Bass','Disco','Live Acts',
];

const BUDGETS: { id: BudgetTier; label: string; desc: string }[] = [
  { id:'free', label:'FREE',   desc:'Only free entries' },
  { id:'low',  label:'€',      desc:'Under €20' },
  { id:'mid',  label:'€€',     desc:'€20–50' },
  { id:'high', label:'€€€',   desc:'€50–100' },
  { id:'vip',  label:'VIP',    desc:'No limit' },
];

const CROWD: { id: CrowdPref; label: string; emoji: string }[] = [
  { id:'local',         label:'LOCAL CROWD',         emoji:'🏠' },
  { id:'mixed',         label:'MIXED',                emoji:'🌍' },
  { id:'international', label:'INTERNATIONAL SCENE',  emoji:'✈' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const patchProfile = useAuthStore(s => s.patchProfile);
  const [step, setStep] = useState(0);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [budget, setBudget] = useState<BudgetTier>('mid');
  const [crowd, setCrowd] = useState<CrowdPref>('mixed');
  const [dob, setDob] = useState('');
  const [dobError, setDobError] = useState('');

  const progress = useSharedValue(0);
  const progStyle = useAnimatedStyle(() => ({ width: (W - Spacing.xl * 2) * progress.value }));

  const goNext = () => {
    if (step < STEP_COUNT - 1) {
      progress.value = withTiming((step + 1) / (STEP_COUNT - 1), { duration: 300 });
      setStep(s => s + 1);
    } else {
      finish();
    }
  };

  const finish = () => {
    const ageResult = verifyAge(dob);
    if (!ageResult.ok) { setDobError(ageResult.reason ?? 'Invalid'); return; }
    patchProfile({ genres, budget, crowdPref: crowd });
    router.replace('/(tabs)');
  };

  const toggleGenre = (g: Genre) =>
    setGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#1a0a2e', '#0d0010']} style={StyleSheet.absoluteFill} />
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, progStyle]} />
      </View>
      <Text style={styles.stepCount}>{step + 1} / {STEP_COUNT}</Text>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {step === 0 && (
          <View style={styles.step}>
            <Text style={styles.stepTitle}>YOUR SOUND</Text>
            <Text style={styles.stepSub}>Pick your genres — we'll find your perfect night</Text>
            <View style={styles.genreGrid}>
              {GENRES.map(g => {
                const on = genres.includes(g);
                return (
                  <TouchableOpacity key={g} style={[styles.genreChip, on && styles.genreChipOn]} onPress={() => toggleGenre(g)}>
                    <Text style={[styles.genreLabel, on && styles.genreLabelOn]}>{g.toUpperCase()}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {step === 1 && (
          <View style={styles.step}>
            <Text style={styles.stepTitle}>YOUR BUDGET</Text>
            <Text style={styles.stepSub}>How much do you usually spend on entry?</Text>
            <View style={styles.budgetList}>
              {BUDGETS.map(b => {
                const on = budget === b.id;
                return (
                  <TouchableOpacity key={b.id} style={[styles.budgetItem, on && styles.budgetItemOn]} onPress={() => setBudget(b.id)}>
                    <Text style={[styles.budgetLabel, on && { color: Colors.gold }]}>{b.label}</Text>
                    <Text style={styles.budgetDesc}>{b.desc}</Text>
                    {on && <Text style={styles.budgetCheck}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={styles.step}>
            <Text style={styles.stepTitle}>YOUR VIBE</Text>
            <Text style={styles.stepSub}>What kind of crowd are you into?</Text>
            <View style={styles.crowdList}>
              {CROWD.map(c => {
                const on = crowd === c.id;
                return (
                  <TouchableOpacity key={c.id} style={[styles.crowdItem, on && styles.crowdItemOn]} onPress={() => setCrowd(c.id)}>
                    <Text style={styles.crowdEmoji}>{c.emoji}</Text>
                    <Text style={[styles.crowdLabel, on && { color: Colors.gold }]}>{c.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={styles.step}>
            <Text style={styles.stepTitle}>DATE OF BIRTH</Text>
            <Text style={styles.stepSub}>Required by Apple App Store.{'\n'}You must be 18+ to purchase tickets.</Text>
            <TextInput
              style={styles.dobInput}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={Colors.textMuted}
              value={dob}
              onChangeText={t => { setDob(t); setDobError(''); }}
              keyboardType="numbers-and-punctuation"
              maxLength={10}
            />
            {dobError ? <Text style={styles.dobError}>{dobError}</Text> : null}
            <Text style={styles.dobNote}>Your date of birth is stored locally and never shared.</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextBtn, (step === 0 && genres.length === 0) && styles.nextBtnDisabled]}
          onPress={goNext}
          disabled={step === 0 && genres.length === 0}
        >
          <Text style={styles.nextBtnText}>{step === STEP_COUNT - 1 ? 'ENTER THE NIGHT →' : 'NEXT →'}</Text>
        </TouchableOpacity>
        {step < STEP_COUNT - 1 && (
          <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.skipBtn}>
            <Text style={styles.skipBtnText}>SKIP FOR NOW</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:           { flex: 1 },
  progressTrack:  { marginTop: 60, marginHorizontal: Spacing.xl, height: 2, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 1 },
  progressFill:   { height: 2, backgroundColor: Colors.gold, borderRadius: 1 },
  stepCount:      { ...Type.tag, color: Colors.textMuted, textAlign: 'right', marginRight: Spacing.xl, marginTop: 6 },
  content:        { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xxxl, paddingBottom: 40 },
  step:           { gap: Spacing.xl },
  stepTitle:      { ...Type.sectionHead, color: Colors.textPrimary },
  stepSub:        { ...Type.body, color: Colors.textSecondary, lineHeight: 22 },
  genreGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  genreChip:      { paddingHorizontal: Spacing.lg, paddingVertical: 9, borderRadius: Radius.full, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  genreChipOn:    { backgroundColor: Colors.gold, borderColor: Colors.gold },
  genreLabel:     { ...Type.tag, color: Colors.textSecondary },
  genreLabelOn:   { color: Colors.ink },
  budgetList:     { gap: Spacing.md },
  budgetItem:     { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg, borderRadius: Radius.xl, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', backgroundColor: Colors.cardBase },
  budgetItemOn:   { borderColor: Colors.gold + '66', backgroundColor: Colors.gold + '15' },
  budgetLabel:    { ...Type.labelLg, color: Colors.textPrimary, width: 48 },
  budgetDesc:     { ...Type.body, color: Colors.textSecondary, flex: 1 },
  budgetCheck:    { ...Type.label, color: Colors.gold },
  crowdList:      { gap: Spacing.lg },
  crowdItem:      { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, padding: Spacing.xl, borderRadius: Radius.xl, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', backgroundColor: Colors.cardBase },
  crowdItemOn:    { borderColor: Colors.gold + '66', backgroundColor: Colors.gold + '15' },
  crowdEmoji:     { fontSize: 28 },
  crowdLabel:     { ...Type.label, color: Colors.textPrimary, fontSize: 15 },
  dobInput:       { borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: Radius.lg, paddingHorizontal: Spacing.lg, height: 56, ...Type.labelLg, color: Colors.textPrimary, letterSpacing: 3 },
  dobError:       { ...Type.caption, color: '#FF3B30' },
  dobNote:        { ...Type.caption, color: Colors.textMuted, lineHeight: 18 },
  footer:         { paddingHorizontal: Spacing.xl, paddingBottom: 48, gap: Spacing.md },
  nextBtn:        { backgroundColor: Colors.gold, borderRadius: Radius.xl, padding: Spacing.xl, alignItems: 'center' },
  nextBtnDisabled:{ opacity: 0.4 },
  nextBtnText:    { ...Type.button, color: Colors.ink, fontSize: 17 },
  skipBtn:        { alignItems: 'center', padding: Spacing.sm },
  skipBtnText:    { ...Type.label, color: Colors.textMuted },
});

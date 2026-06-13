import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Type } from '../../constants/Typography';
import { Spacing, Radius } from '../../constants/Spacing';
import { signInWithApple, signInWithEmail, registerWithEmail, continueAsGuest } from '../../services/auth';
import { useAuthStore, selectHasProfile, selectAgeVerified } from '../../store/useAuthStore';

type Mode = 'landing' | 'signin' | 'register';

export default function AuthScreen() {
  const router   = useRouter();
  const { loading, error } = useAuthStore();
  const [mode, setMode]     = useState<Mode>('landing');
  const [email, setEmail]   = useState('');
  const [pw, setPw]         = useState('');

  const afterAuth = () => {
    const state = useAuthStore.getState();
    const complete = selectHasProfile(state) && selectAgeVerified(state);
    router.replace(complete ? '/(tabs)' : '/onboarding');
  };

  const handleApple = async () => {
    await signInWithApple();
    afterAuth();
  };

  const handleEmail = async () => {
    if (mode === 'signin') await signInWithEmail(email, pw);
    else await registerWithEmail(email, pw);
    if (!useAuthStore.getState().error) afterAuth();
  };

  const handleGuest = () => {
    continueAsGuest();
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.root}>
        <LinearGradient colors={['#1a0a2e', '#0d0010', '#000']} style={StyleSheet.absoluteFill} />

        {/* Logo */}
        <View style={styles.logoWrap}>
          <Text style={styles.logoIcon}>🍸</Text>
          <Text style={styles.logoName}>NIGHTOUT</Text>
          <Text style={styles.tagline}>WHERE THE NIGHT BEGINS</Text>
        </View>

        {mode === 'landing' && (
          <View style={styles.buttons}>
            {/* Sign In with Apple — mandatory per App Store guidelines */}
            <TouchableOpacity style={styles.appleBtn} onPress={handleApple} disabled={loading}>
              <Text style={styles.appleBtnIcon}></Text>
              <Text style={styles.appleBtnText}>SIGN IN WITH APPLE</Text>
              {loading && <ActivityIndicator color="#fff" size="small" style={{ marginLeft: 8 }} />}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.emailBtn} onPress={() => setMode('signin')}>
              <Text style={styles.emailBtnText}>SIGN IN WITH EMAIL</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.registerBtn} onPress={() => setMode('register')}>
              <Text style={styles.registerBtnText}>CREATE ACCOUNT</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleGuest} style={styles.guestBtn}>
              <Text style={styles.guestBtnText}>BROWSE AS GUEST</Text>
            </TouchableOpacity>
          </View>
        )}

        {(mode === 'signin' || mode === 'register') && (
          <View style={styles.form}>
            <Text style={styles.formTitle}>
              {mode === 'signin' ? 'WELCOME BACK' : 'CREATE ACCOUNT'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={Colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry
              value={pw}
              onChangeText={setPw}
            />

            {error && <Text style={styles.error}>{error}</Text>}

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleEmail}
              disabled={loading || !email || !pw}
            >
              {loading
                ? <ActivityIndicator color={Colors.ink} />
                : <Text style={styles.submitBtnText}>
                    {mode === 'signin' ? 'SIGN IN' : 'REGISTER'}
                  </Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setMode('landing')} style={styles.backLink}>
              <Text style={styles.backLinkText}>← BACK</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.legal}>
          By continuing you agree to our Terms of Service and Privacy Policy.{'\n'}
          You must be 18+ to purchase tickets.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:        { flex: 1, justifyContent: 'space-between', padding: Spacing.xl, paddingTop: 80 },
  logoWrap:    { alignItems: 'center', gap: Spacing.sm },
  logoIcon:    { fontSize: 64 },
  logoName:    { ...Type.heroTitle, color: Colors.textPrimary, fontSize: 48, letterSpacing: -1 },
  tagline:     { ...Type.label, color: Colors.gold, letterSpacing: 4 },
  buttons:     { gap: Spacing.md },
  appleBtn:    {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#fff', borderRadius: Radius.xl, padding: Spacing.lg,
  },
  appleBtnIcon:{ fontSize: 18 },
  appleBtnText:{ ...Type.button, color: '#000' },
  divider:     { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  dividerText: { ...Type.tag, color: Colors.textMuted },
  emailBtn:    {
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: Radius.xl,
    padding: Spacing.lg, alignItems: 'center',
  },
  emailBtnText:   { ...Type.button, color: Colors.textPrimary },
  registerBtn:    {
    borderWidth: 1, borderColor: Colors.gold + '55', borderRadius: Radius.xl,
    padding: Spacing.lg, alignItems: 'center',
  },
  registerBtnText:{ ...Type.button, color: Colors.gold },
  guestBtn:       { alignItems: 'center', padding: Spacing.md },
  guestBtnText:   { ...Type.label, color: Colors.textMuted },
  form:           { gap: Spacing.lg },
  formTitle:      { ...Type.sectionHead, color: Colors.textPrimary },
  input:          {
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg, height: 52,
    ...Type.body, color: Colors.textPrimary,
  },
  error:          { ...Type.caption, color: '#FF3B30' },
  submitBtn:      { backgroundColor: Colors.gold, borderRadius: Radius.xl, padding: Spacing.lg, alignItems: 'center' },
  submitBtnText:  { ...Type.button, color: Colors.ink },
  backLink:       { alignItems: 'center' },
  backLinkText:   { ...Type.label, color: Colors.textMuted },
  legal:          { ...Type.caption, color: Colors.textMuted, textAlign: 'center', lineHeight: 18 },
});

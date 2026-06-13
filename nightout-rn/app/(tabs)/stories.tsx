import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Modal, TextInput, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../constants/Colors';
import { Type } from '../../constants/Typography';
import { Spacing, Radius } from '../../constants/Spacing';
import { useAppStore } from '../../store/useAppStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useStoryStore } from '../../store/useStoryStore';
import { Story } from '../../types/story';
import type { Venue } from '../../types';
import { verifyUserAtVenue, buildStory, containsProfanity } from '../../services/stories';
import { VENUES } from '../../data/venues';

function StoryCard({ story, onReport }: { story: Story; onReport: (id: string) => void }) {
  const minutesLeft = Math.max(0, Math.round((story.expiresAt - Date.now()) / 60000));
  const hoursLeft = minutesLeft >= 60 ? `${Math.floor(minutesLeft / 60)}h` : `${minutesLeft}m`;
  const urgentColor = minutesLeft < 30 ? Colors.pink : minutesLeft < 60 ? '#FFB800' : Colors.textMuted;

  return (
    <View style={card.root}>
      <LinearGradient colors={[Colors.heroPurple, '#1a0010']} style={card.bg} />
      <View style={card.topRow}>
        <View style={card.avatar}>
          <Text style={card.avatarText}>{story.displayName[0].toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={card.name}>{story.displayName}</Text>
          <Text style={card.venue}>{story.venueName.toUpperCase()}</Text>
        </View>
        <View style={card.metaCol}>
          {story.geoVerified && (
            <View style={card.geoBadge}>
              <Text style={card.geoText}>📍 VERIFIED</Text>
            </View>
          )}
          <Text style={[card.expires, { color: urgentColor }]}>⏱ {hoursLeft}</Text>
        </View>
      </View>

      {story.caption ? <Text style={card.caption}>{story.caption}</Text> : null}

      <View style={card.videoPlaceholder}>
        <Text style={card.playIcon}>▶</Text>
        <Text style={card.videoHint}>VIDEO · {story.views} VIEWS</Text>
      </View>

      <TouchableOpacity style={card.reportBtn} onPress={() => onReport(story.id)}>
        <Text style={card.reportText}>REPORT</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function StoriesTab() {
  const { selectedCityId } = useAppStore();
  const { uid, profile } = useAuthStore();
  const { forCity, add, report, purgeExpired } = useStoryStore();
  const [showUpload, setShowUpload] = useState(false);
  const [caption, setCaption] = useState('');
  const [selectedVenueId, setSelectedVenueId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);

  useEffect(() => {
    purgeExpired();
    const t = setInterval(purgeExpired, 60_000);
    return () => clearInterval(t);
  }, []);

  const cityStories = forCity(selectedCityId);
  const cityVenues = VENUES.filter(v => v.city === selectedCityId).slice(0, 20);

  const handlePickVideo = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 0.7,
      videoMaxDuration: 30,
    });
    if (!res.canceled && res.assets[0]) {
      setVideoUri(res.assets[0].uri);
    }
  };

  const handlePost = async () => {
    if (!uid || uid === 'guest') {
      Alert.alert('Sign in required', 'You must be signed in to post stories.');
      return;
    }
    if (!videoUri) {
      Alert.alert('No video', 'Please select a video first.');
      return;
    }
    if (!selectedVenueId) {
      Alert.alert('Select venue', 'Choose which venue you are at.');
      return;
    }
    if (containsProfanity(caption)) {
      Alert.alert('Caption rejected', 'Your caption contains inappropriate language.');
      return;
    }

    const venue = VENUES.find(v => v.id === selectedVenueId);
    if (!venue) return;

    setUploading(true);
    try {
      const { verified, distanceM } = await verifyUserAtVenue(venue);
      if (!verified && distanceM >= 0) {
        Alert.alert(
          'Too far from venue',
          `You are ${distanceM}m away. Must be within 300m of ${venue.name} to post a geo-verified story.`,
          [
            { text: 'Post anyway (unverified)', onPress: () => submitStory(venue, false) },
            { text: 'Cancel', style: 'cancel', onPress: () => setUploading(false) },
          ]
        );
        return;
      }
      submitStory(venue, verified);
    } catch {
      setUploading(false);
      Alert.alert('Location error', 'Could not verify your location. Please try again.');
    }
  };

  const submitStory = async (venue: Venue, geoVerified: boolean) => {
    const story = buildStory(
      uid!,
      profile?.displayName ?? 'Night Walker',
      venue,
      videoUri!,
      caption,
      0, 0,
      geoVerified,
    );
    add(story);
    setUploading(false);
    setShowUpload(false);
    setCaption('');
    setVideoUri(null);
    setSelectedVenueId('');
    Alert.alert('Posted!', geoVerified ? 'Your geo-verified story is live until 6AM.' : 'Your story is live until 6AM.');
  };

  const handleReport = (id: string) => {
    Alert.alert('Report story', 'Why are you reporting this?', [
      { text: 'Inappropriate content', onPress: () => { report(id); Alert.alert('Reported', 'Thank you. Our team will review it.'); } },
      { text: 'Spam', onPress: () => { report(id); Alert.alert('Reported', 'Thank you.'); } },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.ink }}>
      <LinearGradient colors={[Colors.ink, '#000']} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>STORIES</Text>
          <Text style={styles.subtitle}>GEO-VERIFIED · DISAPPEAR AT 6AM</Text>
          <TouchableOpacity style={styles.postBtn} onPress={() => setShowUpload(true)}>
            <Text style={styles.postBtnText}>+ POST</Text>
          </TouchableOpacity>
        </View>

        {cityStories.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🌙</Text>
            <Text style={styles.emptyTitle}>NO STORIES YET</Text>
            <Text style={styles.emptyBody}>Be the first to post from a venue in {selectedCityId.toUpperCase()} tonight.</Text>
          </View>
        ) : (
          cityStories.map(s => (
            <StoryCard key={s.id} story={s} onReport={handleReport} />
          ))
        )}
      </ScrollView>

      <Modal
        visible={showUpload}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowUpload(false)}
      >
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={modal.root}>
          <LinearGradient colors={['#12001a', '#000']} style={StyleSheet.absoluteFill} />
          <Text style={modal.title}>POST STORY</Text>
          <Text style={modal.label}>VENUE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={modal.venueScroll}>
            {cityVenues.map(v => (
              <TouchableOpacity
                key={v.id}
                style={[modal.venueChip, selectedVenueId === v.id && modal.venueChipActive]}
                onPress={() => setSelectedVenueId(v.id)}
              >
                <Text style={[modal.venueChipText, selectedVenueId === v.id && { color: Colors.ink }]}>
                  {v.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={modal.label}>VIDEO (MAX 30s)</Text>
          <TouchableOpacity style={modal.videoPick} onPress={handlePickVideo}>
            <Text style={modal.videoPickText}>{videoUri ? '✓ VIDEO SELECTED' : 'SELECT VIDEO'}</Text>
          </TouchableOpacity>

          <Text style={modal.label}>CAPTION (OPTIONAL)</Text>
          <TextInput
            style={modal.input}
            value={caption}
            onChangeText={setCaption}
            placeholder="What's the vibe?"
            placeholderTextColor={Colors.textMuted}
            maxLength={120}
            multiline
          />
          <Text style={modal.charCount}>{120 - caption.length} CHARS LEFT</Text>

          <View style={modal.geoNote}>
            <Text style={modal.geoNoteText}>📍 Your location will be checked to verify you're at the venue (within 300m). Location is NOT stored.</Text>
          </View>

          <TouchableOpacity
            style={[modal.submitBtn, uploading && { opacity: 0.5 }]}
            onPress={handlePost}
            disabled={uploading}
          >
            {uploading
              ? <ActivityIndicator color={Colors.ink} />
              : <Text style={modal.submitBtnText}>POST TO STORIES</Text>
            }
          </TouchableOpacity>
          <TouchableOpacity style={modal.cancelBtn} onPress={() => setShowUpload(false)}>
            <Text style={modal.cancelText}>CANCEL</Text>
          </TouchableOpacity>
        </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  content:     { paddingHorizontal: Spacing.xl, paddingTop: 60, paddingBottom: 120, gap: Spacing.xl },
  header:      { gap: Spacing.sm },
  title:       { ...Type.sectionHead, color: Colors.textPrimary },
  subtitle:    { ...Type.tag, color: Colors.textMuted },
  postBtn:     { alignSelf: 'flex-start', backgroundColor: Colors.gold, borderRadius: Radius.full, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm, marginTop: Spacing.sm },
  postBtnText: { ...Type.button, color: Colors.ink },
  empty:       { alignItems: 'center', gap: Spacing.md, paddingTop: 60 },
  emptyEmoji:  { fontSize: 48 },
  emptyTitle:  { ...Type.sectionHead, color: Colors.textPrimary },
  emptyBody:   { ...Type.body, color: Colors.textMuted, textAlign: 'center' },
});

const card = StyleSheet.create({
  root:        { borderRadius: Radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  bg:          { ...StyleSheet.absoluteFillObject },
  topRow:      { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg },
  avatar:      { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.heroPurple, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.gold + '55' },
  avatarText:  { ...Type.label, color: Colors.gold },
  name:        { ...Type.bodyMedium, color: Colors.textPrimary },
  venue:       { ...Type.tag, color: Colors.gold },
  metaCol:     { alignItems: 'flex-end', gap: 4 },
  geoBadge:    { backgroundColor: Colors.green + '22', borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: Colors.green + '55' },
  geoText:     { ...Type.caption, color: Colors.green, fontSize: 9 },
  expires:     { ...Type.caption, color: Colors.textMuted },
  caption:     { ...Type.body, color: Colors.textSecondary, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
  videoPlaceholder: { height: 200, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  playIcon:    { fontSize: 40, color: Colors.textMuted },
  videoHint:   { ...Type.tag, color: Colors.textMuted },
  reportBtn:   { padding: Spacing.md, alignItems: 'flex-end' },
  reportText:  { ...Type.caption, color: 'rgba(255,255,255,0.25)' },
});

const modal = StyleSheet.create({
  root:          { flex: 1, paddingHorizontal: Spacing.xl, paddingTop: 50, gap: Spacing.lg },
  title:         { ...Type.sectionHead, color: Colors.textPrimary },
  label:         { ...Type.tag, color: Colors.textMuted },
  venueScroll:   { flexGrow: 0, marginBottom: Spacing.sm },
  venueChip:     { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.full, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', marginRight: 8 },
  venueChipActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  venueChipText: { ...Type.tag, color: Colors.textSecondary },
  videoPick:     { borderWidth: 1, borderColor: Colors.gold + '66', borderRadius: Radius.lg, padding: Spacing.lg, alignItems: 'center', borderStyle: 'dashed' },
  videoPickText: { ...Type.label, color: Colors.gold },
  input:         { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: Radius.lg, padding: Spacing.lg, color: Colors.textPrimary, ...Type.body, minHeight: 80 },
  charCount:     { ...Type.caption, color: Colors.textMuted, textAlign: 'right' },
  geoNote:       { backgroundColor: 'rgba(48,209,88,0.08)', borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.green + '33' },
  geoNoteText:   { ...Type.caption, color: Colors.green, lineHeight: 16 },
  submitBtn:     { backgroundColor: Colors.gold, borderRadius: Radius.xl, padding: Spacing.xl, alignItems: 'center' },
  submitBtnText: { ...Type.button, color: Colors.ink },
  cancelBtn:     { alignItems: 'center', padding: Spacing.lg },
  cancelText:    { ...Type.label, color: Colors.textMuted },
});

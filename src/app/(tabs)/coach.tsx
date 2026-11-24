import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Screen } from '@/components/screen';
import { useCleanups } from '@/state/cleanup-context';
import { colors } from '@/theme/colors';
import type { CleanupArea } from '@/types/cleanup';

type ChatMessage = { id: number; role: 'user' | 'assistant'; text: string };

function center(area: CleanupArea) {
  const points = area.coordinates ?? [];
  if (!points.length) return [0, 0] as const;
  return [points.reduce((sum, point) => sum + point[0], 0) / points.length, points.reduce((sum, point) => sum + point[1], 0) / points.length] as const;
}

function expansionOpportunities(areas: CleanupArea[], ownerId: string) {
  const ownedCenters = areas.filter((area) => area.ownerId === ownerId).map(center);
  return areas
    .filter((area) => area.ownerId !== ownerId)
    .map((area) => {
      const [lat, lon] = center(area);
      const proximity = Math.min(...ownedCenters.map(([ownedLat, ownedLon]) => (lat - ownedLat) ** 2 + (lon - ownedLon) ** 2));
      return { area, proximity };
    })
    .sort((a, b) => a.proximity - b.proximity)
    .slice(0, 10)
    .map(({ area }) => ({ name: area.name, distance: area.distance, owner: area.ownerName ?? 'Unclaimed' }));
}

export default function CoachScreen() {
  const { areas, currentPersona, leaderboard, myCleanups } = useCleanups();
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, role: 'assistant', text: `Hi ${currentPersona.name.split(' ')[0]}! I can review your territory, find nearby expansion opportunities, or size up the friendly competition.` },
  ]);

  const snapshot = useMemo(() => {
    const player = leaderboard.find((entry) => entry.id === currentPersona.id)!;
    return {
      player: {
        name: player.name,
        blocks: player.blocks,
        points: player.points,
        rank: leaderboard.findIndex((entry) => entry.id === player.id) + 1,
        miles: Number(myCleanups.reduce((total, area) => total + Number.parseFloat(area.distance), 0).toFixed(1)),
      },
      competitors: leaderboard.filter((entry) => entry.id !== player.id).map(({ name, blocks, points }) => ({ name, blocks, points })),
      opportunities: expansionOpportunities(areas, player.id),
    };
  }, [areas, currentPersona.id, leaderboard, myCleanups]);

  const askCoach = async (prompt = question) => {
    const trimmed = prompt.trim();
    if (!trimmed || loading) return;
    const userMessage: ChatMessage = { id: Date.now(), role: 'user', text: trimmed };
    setMessages((current) => [...current, userMessage]);
    setQuestion('');
    setLoading(true);

    try {
      const configuredBase = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') ?? '';
      if (Platform.OS !== 'web' && !configuredBase) throw new Error('Set EXPO_PUBLIC_API_URL for the native app.');
      const response = await fetch(`${configuredBase}/api/territory-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmed, ...snapshot }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'The coach is unavailable.');
      setMessages((current) => [...current, { id: Date.now() + 1, role: 'assistant', text: data.reply }]);
    } catch (error) {
      setMessages((current) => [...current, {
        id: Date.now() + 1,
        role: 'assistant',
        text: error instanceof Error ? error.message : 'The coach is unavailable right now.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen contentStyle={styles.screen}>
      <View>
        <Text style={styles.eyebrow}>AI TERRITORY COACH</Text>
        <Text style={styles.title}>Plan your next cleanup</Text>
        <Text style={styles.subtitle}>Strategy based on your current mock territory and leaderboard.</Text>
      </View>

      <View style={styles.quickActions}>
        {quickPrompts.map((prompt) => (
          <Pressable key={prompt} style={styles.quickButton} onPress={() => void askCoach(prompt)} disabled={loading}>
            <Text style={styles.quickText}>{prompt}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.chat}>
        {messages.map((message) => (
          <View key={message.id} style={[styles.bubble, message.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
            <Text style={[styles.bubbleText, message.role === 'user' && styles.userText]}>{message.text}</Text>
          </View>
        ))}
        {loading && <Text style={styles.thinking}>Reviewing the map…</Text>}
      </View>

      <View style={styles.composer}>
        <TextInput
          value={question}
          onChangeText={setQuestion}
          placeholder="Ask about territory or competition…"
          placeholderTextColor={colors.muted}
          style={styles.input}
          maxLength={500}
          multiline
          editable={!loading}
          onSubmitEditing={() => void askCoach()}
        />
        <Pressable style={[styles.sendButton, (!question.trim() || loading) && styles.disabled]} onPress={() => void askCoach()} disabled={!question.trim() || loading}>
          <Text style={styles.sendText}>Ask coach</Text>
        </Pressable>
      </View>
      <Text style={styles.disclaimer}>AI advice may be inaccurate. It cannot verify cleanup photos or guarantee street conditions.</Text>
    </Screen>
  );
}

const quickPrompts = ['Review my territory', 'Where should I expand?', 'How is the competition?'];

const styles = StyleSheet.create({
  screen: { paddingBottom: 30 },
  eyebrow: { color: colors.primary, fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  title: { color: colors.ink, fontSize: 29, fontWeight: '800', marginTop: 5 },
  subtitle: { color: colors.muted, marginTop: 5, lineHeight: 20 },
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  quickButton: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 16, borderWidth: 1, borderColor: colors.primary, backgroundColor: '#F3FAF6' },
  quickText: { color: colors.primaryDark, fontSize: 12, fontWeight: '700' },
  chat: { minHeight: 260, padding: 13, borderRadius: 20, backgroundColor: '#E9EFEA', gap: 10 },
  bubble: { maxWidth: '88%', paddingHorizontal: 14, paddingVertical: 11, borderRadius: 16 },
  assistantBubble: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderBottomLeftRadius: 5 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: colors.primary, borderBottomRightRadius: 5 },
  bubbleText: { color: colors.ink, lineHeight: 20 },
  userText: { color: '#FFFFFF' },
  thinking: { color: colors.muted, fontSize: 12, fontStyle: 'italic' },
  composer: { gap: 9 },
  input: { minHeight: 78, padding: 13, borderRadius: 15, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, color: colors.ink, textAlignVertical: 'top' },
  sendButton: { alignItems: 'center', paddingVertical: 13, borderRadius: 13, backgroundColor: colors.primary },
  disabled: { opacity: 0.45 },
  sendText: { color: '#FFFFFF', fontWeight: '800' },
  disclaimer: { color: colors.muted, fontSize: 11, lineHeight: 16, textAlign: 'center' },
});

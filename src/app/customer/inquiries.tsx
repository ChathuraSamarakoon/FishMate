import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { CustomerShell } from '@/components/customer/CustomerShell';
import { CustomerIcon } from '@/components/customer/Icon';
import { InquiryCard, InquiryNotice } from '@/components/customer/InquiryUI';
import { useMarketplace, type InquiryStatus } from '@/components/customer/MarketplaceContext';
import { customerUi as c } from '@/components/customer/theme';
import { getFishermanById, getListingById } from '@/data/mockData';
import { filterInquiries } from '@/utils/inquiryUtils';

type Filter = 'all' | InquiryStatus;
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All inquiries' },
  { key: 'pending', label: 'Pending' },
  { key: 'responded', label: 'Responded' },
  { key: 'closed', label: 'Closed' },
];

export default function CustomerInquiriesScreen() {
  const { inquiries } = useMarketplace();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const counts = useMemo(() => ({
    pending: inquiries.filter(item => item.status === 'pending').length,
    responded: inquiries.filter(item => item.status === 'responded').length,
    closed: inquiries.filter(item => item.status === 'closed').length,
  }), [inquiries]);

  const filtered = useMemo(() => {
    const base = filterInquiries(inquiries, filter, '');
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter((item) => {
      const seller = getFishermanById(item.sellerId);
      const listing = item.listingId ? getListingById(item.listingId) : undefined;
      return `${item.id} ${item.message} ${seller?.name ?? ''} ${seller?.village ?? ''} ${listing?.name ?? ''}`.toLowerCase().includes(q);
    });
  }, [inquiries, filter, query]);

  return <CustomerShell title="My inquiries" subtitle="C06 · Messages and connection history" rightIcon="search" rightLabel="Explore fresh catches" onRightPress={() => router.push('/customer/search')}>
    <View style={styles.hero}>
      <View style={styles.heroGlow}/>
      <View style={styles.heroTop}>
        <View><Text style={styles.eyebrow}>YOUR FISHMATE CONNECTIONS</Text><Text style={styles.headline}>Every question, in one place.</Text></View>
        <View style={styles.countBadge}><Text style={styles.countText}>{inquiries.length}</Text><Text style={styles.countSub}>total</Text></View>
      </View>
      <Text style={styles.heroHelp}>Track requests, view seller information, and revisit earlier conversations.</Text>
    </View>

    <InquiryNotice />
    <View style={styles.statRow}>
      <View style={styles.stat}><Text style={[styles.statValue, { color: '#A86A18' }]}>{counts.pending}</Text><Text style={styles.statName}>Pending</Text></View>
      <View style={styles.stat}><Text style={[styles.statValue, { color: '#168D6B' }]}>{counts.responded}</Text><Text style={styles.statName}>Responded</Text></View>
      <View style={styles.stat}><Text style={styles.statValue}>{counts.closed}</Text><Text style={styles.statName}>Closed</Text></View>
    </View>

    <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Inquiry history</Text><Text style={styles.resultLabel}>{filtered.length} shown</Text></View>
    <View style={styles.searchBar}>
      <CustomerIcon name="search" size={19} color={c.tealDark}/>
      <TextInput
        value={query} onChangeText={setQuery}
        placeholder="Search seller, fish or message..."
        placeholderTextColor="#96ACB0"
        accessibilityLabel="Search inquiries"
        style={styles.searchInput}
      />
      {query.length > 0 ? <Pressable onPress={() => setQuery('')} accessibilityRole="button" accessibilityLabel="Clear inquiry search"><Text style={styles.clear}>✕</Text></Pressable> : null}
    </View>

    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
      {FILTERS.map(item => <Pressable
        key={item.key} accessibilityRole="button" accessibilityState={{ selected: filter === item.key }}
        onPress={() => setFilter(item.key)}
        style={[styles.chip, filter === item.key && styles.chipSelected]}
      ><Text style={[styles.chipText, filter === item.key && styles.chipTextSelected]}>{item.label}</Text></Pressable>)}
    </ScrollView>

    {filtered.length ? filtered.map((entry) => <InquiryCard key={entry.id} inquiry={entry}/>) : (
      <View style={styles.empty}>
        <View style={styles.emptyIcon}><CustomerIcon name="message" size={32} color={c.tealDark}/></View>
        <Text style={styles.emptyTitle}>{inquiries.length === 0 ? 'No inquiries yet' : 'Nothing matches this filter'}</Text>
        <Text style={styles.emptyText}>{inquiries.length === 0 ? 'Find a fresh catch and connect with the fisherman to start a request.' : 'Try another status or clear your search to see more inquiries.'}</Text>
        <Pressable onPress={() => { if (inquiries.length === 0) router.push('/customer/search'); else { setFilter('all'); setQuery(''); } }} style={styles.emptyAction}><Text style={styles.emptyActionText}>{inquiries.length === 0 ? 'Browse fresh fish' : 'Show all inquiries'}</Text></Pressable>
      </View>
    )}
    <Pressable accessibilityRole="button" onPress={() => router.push('/customer/search')} style={styles.newButton}>
      <CustomerIcon name="plus" color="#FFFFFF" size={19}/><Text style={styles.newButtonText}>Start a new inquiry</Text>
    </Pressable>
    <Text style={styles.footnote}>Sample records are included to demonstrate the filters and response states. New requests are kept in app memory only.</Text>
  </CustomerShell>;
}

const styles=StyleSheet.create({
  hero: { marginTop: 4, padding: 20, borderRadius: 27, backgroundColor: '#0A7280', overflow: 'hidden' },
  heroGlow: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: '#1496A4', right: -65, top: -65 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  eyebrow: { color: '#D6FBF6', fontWeight: '900', fontSize: 9, letterSpacing: 1.4 },
  headline: { maxWidth: 245, fontSize: 24, lineHeight: 29, color: '#FFFFFF', fontWeight: '900', marginTop: 9 },
  countBadge: { width: 65, height: 65, backgroundColor: 'rgba(255,255,255,.20)', borderWidth: 1, borderColor: 'rgba(255,255,255,.35)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  countText: { color: '#FFFFFF', fontSize: 24, fontWeight: '900' },
  countSub: { color: '#E6FEFC', fontSize: 10 },
  heroHelp: { marginTop: 11, color: '#E2F9F6', fontSize: 11, lineHeight: 17, maxWidth: 285 },
  statRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  stat: { flex: 1, backgroundColor: c.surface, borderRadius: 19, borderWidth: 1, borderColor: c.border, padding: 13, alignItems: 'center' },
  statValue: { color: c.navy, fontSize: 21, fontWeight: '900' },
  statName: { color: c.muted, fontSize: 10, fontWeight: '800', marginTop: 5 },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 13 },
  sectionTitle: { color: c.navy, fontSize: 19, fontWeight: '900' },
  resultLabel: { fontSize: 11, fontWeight: '800', color: c.tealDark },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, height: 52, borderRadius: 16, paddingHorizontal: 14 },
  searchInput: { flex: 1, fontSize: 13, color: c.navy },
  clear: { color: c.muted, fontSize: 15, padding: 8 },
  filters: { paddingVertical: 16, gap: 8, paddingRight: 20 },
  chip: { borderRadius: 18, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface, paddingVertical: 10, paddingHorizontal: 14 },
  chipSelected: { borderColor: c.teal, backgroundColor: c.teal },
  chipText: { fontSize: 11, color: c.navy, fontWeight: '800' },
  chipTextSelected: { color: '#FFFFFF' },
  empty: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 24, padding: 30, alignItems: 'center' },
  emptyIcon: { backgroundColor: c.soft, borderRadius: 25, width: 72, height: 72, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: c.navy, fontSize: 17, fontWeight: '900', marginTop: 16 },
  emptyText: { color: c.muted, fontSize: 12, lineHeight: 19, textAlign: 'center', marginTop: 9 },
  emptyAction: { backgroundColor: c.soft, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 17, marginTop: 18 },
  emptyActionText: { color: c.tealDark, fontSize: 12, fontWeight: '900' },
  newButton: { backgroundColor: c.teal, borderRadius: 17, height: 54, marginTop: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  newButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  footnote: { color: c.muted, fontSize: 10, lineHeight: 16, textAlign: 'center', marginTop: 18 },
});

import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import type { DemoInquiry, InquiryStatus } from './MarketplaceContext';
import { CustomerIcon } from './Icon';
import { customerUi as c } from './theme';
import { getFishermanById, getListingById } from '@/data/mockData';
import { formatInquiryDate, formatInquiryTime, inquiryStatusLabels } from '@/utils/inquiryUtils';

const pillStyles: Record<InquiryStatus, { bg: string; fg: string; dot: string }> = {
  pending: { bg: '#FFF5DE', fg: '#8D6317', dot: '#E6AC40' },
  responded: { bg: '#E2F8EF', fg: '#14805B', dot: '#2BBA85' },
  closed: { bg: '#EDF2F4', fg: '#647B87', dot: '#8FA5AD' },
};

export function InquiryStatusPill({ status }: { status: InquiryStatus }) {
  const palette = pillStyles[status];
  return <View style={[styles.statusPill, { backgroundColor: palette.bg }]}>
    <View style={[styles.statusDot, { backgroundColor: palette.dot }]} />
    <Text style={[styles.statusText, { color: palette.fg }]}>{inquiryStatusLabels[status]}</Text>
  </View>;
}

export function InquiryNotice({ compact = false }: { compact?: boolean }) {
  return <View style={[styles.notice, compact && { marginTop: 6 }]}>
    <CustomerIcon name="sparkles" color={c.tealDark} size={18} />
    <Text style={styles.noticeText}>Prototype only. Inquiries and replies here are <Text style={{ fontWeight: '900' }}>local demo records</Text> — nothing is sent to a real fisherman.</Text>
  </View>;
}

export function InquiryCard({ inquiry }: { inquiry: DemoInquiry }) {
  const seller = getFishermanById(inquiry.sellerId);
  const listing = inquiry.listingId ? getListingById(inquiry.listingId) : undefined;
  return <Pressable
    accessibilityRole="button"
    accessibilityLabel={`Open inquiry with ${seller?.name ?? 'seller'}; status ${inquiryStatusLabels[inquiry.status]}`}
    onPress={() => router.push({ pathname: '/customer/inquiry/[id]', params: { id: inquiry.id } })}
    style={({ pressed }) => [styles.card, pressed && { opacity: .92, transform: [{ scale: .993 }] }]}
  >
    <View style={styles.cardTop}>
      {seller ? <Image source={seller.avatar} style={styles.avatar} resizeMode="cover"/> : <View style={styles.avatar}/>}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.name} numberOfLines={1}>{seller?.name ?? 'Unknown fisherman'}</Text>
        <Text style={styles.location} numberOfLines={1}>{seller?.village ?? 'Fishing community'}</Text>
      </View>
      <InquiryStatusPill status={inquiry.status}/>
    </View>
    <View style={styles.divider}/>
    <View style={styles.productRow}>
      {listing ? <Image source={listing.image} style={styles.thumb} resizeMode="cover" /> : <View style={styles.thumbIcon}><CustomerIcon name="message" color={c.tealDark} size={21}/></View>}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.productTitle} numberOfLines={1}>{listing?.name ?? 'General fishing inquiry'}</Text>
        <Text style={styles.productMeta}>{inquiry.requestedKg ? `${inquiry.requestedKg} kg requested · ` : ''}{formatInquiryDate(inquiry.createdAt)}</Text>
      </View>
      <CustomerIcon name="chevron-right" size={17} color={c.tealDark}/>
    </View>
    <Text style={styles.message} numberOfLines={2}>{inquiry.message}</Text>
    <View style={styles.cardFooter}>
      <Text style={styles.time}>{formatInquiryTime(inquiry.createdAt)}{inquiry.isSample ? ' · Sample' : ' · Your demo entry'}</Text>
      <Text style={styles.view}>View details  ›</Text>
    </View>
  </Pressable>;
}

const styles = StyleSheet.create({
  statusPill: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 5 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '900' },
  notice: { marginTop: 10, flexDirection: 'row', gap: 10, padding: 14, backgroundColor: '#EAF7F5', borderRadius: 17, borderWidth: 1, borderColor: '#CFE9E4' },
  noticeText: { fontSize: 11, lineHeight: 18, color: c.muted, flex: 1 },
  card: { backgroundColor: c.surface, borderRadius: 24, borderWidth: 1, borderColor: c.border, padding: 15, marginBottom: 13, shadowColor: c.shadow, shadowOpacity: .035, shadowRadius: 9, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  avatar: { width: 47, height: 47, borderRadius: 15, backgroundColor: c.soft },
  name: { fontSize: 14, fontWeight: '900', color: c.navy },
  location: { fontSize: 11, color: c.muted, marginTop: 4 },
  divider: { backgroundColor: '#EAF2F2', height: 1, marginTop: 13, marginBottom: 13 },
  productRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  thumb: { width: 50, height: 50, borderRadius: 14 },
  thumbIcon: { width: 50, height: 50, backgroundColor: c.soft, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  productTitle: { color: c.navy, fontSize: 13, fontWeight: '900' },
  productMeta: { color: c.muted, fontSize: 11, marginTop: 5 },
  message: { color: c.muted, fontSize: 12, lineHeight: 19, marginTop: 13 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 13 },
  time: { color: '#90A3A9', fontSize: 10 },
  view: { color: c.tealDark, fontWeight: '900', fontSize: 11 },
});

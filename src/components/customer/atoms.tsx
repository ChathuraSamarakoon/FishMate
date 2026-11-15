import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { CustomerIcon } from './Icon';
import { customerUi } from './theme';
import type { FishListing, FishermanProfile } from '@/types';

export function money(n: number) { return `Rs. ${n.toLocaleString('en-US')}`; }

export function SectionHeader({ title, subtitle, actionText, onAction }: { title: string; subtitle?: string; actionText?: string; onAction?: () => void }) {
  return <View style={styles.sectionHeader}>
    <View style={{ flex: 1 }}><Text style={styles.sectionTitle}>{title}</Text>{subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}</View>
    {actionText ? <Pressable accessibilityRole="button" onPress={onAction} style={styles.seeAll}><Text style={styles.seeAllText}>{actionText}</Text><CustomerIcon name="chevron-right" size={15} color={customerUi.tealDark}/></Pressable> : null}
  </View>;
}

export function CategoryChip({ icon, label, selected, onPress }: { icon: string; label: string; selected?: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
    <Text style={[styles.chipIcon, selected && styles.chipTextSelected]}>{icon}</Text>
    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
  </Pressable>;
}

export function FishCard({ item, onPress, variant = 'featured' }: { item: FishListing; onPress: () => void; variant?: 'featured' | 'row' }) {
  const row = variant === 'row';
  return <Pressable accessibilityRole="button" accessibilityLabel={`View ${item.name}, ${money(item.price)} per kg`} onPress={onPress} style={[styles.fishCard, row && styles.rowCard]}>
    <View style={[styles.fishImageWrap, row && styles.rowImgWrap]}>
      <Image source={item.image} style={styles.fishImage} resizeMode="cover" />
      {!row ? <View style={styles.imageBadge}><Text style={styles.imageBadgeText}>Fresh catch</Text></View> : null}
    </View>
    <View style={[styles.fishBody, row && styles.rowBody]}>
      <View style={styles.titleRow}><Text numberOfLines={1} style={styles.fishName}>{item.name}</Text><Text style={styles.rating}>★ {item.rating.toFixed(1)}</Text></View>
      <Text numberOfLines={row ? 1 : 2} style={styles.fishDesc}>{item.shortDescription}</Text>
      <View style={styles.locRow}><CustomerIcon name="pin" size={13} color={customerUi.muted}/><Text style={styles.locText}>{item.location}  ·  {item.stockLabel}</Text></View>
      <View style={styles.fishFooter}><Text style={styles.price}>{money(item.price)} <Text style={styles.per}>/ kg</Text></Text><View style={styles.arrow}><CustomerIcon name="chevron-right" size={18} color={customerUi.tealDark}/></View></View>
    </View>
  </Pressable>;
}

export function SellerCard({ seller, onPress, compact = false }: { seller: FishermanProfile; onPress: () => void; compact?: boolean }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={[styles.sellerCard, compact && styles.sellerCompact]}>
    <Image source={seller.avatar} style={styles.sellerAvatar} />
    <View style={{ flex: 1 }}><Text style={styles.sellerName}>{seller.name}</Text><Text numberOfLines={1} style={styles.sellerLocation}>{seller.village}</Text><Text style={styles.sellerTag}>Local fisherman · {seller.deliveryRadius}</Text></View>
    <View style={styles.ratingPill}><Text style={styles.ratingPillText}>★ {seller.rating.toFixed(1)}</Text></View>
  </Pressable>;
}

export function StatCard({ label, value, icon }: { label: string; value: string; icon?: 'clock' | 'pin' | 'bag' | 'check' }) {
  return <View style={styles.stat}><View style={styles.statTitleRow}>{icon ? <CustomerIcon name={icon} size={17} color={customerUi.tealDark}/> : null}<Text style={styles.statLabel}>{label}</Text></View><Text numberOfLines={2} style={styles.statValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  sectionHeader: { marginTop: 27, marginBottom: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  sectionTitle: { fontSize: 19, fontWeight: '900', color: customerUi.navy, letterSpacing: -0.4 },
  sectionSubtitle: { color: customerUi.muted, marginTop: 3, fontSize: 11 },
  seeAll: { flexDirection: 'row', alignItems: 'center', gap: 1, padding: 7 },
  seeAllText: { fontSize: 12, fontWeight: '800', color: customerUi.tealDark },
  chip: { borderRadius: 16, borderWidth: 1, borderColor: customerUi.border, backgroundColor: customerUi.surface, paddingVertical: 10, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 6, marginRight: 8 },
  chipSelected: { backgroundColor: customerUi.teal, borderColor: customerUi.teal },
  chipIcon: { fontSize: 12, fontWeight: '900', color: customerUi.tealDark },
  chipText: { fontSize: 12, fontWeight: '700', color: customerUi.navy },
  chipTextSelected: { color: '#FFFFFF' },
  fishCard: { width: 260, marginRight: 13, backgroundColor: customerUi.surface, borderWidth: 1, borderColor: customerUi.border, borderRadius: 22, overflow: 'hidden', shadowColor: '#173E4B', shadowOpacity: .05, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
  fishImageWrap: { height: 152, position: 'relative', overflow: 'hidden' },
  fishImage: { width: '100%', height: '100%' },
  imageBadge: { position: 'absolute', left: 11, top: 11, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 20, backgroundColor: '#E9FBF4' },
  imageBadgeText: { color: customerUi.tealDark, fontSize: 10, fontWeight: '800' },
  fishBody: { padding: 14 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'space-between' },
  fishName: { flex: 1, fontSize: 15, fontWeight: '900', color: customerUi.navy },
  rating: { fontSize: 11, fontWeight: '900', color: '#B27508' },
  fishDesc: { fontSize: 11, lineHeight: 16, color: customerUi.muted, marginTop: 5, minHeight: 16 },
  locRow: { flexDirection: 'row', alignItems: 'center', marginTop: 9, gap: 4 },
  locText: { color: customerUi.muted, fontSize: 10, flex: 1 },
  fishFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  price: { color: customerUi.navy, fontSize: 15, fontWeight: '900' },
  per: { color: customerUi.muted, fontSize: 10, fontWeight: '600' },
  arrow: { width: 29, height: 29, borderRadius: 10, backgroundColor: customerUi.soft, alignItems: 'center', justifyContent: 'center' },
  rowCard: { width: '100%', marginRight: 0, flexDirection: 'row', borderRadius: 20, marginBottom: 12 },
  rowImgWrap: { width: 121, height: 148 },
  rowBody: { flex: 1, padding: 12 },
  sellerCard: { backgroundColor: customerUi.surface, padding: 10, borderRadius: 20, borderWidth: 1, borderColor: customerUi.border, flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 10 },
  sellerCompact: { marginBottom: 0 },
  sellerAvatar: { width: 62, height: 62, borderRadius: 17 },
  sellerName: { color: customerUi.navy, fontSize: 14, fontWeight: '900' },
  sellerLocation: { color: customerUi.muted, marginTop: 4, fontSize: 11 },
  sellerTag: { color: customerUi.tealDark, marginTop: 5, fontSize: 10, fontWeight: '700' },
  ratingPill: { backgroundColor: '#FFF8E7', paddingVertical: 6, paddingHorizontal: 8, borderRadius: 10 },
  ratingPillText: { color: '#9E720A', fontSize: 11, fontWeight: '900' },
  stat: { flex: 1, minWidth: 0, padding: 13, borderRadius: 17, backgroundColor: customerUi.surface, borderWidth: 1, borderColor: customerUi.border, gap: 9 },
  statTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statLabel: { color: customerUi.muted, fontSize: 10, fontWeight: '700' },
  statValue: { color: customerUi.navy, fontSize: 13, fontWeight: '900' },
});

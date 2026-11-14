import { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { CustomerShell } from '@/components/customer/CustomerShell';
import { CustomerIcon } from '@/components/customer/Icon';
import { InquiryNotice } from '@/components/customer/InquiryUI';
import { useMarketplace } from '@/components/customer/MarketplaceContext';
import { customerUi as c } from '@/components/customer/theme';
import { getFishermanById, getListingById, getListingsBySellerId } from '@/data/mockData';
import { getSession } from '@/services/demoAuth';
import { validateInquiryKg, validateInquiryMessage } from '@/utils/inquiryUtils';

const suggestions = [
  'Is this catch still available?',
  'Can you arrange local delivery?',
  'Can you clean the fish before pickup?',
];

export default function ConnectWithFisherman() {
  const { sellerId, listingId, quantityKg } = useLocalSearchParams<{ sellerId?: string; listingId?: string; quantityKg?: string }>();
  const seller = getFishermanById(sellerId);
  const requestedListing = listingId ? getListingById(listingId) : undefined;
  const [selectedListingId, setSelectedListingId] = useState(() => requestedListing?.sellerId === sellerId ? requestedListing?.id ?? '' : '');
  const [kg, setKg] = useState(quantityKg ?? '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { createInquiry } = useMarketplace();
  const session = getSession();
  const listing = selectedListingId ? getListingById(selectedListingId) : undefined;
  const availableListings = useMemo(() => getListingsBySellerId(sellerId), [sellerId]);

  const submit = () => {
    if (!seller) return;
    const messageError = validateInquiryMessage(message);
    if (messageError) { setError(messageError); return; }
    const qtyError = validateInquiryKg(kg, listing?.availableKg);
    if (qtyError) { setError(qtyError); return; }
    setError('');
    const id = createInquiry({
      sellerId: seller.id,
      ...(selectedListingId ? { listingId: selectedListingId } : {}),
      ...(kg.trim() ? { requestedKg: Number(kg) } : {}),
      message: message.trim(),
    });
    router.replace({ pathname: '/customer/inquiry/[id]', params: { id, created: '1' } });
  };

  if (!seller) return <CustomerShell back title="Connect with fisherman" hideNavPadding>
    <Text style={styles.problem}>The selected seller could not be found in this demo.</Text>
    <Pressable onPress={() => router.replace('/customer/search')} style={styles.primary}><Text style={styles.primaryLabel}>Explore fish listings</Text></Pressable>
  </CustomerShell>;

  return <CustomerShell back title="Connect with fisherman" subtitle="C05 · Customer inquiry" hideNavPadding>
    <View style={styles.hero}>
      <View style={styles.heroTop}><Text style={styles.eyebrow}>DIRECT CONNECTION</Text><Text style={styles.heroSymbol}>✦</Text></View>
      <Text style={styles.heroTitle}>Ask about the catch.</Text>
      <Text style={styles.heroSubtitle}>Create an inquiry about the catch in a few simple steps.</Text>
      <View style={styles.sellerRow}>
        <Image source={seller.avatar} style={styles.avatar} resizeMode="cover" />
        <View style={{ flex: 1 }}><Text style={styles.sellerName}>{seller.name}</Text><Text style={styles.sellerLocation}>{seller.village}</Text></View>
        <View style={styles.sellerRating}><Text style={styles.ratingText}>★ {seller.rating.toFixed(1)}</Text></View>
      </View>
    </View>
    <InquiryNotice />

    <Text style={styles.sectionTitle}>1 · What are you interested in?</Text>
    <Text style={styles.sectionHint}>Select one of this seller's listings or make a general inquiry.</Text>
    <View style={styles.productOptions}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: selectedListingId === '' }}
        onPress={() => { setSelectedListingId(''); setKg(''); setError(''); }}
        style={[styles.option, !selectedListingId && styles.optionSelected]}
      >
        <View style={styles.generalIcon}><CustomerIcon name="message" color={c.tealDark} size={20}/></View>
        <View style={{ flex: 1 }}><Text style={styles.optionTitle}>General inquiry</Text><Text style={styles.optionSub}>Ask about all available fish</Text></View>
        <View style={[styles.radio, !selectedListingId && styles.radioOn]}/>
      </Pressable>
      {availableListings.map(item => <Pressable
        key={item.id}
        accessibilityRole="button"
        accessibilityState={{ selected: selectedListingId === item.id }}
        onPress={() => { setSelectedListingId(item.id); setKg(''); setError(''); }}
        style={[styles.option, selectedListingId === item.id && styles.optionSelected]}
      >
        <Image source={item.image} style={styles.optionPhoto} resizeMode="cover"/>
        <View style={{ flex: 1 }}><Text style={styles.optionTitle} numberOfLines={1}>{item.name}</Text><Text style={styles.optionSub}>Rs. {item.price.toLocaleString()}/kg · {item.availableKg} kg left</Text></View>
        <View style={[styles.radio, selectedListingId === item.id && styles.radioOn]}/>
      </Pressable>)}
    </View>

    <Text style={styles.sectionTitle}>2 · Add inquiry details</Text>
    <View style={styles.formCard}>
      <View style={styles.customerRow}><CustomerIcon name="user" color={c.tealDark} size={19}/><View style={{ flex: 1 }}><Text style={styles.fieldLabel}>YOUR DETAILS (DEMO ACCOUNT)</Text><Text style={styles.fieldValue}>{session?.fullName ?? 'Guest customer'}{session?.phone ? ` · ${session.phone}` : ''}</Text></View></View>
      {listing ? <>
        <Text style={styles.fieldLabel}>REQUESTED QUANTITY · OPTIONAL</Text>
        <View style={styles.quantityWrap}><TextInput value={kg} onChangeText={setKg} keyboardType="decimal-pad" placeholder="e.g. 1.5" placeholderTextColor="#96AAAD" accessibilityLabel="Requested quantity in kilograms" style={styles.quantityInput}/><Text style={styles.kgLabel}>kg</Text></View>
        <Text style={styles.fieldHelp}>Up to {listing.availableKg} kg · in 0.5 kg increments</Text>
      </> : null}
      <Text style={[styles.fieldLabel, { marginTop: 16 }]}>YOUR MESSAGE <Text style={{ color: c.danger }}>*</Text></Text>
      <View style={styles.suggestions}>
        {suggestions.map(prompt => <Pressable key={prompt} onPress={() => { setMessage(prompt); setError(''); }} style={styles.promptPill}><Text style={styles.promptText}>{prompt}</Text></Pressable>)}
      </View>
      <TextInput
        multiline
        numberOfLines={5}
        maxLength={500}
        value={message}
        onChangeText={(value) => { setMessage(value); if (error) setError(''); }}
        placeholder="Hi, I'd like to know if this fish is available. Can you share pickup or delivery details?"
        placeholderTextColor="#9AAFB5"
        textAlignVertical="top"
        accessibilityLabel="Inquiry message"
        style={styles.textArea}
      />
      <Text style={styles.counter}>{message.length}/500 characters</Text>
      {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    </View>
    <View style={styles.tipRow}><CustomerIcon name="check" color={c.tealDark} size={17}/><Text style={styles.tip}>This demo creates an inquiry record with Pending status. No real SMS, email or chat message is sent.</Text></View>
    <Pressable accessibilityRole="button" onPress={submit} style={({ pressed }) => [styles.primary, pressed && { opacity: .87 }]}>
      <CustomerIcon name="message" color="#FFFFFF" size={19}/><Text style={styles.primaryLabel}>Save demo inquiry</Text><Text style={styles.arrow}>›</Text>
    </Pressable>
    <Pressable onPress={() => router.push('/customer/inquiries')} style={styles.secondary}><Text style={styles.secondaryLabel}>View my inquiries</Text></Pressable>
  </CustomerShell>;
}

const styles = StyleSheet.create({
  hero: { backgroundColor: '#0A7280', borderRadius: 27, padding: 20, marginTop: 5 },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { fontSize: 9, letterSpacing: 1.65, fontWeight: '900', color: '#D8FFFF' },
  heroSymbol: { fontSize: 23, color: '#B3F8F2' },
  heroTitle: { fontSize: 26, fontWeight: '900', color: '#FFFFFF', letterSpacing: -.7, marginTop: 8 },
  heroSubtitle: { fontSize: 12, color: '#DCFAF7', marginTop: 7, lineHeight: 19 },
  sellerRow: { backgroundColor: 'rgba(255,255,255,.13)', marginTop: 18, padding: 11, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 19 },
  avatar: { width: 50, height: 50, borderRadius: 16 },
  sellerName: { fontWeight: '900', color: '#FFFFFF', fontSize: 14 },
  sellerLocation: { color: '#E5FDF8', marginTop: 4, fontSize: 11 },
  sellerRating: { borderRadius: 12, padding: 8, backgroundColor: 'rgba(255,255,255,.19)' },
  ratingText: { color: '#FFFFFF', fontWeight: '900', fontSize: 11 },
  sectionTitle: { marginTop: 25, fontSize: 17, fontWeight: '900', color: c.navy },
  sectionHint: { fontSize: 11, color: c.muted, marginTop: 5, lineHeight: 17 },
  productOptions: { gap: 9, marginTop: 13 },
  option: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, padding: 10, borderRadius: 17, flexDirection: 'row', gap: 11, alignItems: 'center' },
  optionSelected: { borderColor: c.tealDark, backgroundColor: '#F0FBF8' },
  generalIcon: { width: 49, height: 49, borderRadius: 14, backgroundColor: c.soft, alignItems: 'center', justifyContent: 'center' },
  optionPhoto: { width: 49, height: 49, borderRadius: 14 },
  optionTitle: { color: c.navy, fontWeight: '900', fontSize: 12 },
  optionSub: { color: c.muted, fontSize: 10, marginTop: 5 },
  radio: { width: 18, height: 18, borderWidth: 2, borderColor: '#BCD0D4', borderRadius: 10 },
  radioOn: { borderColor: c.tealDark, backgroundColor: c.teal, borderWidth: 5 },
  formCard: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 24, padding: 17, marginTop: 13 },
  customerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: c.soft, padding: 12, borderRadius: 14, marginBottom: 17 },
  fieldLabel: { fontSize: 10, fontWeight: '900', color: c.navy, letterSpacing: 1.0, marginBottom: 9 },
  fieldValue: { fontSize: 12, fontWeight: '700', color: c.tealDark },
  quantityWrap: { height: 51, borderRadius: 14, borderColor: c.border, backgroundColor: c.bg, borderWidth: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13 },
  quantityInput: { flex: 1, fontSize: 15, color: c.navy },
  kgLabel: { color: c.muted, fontWeight: '800', fontSize: 13 },
  fieldHelp: { color: c.muted, fontSize: 10, marginTop: 7 },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 13 },
  promptPill: { backgroundColor: c.soft, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 10 },
  promptText: { color: c.tealDark, fontSize: 10, fontWeight: '800' },
  textArea: { minHeight: 122, borderRadius: 16, backgroundColor: c.bg, borderWidth: 1, borderColor: c.border, padding: 14, color: c.navy, fontSize: 13, lineHeight: 20 },
  counter: { color: c.muted, fontSize: 10, textAlign: 'right', marginTop: 8 },
  error: { backgroundColor: '#FFF0F0', borderRadius: 12, padding: 11, color: c.danger, fontSize: 12, fontWeight: '700', marginTop: 11 },
  tipRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', paddingVertical: 17 },
  tip: { flex: 1, color: c.muted, fontSize: 11, lineHeight: 18 },
  primary: { backgroundColor: c.teal, minHeight: 56, borderRadius: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 18 },
  primaryLabel: { color: '#FFFFFF', fontWeight: '900', fontSize: 14 },
  arrow: { color: '#FFFFFF', fontSize: 23, position: 'absolute', right: 16 },
  secondary: { alignItems: 'center', padding: 15 },
  secondaryLabel: { color: c.tealDark, fontWeight: '900', fontSize: 12 },
  problem: { color: c.muted, marginTop: 25, marginBottom: 22, fontSize: 13 },
});

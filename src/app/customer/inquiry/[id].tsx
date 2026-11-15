import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { CustomerShell } from '@/components/customer/CustomerShell';
import { CustomerIcon } from '@/components/customer/Icon';
import { InquiryNotice, InquiryStatusPill } from '@/components/customer/InquiryUI';
import { useMarketplace } from '@/components/customer/MarketplaceContext';
import { customerUi as c } from '@/components/customer/theme';
import { getFishermanById, getListingById } from '@/data/mockData';
import { formatInquiryDate, formatInquiryTime } from '@/utils/inquiryUtils';

export default function InquiryDetailsScreen() {
  const { id, created } = useLocalSearchParams<{ id?: string; created?: string }>();
  const { inquiries, changeInquiryStatus } = useMarketplace();
  const [confirmClose, setConfirmClose] = useState(false);
  const inquiry = inquiries.find(entry => entry.id === id);
  const seller = inquiry ? getFishermanById(inquiry.sellerId) : undefined;
  const listing = inquiry?.listingId ? getListingById(inquiry.listingId) : undefined;

  if (!inquiry) return <CustomerShell back title="Inquiry not found" subtitle="C07 · Inquiry details" hideNavPadding>
    <View style={styles.notFound}><CustomerIcon name="message" color={c.tealDark} size={32}/><Text style={styles.notFoundTitle}>Inquiry unavailable</Text><Text style={styles.notFoundText}>This request is not in the current demo session. New inquiries reset when the app is fully restarted.</Text></View>
    <Pressable onPress={() => router.replace('/customer/inquiries')} style={styles.primaryButton}><Text style={styles.buttonLabel}>Back to my inquiries</Text></Pressable>
  </CustomerShell>;

  return <CustomerShell back title="Inquiry details" subtitle="C07 · Connection history" hideNavPadding>
    {created === '1' ? <View style={styles.successBanner}><CustomerIcon name="check" color="#168B67" size={20}/><View style={{ flex: 1 }}><Text style={styles.successTitle}>Inquiry saved successfully</Text><Text style={styles.successCopy}>It's in your demo history, but no real message was sent.</Text></View></View> : null}
    <View style={styles.headingCard}>
      <View style={styles.headingTop}><Text style={styles.idText}>FISHMATE INQUIRY · {inquiry.isSample ? 'SAMPLE' : 'LOCAL DEMO'}</Text><InquiryStatusPill status={inquiry.status}/></View>
      <Text style={styles.headingTitle}>{listing?.name ?? 'General fishing inquiry'}</Text>
      <Text style={styles.headingSub}>Requested on {formatInquiryDate(inquiry.createdAt)} at {formatInquiryTime(inquiry.createdAt)}</Text>
      <View style={styles.ornament}/>
      <Text style={styles.refText}>Reference: {inquiry.id}</Text>
    </View>
    <InquiryNotice />

    <Text style={styles.sectionTitle}>Connected fisherman</Text>
    <Pressable onPress={() => seller && router.push(`/customer/fisherman/${seller.id}` as never)} style={styles.sellerCard}>
      {seller ? <Image source={seller.avatar} style={styles.sellerAvatar} resizeMode="cover" /> : <View style={styles.sellerAvatar}/>}
      <View style={{ flex: 1 }}><Text style={styles.sellerName}>{seller?.name ?? 'Unknown seller'}</Text><Text style={styles.sellerMeta}>{seller?.village ?? 'Fishing community'}</Text><Text style={styles.sellerHint}>View seller profile and fish listings</Text></View>
      <CustomerIcon name="chevron-right" color={c.tealDark} size={20}/>
    </Pressable>

    {listing ? <>
      <Text style={styles.sectionTitle}>Related fish listing</Text>
      <Pressable onPress={() => router.push(`/customer/listing/${listing.id}` as never)} style={styles.listingCard}>
        <Image source={listing.image} style={styles.listingImage} resizeMode="cover"/>
        <View style={{ flex: 1 }}><Text style={styles.listingName}>{listing.name}</Text><Text style={styles.listingInfo}>Rs. {listing.price.toLocaleString()} / kg</Text><Text style={styles.listingInfo}>{inquiry.requestedKg ? `${inquiry.requestedKg} kg requested` : 'Quantity not specified'}</Text></View>
        <CustomerIcon name="chevron-right" color={c.tealDark} size={20}/>
      </Pressable>
    </> : null}

    <Text style={styles.sectionTitle}>Inquiry timeline</Text>
    <View style={styles.timeline}>
      <View style={styles.timelineRow}><View style={styles.dotComplete}><CustomerIcon name="check" color="#FFFFFF" size={12}/></View><View style={styles.timelineText}><Text style={styles.timelineTitle}>Inquiry created in demo</Text><Text style={styles.timelineSub}>{formatInquiryDate(inquiry.createdAt)} · {formatInquiryTime(inquiry.createdAt)}</Text><Text style={styles.timelineSub}>Saved locally; not delivered to a seller</Text></View></View>
      {inquiry.demoReply ? <View style={styles.timelineRow}><View style={styles.dotComplete}><CustomerIcon name="check" color="#FFFFFF" size={12}/></View><View style={styles.timelineText}><Text style={styles.timelineTitle}>Sample seller response</Text><Text style={styles.timelineSub}>Illustrative reply · not a real conversation</Text></View></View> : null}
      {inquiry.status === 'closed' ? <View style={styles.timelineRow}><View style={styles.dotMuted}><CustomerIcon name="check" color="#FFFFFF" size={12}/></View><View style={styles.timelineText}><Text style={styles.timelineTitle}>Inquiry closed</Text><Text style={styles.timelineSub}>Closed within the prototype</Text></View></View> : null}
      {inquiry.status === 'pending' ? <View style={styles.timelineRow}><View style={styles.dotPending}/><View style={styles.timelineText}><Text style={styles.timelineTitle}>Pending (demo status)</Text><Text style={styles.timelineSub}>No live seller response is expected</Text></View></View> : null}
    </View>

    <Text style={styles.sectionTitle}>Your message</Text>
    <View style={styles.messageCard}><Text style={styles.eyebrow}>CUSTOMER · ORIGINAL INQUIRY</Text><Text style={styles.message}>{inquiry.message}</Text><Text style={styles.messageFoot}>{formatInquiryDate(inquiry.createdAt)}</Text></View>
    {inquiry.demoReply ? <View style={styles.replyCard}><View style={styles.replyTop}><CustomerIcon name="message" color={c.tealDark} size={18}/><Text style={styles.replyLabel}>SAMPLE SELLER REPLY</Text></View><Text style={styles.message}>{inquiry.demoReply}</Text><Text style={styles.replyDisclaimer}>This response was pre-written for demonstration only.</Text></View> : null}

    <Text style={styles.sectionTitle}>What would you like to do?</Text>
    <Pressable onPress={() => router.replace('/customer/inquiries')} style={styles.primaryButton}><CustomerIcon name="message" color="#FFFFFF" size={19}/><Text style={styles.buttonLabel}>Back to my inquiries</Text></Pressable>
    {seller ? <Pressable onPress={() => router.push({ pathname: '/customer/connect', params: { sellerId: seller.id, ...(listing ? { listingId: listing.id } : {}) } })} style={styles.secondaryButton}><CustomerIcon name="plus" color={c.tealDark} size={19}/><Text style={styles.secondaryLabel}>Ask another question</Text></Pressable> : null}
    {inquiry.status !== 'closed' ? (
      confirmClose ? <View style={styles.confirmCard}><Text style={styles.confirmTitle}>Close this inquiry?</Text><Text style={styles.confirmText}>This only changes its local demo status. It won't contact the seller.</Text><View style={styles.confirmActions}><Pressable onPress={() => setConfirmClose(false)} style={styles.cancelBtn}><Text style={styles.cancelText}>Cancel</Text></Pressable><Pressable onPress={() => { changeInquiryStatus(inquiry.id, 'closed'); setConfirmClose(false); }} style={styles.closeBtn}><Text style={styles.closeText}>Yes, close</Text></Pressable></View></View>
        : <Pressable onPress={() => setConfirmClose(true)} style={styles.textAction}><Text style={styles.textActionLabel}>Close inquiry</Text></Pressable>
    ) : <Pressable onPress={() => changeInquiryStatus(inquiry.id, 'pending')} style={styles.textAction}><Text style={styles.textActionLabel}>Reopen demo inquiry</Text></Pressable>}
    <Text style={styles.disclaimer}>FishMate frontend prototype · Records are stored in memory and reset after a full restart.</Text>
  </CustomerShell>;
}

const styles = StyleSheet.create({
  successBanner: { flexDirection: 'row', gap: 12, backgroundColor: '#E2F8EE', borderWidth: 1, borderColor: '#BCE6D4', borderRadius: 17, padding: 14, alignItems: 'flex-start', marginBottom: 12 },
  successTitle: { color: '#177A59', fontSize: 13, fontWeight: '900' },
  successCopy: { color: '#418D71', fontSize: 11, lineHeight: 17, marginTop: 3 },
  headingCard: { marginTop: 3, padding: 18, borderWidth: 1, borderColor: c.border, borderRadius: 26, backgroundColor: c.surface },
  headingTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  idText: { fontSize: 9, fontWeight: '900', letterSpacing: 1.0, color: c.tealDark, flex: 1 },
  headingTitle: { color: c.navy, fontSize: 24, fontWeight: '900', marginTop: 13 },
  headingSub: { color: c.muted, fontSize: 12, marginTop: 7 },
  ornament: { height: 1, backgroundColor: c.border, marginTop: 17, marginBottom: 12 },
  refText: { color: c.muted, fontSize: 10 },
  sectionTitle: { color: c.navy, fontSize: 17, fontWeight: '900', marginTop: 25, marginBottom: 12 },
  sellerCard: { borderRadius: 20, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 11 },
  sellerAvatar: { width: 61, height: 61, borderRadius: 18, backgroundColor: c.soft },
  sellerName: { color: c.navy, fontWeight: '900', fontSize: 14 },
  sellerMeta: { color: c.muted, fontSize: 11, marginTop: 4 },
  sellerHint: { color: c.tealDark, fontSize: 10, fontWeight: '800', marginTop: 6 },
  listingCard: { backgroundColor: c.surface, borderRadius: 19, borderColor: c.border, borderWidth: 1, padding: 10, flexDirection: 'row', gap: 12, alignItems: 'center' },
  listingImage: { width: 90, height: 78, borderRadius: 15 },
  listingName: { color: c.navy, fontWeight: '900', fontSize: 14 },
  listingInfo: { color: c.muted, fontSize: 11, marginTop: 6 },
  timeline: { backgroundColor: c.surface, borderRadius: 22, borderWidth: 1, borderColor: c.border, padding: 17, gap: 16 },
  timelineRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  dotComplete: { width: 25, height: 25, borderRadius: 14, backgroundColor: c.teal, alignItems: 'center', justifyContent: 'center' },
  dotMuted: { width: 25, height: 25, borderRadius: 14, backgroundColor: '#93A6AE', alignItems: 'center', justifyContent: 'center' },
  dotPending: { width: 25, height: 25, borderRadius: 14, borderWidth: 5, borderColor: '#F2C15E', backgroundColor: '#FFFCF4' },
  timelineText: { flex: 1 },
  timelineTitle: { color: c.navy, fontWeight: '900', fontSize: 12 },
  timelineSub: { color: c.muted, fontSize: 10, marginTop: 5, lineHeight: 16 },
  messageCard: { borderRadius: 20, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface, padding: 17 },
  eyebrow: { color: c.tealDark, fontSize: 9, fontWeight: '900', letterSpacing: 1.5 },
  message: { color: c.navy, lineHeight: 22, fontSize: 13, marginTop: 12 },
  messageFoot: { color: c.muted, fontSize: 10, marginTop: 12, textAlign: 'right' },
  replyCard: { borderWidth: 1, borderColor: '#C5E9E3', backgroundColor: '#ECFAF5', borderRadius: 20, padding: 17, marginTop: 13 },
  replyTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  replyLabel: { color: c.tealDark, fontSize: 10, letterSpacing: 1, fontWeight: '900' },
  replyDisclaimer: { color: c.muted, fontSize: 10, marginTop: 13, fontStyle: 'italic' },
  primaryButton: { backgroundColor: c.teal, borderRadius: 17, height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  buttonLabel: { color: '#FFFFFF', fontWeight: '900', fontSize: 13 },
  secondaryButton: { marginTop: 10, borderWidth: 1, borderColor: c.teal, borderRadius: 17, height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, backgroundColor: '#FFFFFF' },
  secondaryLabel: { color: c.tealDark, fontWeight: '900', fontSize: 13 },
  textAction: { marginTop: 17, alignItems: 'center', padding: 12 },
  textActionLabel: { color: c.muted, fontSize: 12, fontWeight: '800' },
  confirmCard: { marginTop: 16, borderWidth: 1, borderColor: '#F1CBD0', backgroundColor: '#FFF4F4', padding: 16, borderRadius: 20 },
  confirmTitle: { color: c.navy, fontSize: 14, fontWeight: '900' },
  confirmText: { color: c.muted, fontSize: 11, marginTop: 7, lineHeight: 17 },
  confirmActions: { flexDirection: 'row', gap: 10, marginTop: 15 },
  cancelBtn: { flex: 1, backgroundColor: c.surface, height: 41, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  cancelText: { color: c.navy, fontSize: 12, fontWeight: '900' },
  closeBtn: { flex: 1, backgroundColor: c.danger, height: 41, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  closeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  disclaimer: { color: c.muted, fontSize: 10, lineHeight: 16, textAlign: 'center', marginTop: 16 },
  notFound: { backgroundColor: c.surface, borderRadius: 22, padding: 26, alignItems: 'center', marginTop: 18 },
  notFoundTitle: { fontSize: 19, fontWeight: '900', color: c.navy, marginTop: 12 },
  notFoundText: { color: c.muted, fontSize: 12, textAlign: 'center', lineHeight: 19, marginTop: 9, marginBottom: 13 },
});

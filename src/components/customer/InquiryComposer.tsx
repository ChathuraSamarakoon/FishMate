import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useMarketplace } from './MarketplaceContext';
import { customerUi } from './theme';
import { getFishermanById, getListingById } from '@/data/mockData';

type Props = { sellerId: string; listingId?: string; visible: boolean; onClose: () => void };

/** An interactive draft only: it never contacts the seller or sends a real message. */
export function InquiryComposer({ sellerId, listingId, visible, onClose }: Props) {
  const { createInquiry } = useMarketplace();
  const seller = getFishermanById(sellerId);
  const listing = listingId ? getListingById(listingId) : undefined;
  const [text, setText] = useState('');
  useEffect(() => { if (visible) setText(listing ? `Hi, is ${listing.name} still available?` : 'Hi, I would like to know more about your available fish.'); }, [visible, listing?.id]);
  const save = () => {
    if (!text.trim()) { Alert.alert('Message required', 'Please enter an inquiry message.'); return; }
    createInquiry({ sellerId, message: text.trim(), listingId });
    onClose();
    Alert.alert('Saved in demo', 'This inquiry is saved locally in the prototype. No message has been sent to a fisherman.');
  };
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <KeyboardAvoidingView style={styles.cover} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Pressable style={styles.overlay} onPress={onClose}/>
      <View style={styles.sheet}>
        <View style={styles.handle}/>
        <Text style={styles.eyebrow}>CUSTOMER INQUIRY · DEMO</Text>
        <Text style={styles.title}>Connect with {seller?.name ?? 'the fisherman'}</Text>
        <Text style={styles.note}>Write your request below. This prototype saves it on this device only.</Text>
        {listing ? <Text style={styles.listing}>{listing.name} • Rs. {listing.price.toLocaleString()}/kg</Text> : null}
        <TextInput multiline maxLength={500} value={text} onChangeText={setText} style={styles.textarea} accessibilityLabel="Inquiry message" placeholder="Type a message" placeholderTextColor="#98A8AD" textAlignVertical="top"/>
        <Pressable style={styles.send} accessibilityRole="button" onPress={save}><Text style={styles.sendText}>Save demo inquiry</Text></Pressable>
        <Pressable style={styles.cancel} accessibilityRole="button" onPress={onClose}><Text style={styles.cancelText}>Cancel</Text></Pressable>
      </View>
    </KeyboardAvoidingView>
  </Modal>;
}
const styles=StyleSheet.create({
  cover: { flex:1, justifyContent:'flex-end' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(8,27,42,.45)' },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingBottom: 30, paddingTop: 14, backgroundColor: customerUi.surface },
  handle: { width: 44, height: 5, borderRadius: 4, backgroundColor: '#D6E7E5', alignSelf:'center', marginBottom: 22 },
  eyebrow: { fontSize: 10, color: customerUi.tealDark, fontWeight:'900', letterSpacing:1.7 },
  title: { fontSize: 23, color: customerUi.navy, fontWeight:'900', marginTop: 8 },
  note: { color: customerUi.muted, lineHeight:19, fontSize:12, marginTop:8 },
  listing: { color: customerUi.tealDark, fontWeight:'800', fontSize:12, marginTop:15 },
  textarea: { minHeight: 120, borderWidth: 1, borderColor: customerUi.border, backgroundColor: customerUi.bg, borderRadius: 18, padding: 14, fontSize: 14, color: customerUi.navy, marginTop: 15 },
  send: { backgroundColor: customerUi.teal, height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 17 },
  sendText: { color:'#FFFFFF', fontSize:14, fontWeight:'900' },
  cancel: { paddingVertical: 14, alignItems:'center' },
  cancelText: { color: customerUi.muted, fontSize:12, fontWeight:'700' },
});

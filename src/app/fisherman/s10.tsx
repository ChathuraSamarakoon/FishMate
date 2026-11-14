import { useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { FishermanShell } from '@/components/fisherman/FishermanShell';
import { FishermanIcon } from '@/components/fisherman/FishermanIcon';
import { money } from '@/components/fisherman/atoms';
import { fishermanUi as ui } from '@/components/fisherman/theme';
import { useFisherman } from '@/components/fisherman/FishermanContext';
import type { FishermanInquiryStatus } from '@/types';

const tuna = require('../../../assets/customer/tuna.jpg');

const TEMPLATE_REPLIES = [
  'Yes, landed this morning from Sagara Rani II. Fresh & chilled on ice!',
  'We can clean, gut, and portion into 1kg steak packs for you.',
  'Doorstep ice-box delivery is available within 15km of Negombo harbor (Rs. 250 fee).',
  'Will reserve your requested catch upon morning boat landing at pier gate 02.',
];

export default function S10InquiryDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { inquiries, listings, replyInquiry, updateInquiryStatus } = useFisherman();

  // Find inquiry (React hooks called unconditionally at top)
  const inquiry = inquiries.find((i) => i.id === id) || inquiries[0];

  const [replyText, setReplyText] = useState('');
  const [statusModalVisible, setStatusModalVisible] = useState(false);

  if (!inquiry) {
    return (
      <FishermanShell
        back
        title="S10 · Inquiry Not Found"
        subtitle="Buyer message unavailable"
        onBack={() => router.replace('/fisherman/s09')}
      >
        <View style={styles.notFoundCard}>
          <Text style={styles.notFoundTitle}>Inquiry Not Found</Text>
          <Text style={styles.notFoundSub}>This inquiry could not be found in your inbox.</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace('/fisherman/s09')}
            style={styles.notFoundBtn}
          >
            <Text style={styles.notFoundBtnText}>Back to Inquiries (S09)</Text>
          </Pressable>
        </View>
      </FishermanShell>
    );
  }

  // 01. STATUS RESOLUTION
  const status: FishermanInquiryStatus =
    inquiry.status ?? (inquiry.unread ? 'new' : inquiry.replied ? 'responded' : 'new');
  const isNew = status === 'new';
  const isResponded = status === 'responded';
  const isClosed = status === 'closed';

  // 01. RELATED FISH & REQUESTED QUANTITY
  const relatedListing = listings.find(
    (l) => l.id === inquiry.listingId || l.name.toLowerCase() === inquiry.listingName?.toLowerCase(),
  );

  const requestedQty = inquiry.requestedQuantityKg ?? (inquiry.message.match(/(\d+(?:\.\d+)?)\s*kg/i) ? parseFloat(inquiry.message.match(/(\d+(?:\.\d+)?)\s*kg/i)![1]) : undefined);
  const estimatedOrderValue = requestedQty && relatedListing ? requestedQty * relatedListing.price : undefined;

  // 02. CALL CUSTOMER -> DEVICE DIALER
  const handleCallCustomer = async () => {
    const rawPhone = inquiry.customerPhone || '0773441902';
    const cleanPhone = rawPhone.replace(/[^0-9+]/g, '');
    const phoneUrl = `tel:${cleanPhone}`;

    try {
      const supported = await Linking.canOpenURL(phoneUrl);
      if (supported) {
        await Linking.openURL(phoneUrl);
      } else {
        Alert.alert(
          'Device Dialer',
          `Connecting to device dialer for ${inquiry.customerName} (${rawPhone})...\n\nOn physical phone, this launches the native dialer app directly.`,
          [{ text: 'OK' }],
        );
      }
    } catch {
      Alert.alert(
        'Device Dialer',
        `Connecting to device dialer for ${inquiry.customerName} (${rawPhone})...\n\nOn physical phone, this launches the native dialer app directly.`,
        [{ text: 'OK' }],
      );
    }
  };

  // 02. UPDATE STATUS
  const handleSelectStatus = (newStatus: FishermanInquiryStatus) => {
    updateInquiryStatus(inquiry.id, newStatus);
    setStatusModalVisible(false);
    Alert.alert(
      'Status Updated (S10)',
      `Inquiry with ${inquiry.customerName} marked as "${newStatus.toUpperCase()}". Dashboard and S09 filter counts have been updated.`,
    );
  };

  // Send lightweight response note (Full real-time chat not needed in scope)
  const handleSendResponseNote = () => {
    if (!replyText.trim()) {
      Alert.alert('Empty Response', 'Please type or select a response note before sending.');
      return;
    }

    replyInquiry(inquiry.id, replyText.trim());
    setReplyText('');
    Alert.alert(
      'Response Note Sent! (S10)',
      `Your response has been sent to ${inquiry.customerName}. Inquiry status updated to RESPONDED.`,
    );
  };

  // 02. BACK -> S09
  const handleBackToS09 = () => {
    router.replace('/fisherman/s09');
  };

  return (
    <FishermanShell
      title="S10 · Inquiry Details"
      subtitle={`Inquiry from ${inquiry.customerName}`}
      back
      onBack={handleBackToS09}
      rightIcon="phone"
      rightLabel="Call Buyer"
      onRightPress={handleCallCustomer}
    >
      {/* SCREEN BREADCRUMB */}
      <View style={styles.breadcrumbRow}>
        <View style={styles.screenTag}>
          <Text style={styles.screenTagText}>SCREEN S10</Text>
        </View>
        <Text numberOfLines={1} style={styles.breadcrumbText}>
          Buyer inquiry details, phone dialer & status update
        </Text>
      </View>

      {/* 03. BEHAVIOR & VALIDATION: INQUIRY != ORDER DISCLAIMER BANNER */}
      <View style={styles.noticeBanner}>
        <View style={styles.noticeIconWrap}>
          <FishermanIcon name="alert" size={16} color={ui.warning} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.noticeTitle}>
            Inquiry Only — Not an Order
          </Text>
          <Text style={styles.noticeSub}>
            This inquiry is a buyer pre-sales question. It does not reserve stock or create an order until confirmed in Customer Orders (S22).
          </Text>
        </View>
      </View>

      {/* 01. CUSTOMER NAME + PHONE CARD */}
      <View style={styles.card}>
        <View style={styles.customerHeaderRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {inquiry.customerName.slice(0, 2).toUpperCase()}
            </Text>
          </View>

          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={styles.customerNameRow}>
              <Text numberOfLines={1} style={styles.customerName}>
                {inquiry.customerName}
              </Text>
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>BUYER</Text>
              </View>
            </View>

            {/* 01. PHONE NUMBER */}
            <View style={styles.phoneRow}>
              <FishermanIcon name="phone" size={13} color={ui.tealDark} />
              <Text style={styles.phoneText}>
                {inquiry.customerPhone || '071 234 5678'}
              </Text>
            </View>

            {inquiry.customerLocation ? (
              <View style={styles.locationRow}>
                <FishermanIcon name="pin" size={12} color={ui.muted} />
                <Text numberOfLines={1} style={styles.locationText}>
                  {inquiry.customerLocation}
                </Text>
              </View>
            ) : null}
          </View>

          {/* 02. CALL CUSTOMER -> DEVICE DIALER BUTTON */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Call customer via device dialer"
            onPress={handleCallCustomer}
            style={styles.callDialerBtn}
          >
            <FishermanIcon name="phone" size={16} color="#FFFFFF" />
            <Text style={styles.callDialerBtnText}>Call</Text>
          </Pressable>
        </View>

        <View style={styles.cardDivider} />

        {/* 01. RECEIVED DATE & STATUS ROW */}
        <View style={styles.metaRow}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.metaLabel}>RECEIVED DATE</Text>
            <View style={styles.dateRow}>
              <FishermanIcon name="clock" size={13} color={ui.navy} />
              <Text style={styles.metaValue}>
                {inquiry.receivedDate || inquiry.timeAgo}
              </Text>
            </View>
          </View>

          {/* 01. STATUS BADGE & 02. UPDATE STATUS BUTTON */}
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.metaLabel}>CURRENT STATUS</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Change status"
              onPress={() => setStatusModalVisible(true)}
              style={[
                styles.statusBadge,
                isNew
                  ? styles.statusBadgeNew
                  : isResponded
                  ? styles.statusBadgeResponded
                  : styles.statusBadgeClosed,
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  isNew
                    ? styles.dotNew
                    : isResponded
                    ? styles.dotResponded
                    : styles.dotClosed,
                ]}
              />
              <Text
                style={[
                  styles.statusBadgeText,
                  isNew
                    ? styles.statusTextNew
                    : isResponded
                    ? styles.statusTextResponded
                    : styles.statusTextClosed,
                ]}
              >
                {isNew ? 'NEW INQUIRY' : isResponded ? 'RESPONDED' : 'CLOSED'} ✎
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* 01. RELATED FISH AND REQUESTED QUANTITY (IF ANY) */}
      <View style={styles.card}>
        <Text style={styles.cardHeading}>Related Fish Catch & Requested Weight</Text>
        <View style={styles.relatedCatchBox}>
          <Image
            source={relatedListing ? relatedListing.image : tuna}
            style={styles.relatedCatchImg}
            resizeMode="cover"
          />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text numberOfLines={1} style={styles.relatedCatchTitle}>
              {inquiry.listingName || relatedListing?.name || 'Harbor Daily Catch'}
            </Text>
            <Text style={styles.relatedCatchSub}>
              {relatedListing
                ? `${money(relatedListing.price)} / kg · ${relatedListing.availableKg} kg in ice stall`
                : 'Harbor fresh landing on cold ice'}
            </Text>

            {/* REQUESTED QUANTITY HIGHLIGHT */}
            {requestedQty ? (
              <View style={styles.requestedQtyPill}>
                <Text style={styles.requestedQtyLabel}>
                  Requested Quantity: <Text style={styles.requestedQtyValue}>{requestedQty.toFixed(1)} KG</Text>
                </Text>
                {estimatedOrderValue ? (
                  <Text style={styles.estValueText}>
                    Est. Value: {money(estimatedOrderValue)}
                  </Text>
                ) : null}
              </View>
            ) : null}
          </View>

          {relatedListing ? (
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                router.push({
                  pathname: '/fisherman/s07',
                  params: { id: relatedListing.id },
                } as never)
              }
              style={styles.viewListingBtn}
            >
              <Text style={styles.viewListingBtnText}>View Catch (S07) ↗</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* 01. COMPLETE INQUIRY MESSAGE */}
      <View style={styles.card}>
        <View style={styles.messageHeaderRow}>
          <Text style={styles.cardHeading}>Complete Customer Message</Text>
          <Text style={styles.messageTimeText}>
            {inquiry.receivedDate || inquiry.timeAgo}
          </Text>
        </View>

        <View style={styles.completeMessageBox}>
          <Text style={styles.quoteOpenMark}>&ldquo;</Text>
          <Text style={styles.completeMessageText}>
            {inquiry.message}
          </Text>
        </View>

        {/* PREVIOUS RESPONSE IF ALREADY RESPONDED */}
        {inquiry.replyMessage ? (
          <View style={styles.previousReplyCard}>
            <View style={styles.previousReplyHeader}>
              <View style={styles.replyAuthorRow}>
                <FishermanIcon name="check" size={13} color={ui.success} />
                <Text style={styles.previousReplyAuthor}>Your Response</Text>
              </View>
              <Text style={styles.previousReplyTime}>
                {inquiry.repliedAt || 'Sent'}
              </Text>
            </View>
            <Text style={styles.previousReplyText}>
              {inquiry.replyMessage}
            </Text>
          </View>
        ) : null}

        {/* CLOSED CALLOUT BANNER */}
        {isClosed ? (
          <View style={styles.closedCallout}>
            <FishermanIcon name="check" size={13} color="#475569" />
            <Text style={styles.closedCalloutText}>
              This inquiry has been marked as closed & fulfilled.
            </Text>
          </View>
        ) : null}
      </View>

      {/* 03. LIGHTWEIGHT RESPONSE COMPOSER (Full real-time chat not required in scope) */}
      <View style={styles.card}>
        <Text style={styles.cardHeading}>Quick Response / Notes</Text>
        <Text style={styles.composerSub}>
          Send a quick response note or tap templates to message the buyer.
        </Text>

        {/* ONE-TAP PRESETS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.templateScroll}
        >
          {TEMPLATE_REPLIES.map((tmpl, idx) => (
            <Pressable
              key={idx}
              accessibilityRole="button"
              onPress={() => setReplyText((prev) => `${prev} ${tmpl}`.trim())}
              style={styles.templateChip}
            >
              <Text numberOfLines={1} style={styles.templateChipText}>
                + {tmpl}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <TextInput
          value={replyText}
          onChangeText={setReplyText}
          multiline
          numberOfLines={3}
          placeholder="Type your response note to the customer..."
          placeholderTextColor={ui.mutedLight}
          style={styles.responseInput}
        />

        <Pressable
          accessibilityRole="button"
          onPress={handleSendResponseNote}
          style={styles.sendResponseBtn}
        >
          <FishermanIcon name="message" size={16} color="#FFFFFF" />
          <Text style={styles.sendResponseBtnText}>
            {inquiry.replyMessage ? 'Send Follow-up Note' : 'Send Response Note (S10)'}
          </Text>
        </Pressable>
      </View>

      {/* 02. BUTTONS & NAVIGATION / CLICK ACTIONS BAR */}
      <View style={styles.actionsBar}>
        {/* CALL CUSTOMER BUTTON */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Call customer via device dialer"
          onPress={handleCallCustomer}
          style={styles.primaryCallBtn}
        >
          <FishermanIcon name="phone" size={18} color="#FFFFFF" />
          <Text style={styles.primaryCallBtnText}>
            Call Customer ({inquiry.customerPhone || 'Dial'})
          </Text>
        </Pressable>

        {/* UPDATE STATUS BUTTON */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Update inquiry status"
          onPress={() => setStatusModalVisible(true)}
          style={styles.updateStatusBtn}
        >
          <FishermanIcon name="sparkles" size={16} color={ui.tealDark} />
          <Text style={styles.updateStatusBtnText}>
            Update Status (Currently: {status.toUpperCase()})
          </Text>
        </Pressable>

        {/* BACK -> S09 */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to Inquiries (S09)"
          onPress={handleBackToS09}
          style={styles.backBtn}
        >
          <FishermanIcon name="arrow-left" size={16} color={ui.navy} />
          <Text style={styles.backBtnText}>Back to Inquiries (S09)</Text>
        </Pressable>
      </View>

      {/* 02. STATUS SELECTION MODAL SHEET */}
      <Modal
        visible={statusModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.sheetHandle} />

            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={styles.modalTitle}>Update Inquiry Status</Text>
                <Text style={styles.modalSub}>
                  Select inquiry state for {inquiry.customerName}
                </Text>
              </View>
              <Pressable
                onPress={() => setStatusModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </Pressable>
            </View>

            {/* STATUS OPTIONS LIST */}
            <View style={styles.statusOptionsList}>
              {/* NEW */}
              <Pressable
                accessibilityRole="button"
                onPress={() => handleSelectStatus('new')}
                style={[
                  styles.statusModalOption,
                  status === 'new' && styles.statusModalOptionActiveNew,
                ]}
              >
                <View style={[styles.statusOptionDot, { backgroundColor: '#0284C7' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.statusOptionTitle}>NEW INQUIRY</Text>
                  <Text style={styles.statusOptionDesc}>
                    Awaiting response. Shows blue highlight in S09 inbox.
                  </Text>
                </View>
                {status === 'new' ? (
                  <FishermanIcon name="check" size={16} color="#0284C7" />
                ) : null}
              </Pressable>

              {/* RESPONDED */}
              <Pressable
                accessibilityRole="button"
                onPress={() => handleSelectStatus('responded')}
                style={[
                  styles.statusModalOption,
                  status === 'responded' && styles.statusModalOptionActiveResponded,
                ]}
              >
                <View style={[styles.statusOptionDot, { backgroundColor: '#059669' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.statusOptionTitle}>RESPONDED</Text>
                  <Text style={styles.statusOptionDesc}>
                    Fisherman has called or messaged the buyer.
                  </Text>
                </View>
                {status === 'responded' ? (
                  <FishermanIcon name="check" size={16} color="#059669" />
                ) : null}
              </Pressable>

              {/* CLOSED */}
              <Pressable
                accessibilityRole="button"
                onPress={() => handleSelectStatus('closed')}
                style={[
                  styles.statusModalOption,
                  status === 'closed' && styles.statusModalOptionActiveClosed,
                ]}
              >
                <View style={[styles.statusOptionDot, { backgroundColor: '#64748B' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.statusOptionTitle}>CLOSED / FULFILLED</Text>
                  <Text style={styles.statusOptionDesc}>
                    Inquiry resolved, converted to order, or archived.
                  </Text>
                </View>
                {status === 'closed' ? (
                  <FishermanIcon name="check" size={16} color="#64748B" />
                ) : null}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </FishermanShell>
  );
}

const styles = StyleSheet.create({
  breadcrumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  screenTag: {
    backgroundColor: ui.tealLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  screenTagText: {
    fontSize: 10,
    fontWeight: '900',
    color: ui.tealDark,
    letterSpacing: 0.8,
  },
  breadcrumbText: {
    fontSize: 11,
    color: ui.muted,
    flex: 1,
  },
  notFoundCard: {
    backgroundColor: ui.surface,
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ui.border,
    marginTop: 20,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: ui.navy,
    marginBottom: 6,
  },
  notFoundSub: {
    fontSize: 13,
    color: ui.muted,
    textAlign: 'center',
    marginBottom: 18,
  },
  notFoundBtn: {
    backgroundColor: ui.tealDark,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  notFoundBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },

  // 03. NOTICE BANNER
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FCD34D',
    marginBottom: 14,
  },
  noticeIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#92400E',
  },
  noticeSub: {
    fontSize: 10,
    color: '#78350F',
    marginTop: 2,
    lineHeight: 14,
  },

  // CARDS
  card: {
    backgroundColor: ui.surface,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: ui.border,
    marginBottom: 14,
  },
  cardHeading: {
    fontSize: 14,
    fontWeight: '900',
    color: ui.navy,
    marginBottom: 10,
  },
  cardDivider: {
    height: 1,
    backgroundColor: ui.border,
    marginVertical: 12,
  },

  // CUSTOMER HEADER
  customerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: ui.tealLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '900',
    color: ui.tealDark,
  },
  customerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '900',
    color: ui.navy,
  },
  verifiedBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#0284C7',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
  },
  phoneText: {
    fontSize: 12,
    fontWeight: '800',
    color: ui.tealDark,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    fontSize: 11,
    color: ui.muted,
  },
  callDialerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: ui.tealDark,
    paddingVertical: 8,
    paddingHorizontal: 13,
    borderRadius: 12,
  },
  callDialerBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },

  // META ROW
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: ui.tealDark,
    letterSpacing: 1,
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '800',
    color: ui.navy,
  },

  // STATUS BADGE
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusBadgeNew: {
    backgroundColor: '#E0F2FE',
    borderColor: '#BAE6FD',
  },
  statusBadgeResponded: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  statusBadgeClosed: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotNew: {
    backgroundColor: '#0284C7',
  },
  dotResponded: {
    backgroundColor: '#059669',
  },
  dotClosed: {
    backgroundColor: '#64748B',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  statusTextNew: {
    color: '#0369A1',
  },
  statusTextResponded: {
    color: '#065F46',
  },
  statusTextClosed: {
    color: '#475569',
  },

  // RELATED CATCH BOX
  relatedCatchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FCFD',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E3F1F4',
  },
  relatedCatchImg: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: '#EBF4F6',
  },
  relatedCatchTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: ui.navy,
  },
  relatedCatchSub: {
    fontSize: 11,
    color: ui.muted,
    marginTop: 2,
  },
  requestedQtyPill: {
    backgroundColor: '#EBF7F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  requestedQtyLabel: {
    fontSize: 10,
    color: ui.tealDark,
    fontWeight: '700',
  },
  requestedQtyValue: {
    fontWeight: '900',
    color: ui.navy,
  },
  estValueText: {
    fontSize: 10,
    color: ui.tealDark,
    fontWeight: '800',
    marginTop: 1,
  },
  viewListingBtn: {
    backgroundColor: ui.tealLight,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  viewListingBtnText: {
    fontSize: 10,
    fontWeight: '900',
    color: ui.tealDark,
  },

  // COMPLETE MESSAGE BOX
  messageHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  messageTimeText: {
    fontSize: 10,
    color: ui.muted,
  },
  completeMessageBox: {
    backgroundColor: '#F0F9FA',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#D4EEF2',
  },
  quoteOpenMark: {
    fontSize: 24,
    color: ui.tealDark,
    lineHeight: 20,
    fontWeight: '900',
  },
  completeMessageText: {
    fontSize: 14,
    lineHeight: 21,
    color: ui.navy,
    fontWeight: '600',
    marginTop: 2,
  },

  // PREVIOUS REPLY CARD
  previousReplyCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginTop: 12,
  },
  previousReplyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  replyAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  previousReplyAuthor: {
    fontSize: 11,
    fontWeight: '900',
    color: '#065F46',
  },
  previousReplyTime: {
    fontSize: 10,
    color: ui.muted,
  },
  previousReplyText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#065F46',
    fontWeight: '600',
  },
  closedCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  closedCalloutText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    flex: 1,
  },

  // COMPOSER & TEMPLATES
  composerSub: {
    fontSize: 11,
    color: ui.muted,
    marginBottom: 10,
  },
  templateScroll: {
    gap: 8,
    paddingVertical: 4,
    marginBottom: 10,
  },
  templateChip: {
    backgroundColor: '#F0F9FA',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D4EEF2',
    maxWidth: 240,
  },
  templateChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: ui.tealDark,
  },
  responseInput: {
    backgroundColor: '#F8FCFD',
    borderWidth: 1,
    borderColor: ui.border,
    borderRadius: 14,
    padding: 12,
    fontSize: 13,
    color: ui.navy,
    minHeight: 75,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  sendResponseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: ui.tealDark,
    paddingVertical: 13,
    borderRadius: 14,
  },
  sendResponseBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
  },

  // ACTIONS BAR
  actionsBar: {
    gap: 10,
    marginTop: 4,
    marginBottom: 24,
  },
  primaryCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#059669',
    paddingVertical: 15,
    borderRadius: 18,
    shadowColor: '#059669',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryCallBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 15,
  },
  updateStatusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: ui.surface,
    paddingVertical: 13,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: ui.tealDark,
  },
  updateStatusBtnText: {
    color: ui.tealDark,
    fontWeight: '900',
    fontSize: 13,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: ui.surface,
    paddingVertical: 13,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ui.border,
  },
  backBtnText: {
    color: ui.navy,
    fontWeight: '800',
    fontSize: 13,
  },

  // MODAL SHEET
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 28, 36, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 34,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: ui.navy,
  },
  modalSub: {
    fontSize: 11,
    color: ui.muted,
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: ui.navy,
  },
  statusOptionsList: {
    gap: 10,
  },
  statusModalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#F8FCFD',
    borderWidth: 1.5,
    borderColor: ui.border,
  },
  statusModalOptionActiveNew: {
    borderColor: '#0284C7',
    backgroundColor: '#F0F9FF',
  },
  statusModalOptionActiveResponded: {
    borderColor: '#059669',
    backgroundColor: '#ECFDF5',
  },
  statusModalOptionActiveClosed: {
    borderColor: '#64748B',
    backgroundColor: '#F1F5F9',
  },
  statusOptionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusOptionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: ui.navy,
  },
  statusOptionDesc: {
    fontSize: 11,
    color: ui.muted,
    marginTop: 2,
  },
});

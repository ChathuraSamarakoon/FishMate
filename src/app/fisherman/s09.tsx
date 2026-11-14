import { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { FishermanShell } from '@/components/fisherman/FishermanShell';
import { FishermanIcon } from '@/components/fisherman/FishermanIcon';
import { EmptyStateCard, RecentInquiryCard, SectionHeader } from '@/components/fisherman/atoms';
import { fishermanUi as ui } from '@/components/fisherman/theme';
import { useFisherman } from '@/components/fisherman/FishermanContext';
import type { FishermanInquiryItem } from '@/types';

const TEMPLATE_REPLIES = [
  'Yes, landed this morning from Sagara Rani II. Fresh and chilled on ice!',
  'We can clean, gut, and slice into 1kg steak packs before delivery.',
  'Doorstep ice-box delivery is available within 15km of Negombo harbor.',
  'Will arrive with the dawn boat at 05:00 AM. I will reserve your catch.',
];

export default function S09InquiriesScreen() {
  const { inquiries, replyInquiry } = useFisherman();
  const [filter, setFilter] = useState<'all' | 'unread' | 'replied'>('all');
  const [activeInquiry, setActiveInquiry] = useState<FishermanInquiryItem | null>(null);
  const [replyText, setReplyText] = useState('');

  const filteredInquiries = inquiries.filter((inq) => {
    if (filter === 'unread') return inq.unread;
    if (filter === 'replied') return inq.replied;
    return true;
  });

  const unreadCount = inquiries.filter((i) => i.unread).length;

  const handleOpenReply = (inquiry: FishermanInquiryItem) => {
    setActiveInquiry(inquiry);
    setReplyText(`Hi ${inquiry.customerName.split(' ')[0]}, `);
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !activeInquiry) return;
    const targetId = activeInquiry.id;
    const targetName = activeInquiry.customerName;

    replyInquiry(targetId, replyText);
    setActiveInquiry(null);
    Alert.alert(
      'Reply Sent! (S09)',
      `Your message has been sent to ${targetName}. Dashboard unread count and live activity have been updated.`,
    );
  };

  const handleCall = (inquiry: FishermanInquiryItem) => {
    Alert.alert(
      'Dial Customer (S09)',
      `Connecting phone call to ${inquiry.customerName} (${inquiry.customerPhone ?? 'Customer'})...`,
      [
        { text: 'Call Now', onPress: () => Alert.alert('Dialing...') },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  };

  return (
    <FishermanShell
      title="S09 · Buyer Inquiries"
      subtitle="Direct questions from seafood buyers"
      back
      rightIcon="message"
      rightLabel="Inquiries"
    >
      <View style={styles.badgeRow}>
        <View style={styles.screenTag}>
          <Text style={styles.screenTagText}>SCREEN S09</Text>
        </View>
        <Text style={styles.helperText}>Buyer questions, cuts, delivery & custom pricing</Text>
      </View>

      {/* OVERVIEW BANNER */}
      <View style={styles.bannerCard}>
        <View style={styles.bannerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerEyebrow}>CUSTOMER INBOX</Text>
            <Text style={styles.bannerTitle}>{inquiries.length} Total Inquiries</Text>
            <Text style={styles.bannerSub}>
              Prompt replies directly boost customer loyalty and repeat harbor pre-orders.
            </Text>
          </View>
          <View style={styles.unreadPill}>
            <Text style={styles.unreadPillText}>{unreadCount} Unread</Text>
          </View>
        </View>
      </View>

      {/* FILTER BUTTONS */}
      <View style={styles.filterRow}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setFilter('all')}
          style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All Inquiries ({inquiries.length})
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => setFilter('unread')}
          style={[styles.filterChip, filter === 'unread' && styles.filterChipActive]}
        >
          <Text style={[styles.filterText, filter === 'unread' && styles.filterTextActive]}>
            Unread ({unreadCount})
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => setFilter('replied')}
          style={[styles.filterChip, filter === 'replied' && styles.filterChipActive]}
        >
          <Text style={[styles.filterText, filter === 'replied' && styles.filterTextActive]}>
            Replied ({inquiries.filter((i) => i.replied).length})
          </Text>
        </Pressable>
      </View>

      <SectionHeader
        title={
          filter === 'all'
            ? 'Recent Buyer Messages'
            : filter === 'unread'
            ? 'Unread Inquiries'
            : 'Replied Conversations'
        }
        subtitle="Tap to view inquiry details, send custom quote or telephone"
        count={filteredInquiries.length}
      />

      {filteredInquiries.length === 0 ? (
        <EmptyStateCard
          icon="message"
          title="No inquiries found"
          description="No customer inquiries match this filter. When buyers ask questions, they will show here."
          actionText="Show All Inquiries"
          onAction={() => setFilter('all')}
        />
      ) : (
        filteredInquiries.map((inquiry) => (
          <RecentInquiryCard
            key={inquiry.id}
            inquiry={inquiry}
            onPress={() => handleOpenReply(inquiry)}
            onReply={() => handleOpenReply(inquiry)}
          />
        ))
      )}

      {/* INTERACTIVE REPLY MODAL */}
      <Modal
        visible={!!activeInquiry}
        animationType="slide"
        transparent
        onRequestClose={() => setActiveInquiry(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetEyebrow}>S09 · REPLY TO INQUIRY</Text>
                <Text style={styles.sheetTitle}>{activeInquiry?.customerName}</Text>
                <Text style={styles.sheetFish}>
                  Fish: {activeInquiry?.listingName ?? 'Daily Catch'} · {activeInquiry?.timeAgo}
                </Text>
              </View>
              <Pressable onPress={() => setActiveInquiry(null)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </Pressable>
            </View>

            <View style={styles.buyerMessageBox}>
              <Text style={styles.buyerMessageLabel}>Customer Question:</Text>
              <Text style={styles.buyerMessageText}>&ldquo;{activeInquiry?.message}&rdquo;</Text>
            </View>

            <Text style={styles.quickTemplateLabel}>Quick One-Tap Templates:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.templateScroll}
            >
              {TEMPLATE_REPLIES.map((tmpl, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => setReplyText((prev) => `${prev} ${tmpl}`.trim())}
                  style={styles.templateChip}
                >
                  <Text numberOfLines={1} style={styles.templateText}>
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
              placeholder="Type your response to the buyer..."
              placeholderTextColor={ui.mutedLight}
              style={styles.replyInput}
            />

            <View style={styles.modalActionRow}>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  if (activeInquiry) handleCall(activeInquiry);
                }}
                style={styles.callBuyerBtn}
              >
                <FishermanIcon name="phone" size={15} color={ui.navy} />
                <Text style={styles.callBuyerBtnText}>Call</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={handleSendReply}
                style={styles.sendReplyBtn}
              >
                <FishermanIcon name="message" size={15} color="#FFFFFF" />
                <Text style={styles.sendReplyBtnText}>Send Reply (S09)</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </FishermanShell>
  );
}

const styles = StyleSheet.create({
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  screenTag: {
    backgroundColor: ui.tealDark,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  screenTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  helperText: {
    fontSize: 11,
    color: ui.muted,
  },
  bannerCard: {
    backgroundColor: ui.surface,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: ui.border,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerEyebrow: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: ui.tealDark,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: ui.navy,
    marginTop: 2,
  },
  bannerSub: {
    fontSize: 11,
    color: ui.muted,
    lineHeight: 16,
    marginTop: 3,
  },
  unreadPill: {
    backgroundColor: '#EBF4FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  unreadPillText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#2563EB',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  filterChip: {
    backgroundColor: ui.surface,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ui.border,
  },
  filterChipActive: {
    backgroundColor: ui.teal,
    borderColor: ui.teal,
  },
  filterText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.navy,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(8, 27, 42, 0.45)',
  },
  modalSheet: {
    backgroundColor: ui.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 34,
  },
  sheetHandle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D6E7E5',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sheetEyebrow: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: ui.tealDark,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: ui.navy,
    marginTop: 2,
  },
  sheetFish: {
    fontSize: 11,
    color: ui.muted,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ui.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: ui.muted,
  },
  buyerMessageBox: {
    backgroundColor: ui.softBlue,
    padding: 12,
    borderRadius: 14,
    marginTop: 14,
  },
  buyerMessageLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: ui.tealDark,
    marginBottom: 4,
  },
  buyerMessageText: {
    fontSize: 12,
    color: ui.navy,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  quickTemplateLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: ui.muted,
    marginTop: 14,
    marginBottom: 6,
  },
  templateScroll: {
    gap: 8,
    paddingBottom: 4,
  },
  templateChip: {
    backgroundColor: ui.bg,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ui.border,
    maxWidth: 260,
  },
  templateText: {
    fontSize: 11,
    color: ui.navy,
    fontWeight: '700',
  },
  replyInput: {
    backgroundColor: ui.bg,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: ui.border,
    fontSize: 13,
    color: ui.navy,
    minHeight: 84,
    textAlignVertical: 'top',
    marginTop: 12,
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  callBuyerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: ui.softBlue,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ui.border,
  },
  callBuyerBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: ui.navy,
  },
  sendReplyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: ui.teal,
    height: 48,
    borderRadius: 14,
  },
  sendReplyBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});

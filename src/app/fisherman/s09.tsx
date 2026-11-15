import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { FishermanShell } from '@/components/fisherman/FishermanShell';
import { FishermanIcon } from '@/components/fisherman/FishermanIcon';
import { EmptyStateCard, SectionHeader } from '@/components/fisherman/atoms';
import { fishermanUi as ui } from '@/components/fisherman/theme';
import { useFisherman } from '@/components/fisherman/FishermanContext';
import type { FishermanInquiryItem, FishermanInquiryStatus } from '@/types';

type FilterType = 'all' | 'new' | 'responded' | 'closed';

export default function S09InquiriesScreen() {
  const { inquiries } = useFisherman();
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 01. RESOLVE INQUIRY STATUS (Exact statuses proposed UI decision)
  const getInquiryStatus = (item: FishermanInquiryItem): FishermanInquiryStatus => {
    if (item.status) return item.status;
    if (item.unread) return 'new';
    if (item.replied) return 'responded';
    return 'new';
  };

  // Filter inquiries based on active tab and search query
  const filteredInquiries = inquiries.filter((inq) => {
    const status = getInquiryStatus(inq);
    const matchesFilter = filter === 'all' || status === filter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      inq.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inq.listingName && inq.listingName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      inq.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Calculate status counts
  const totalCount = inquiries.length;
  const newCount = inquiries.filter((i) => getInquiryStatus(i) === 'new').length;
  const respondedCount = inquiries.filter((i) => getInquiryStatus(i) === 'responded').length;
  const closedCount = inquiries.filter((i) => getInquiryStatus(i) === 'closed').length;

  // 02. TAP INQUIRY -> S10 INQUIRY DETAILS
  const handleOpenInquiryDetails = (inquiry: FishermanInquiryItem) => {
    router.push({
      pathname: '/fisherman/s10',
      params: { id: inquiry.id },
    } as never);
  };

  return (
    <FishermanShell
      title="S09 · Buyer Inquiries"
      subtitle="Direct questions & catch inquiries"
      back
      rightIcon="message"
      rightLabel="Inquiries"
    >
      {/* SCREEN BREADCRUMB */}
      <View style={styles.breadcrumbRow}>
        <View style={styles.screenTag}>
          <Text style={styles.screenTagText}>SCREEN S09</Text>
        </View>
        <Text numberOfLines={1} style={styles.breadcrumbText}>
          Buyer communication, catch inquiries & custom requests
        </Text>
      </View>

      {/* OVERVIEW STATS BANNER */}
      <View style={styles.overviewCard}>
        <View style={styles.overviewRow}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.overviewEyebrow}>CUSTOMER INBOX</Text>
            <Text style={styles.overviewTitle}>{totalCount} Total Inquiries</Text>
            <Text style={styles.overviewSub}>
              Fast replies increase harbor sales by 35% and build buyer trust.
            </Text>
          </View>
          <View style={styles.newBadgePill}>
            <View style={styles.newGlowDot} />
            <Text style={styles.newBadgePillText}>{newCount} New</Text>
          </View>
        </View>
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchContainer}>
        <FishermanIcon name="search" size={16} color={ui.muted} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by customer, fish species, or question..."
          placeholderTextColor={ui.mutedLight}
          style={styles.searchInput}
        />
        {searchQuery.length > 0 ? (
          <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
            <Text style={styles.clearSearchText}>✕</Text>
          </Pressable>
        ) : null}
      </View>

      {/* 01. ALL / NEW / RESPONDED / CLOSED FILTERS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: filter === 'all' }}
          onPress={() => setFilter('all')}
          style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All
          </Text>
          <View
            style={[
              styles.filterBadge,
              filter === 'all' && styles.filterBadgeActive,
            ]}
          >
            <Text
              style={[
                styles.filterBadgeText,
                filter === 'all' && styles.filterBadgeTextActive,
              ]}
            >
              {totalCount}
            </Text>
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: filter === 'new' }}
          onPress={() => setFilter('new')}
          style={[styles.filterChip, filter === 'new' && styles.filterChipActive]}
        >
          <Text style={[styles.filterText, filter === 'new' && styles.filterTextActive]}>
            New
          </Text>
          <View
            style={[
              styles.filterBadge,
              filter === 'new' && styles.filterBadgeActiveNew,
            ]}
          >
            <Text
              style={[
                styles.filterBadgeText,
                filter === 'new' && styles.filterBadgeTextActiveNew,
              ]}
            >
              {newCount}
            </Text>
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: filter === 'responded' }}
          onPress={() => setFilter('responded')}
          style={[styles.filterChip, filter === 'responded' && styles.filterChipActive]}
        >
          <Text style={[styles.filterText, filter === 'responded' && styles.filterTextActive]}>
            Responded
          </Text>
          <View
            style={[
              styles.filterBadge,
              filter === 'responded' && styles.filterBadgeActiveResponded,
            ]}
          >
            <Text
              style={[
                styles.filterBadgeText,
                filter === 'responded' && styles.filterBadgeTextActiveResponded,
              ]}
            >
              {respondedCount}
            </Text>
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: filter === 'closed' }}
          onPress={() => setFilter('closed')}
          style={[styles.filterChip, filter === 'closed' && styles.filterChipActive]}
        >
          <Text style={[styles.filterText, filter === 'closed' && styles.filterTextActive]}>
            Closed
          </Text>
          <View
            style={[
              styles.filterBadge,
              filter === 'closed' && styles.filterBadgeActiveClosed,
            ]}
          >
            <Text
              style={[
                styles.filterBadgeText,
                filter === 'closed' && styles.filterBadgeTextActiveClosed,
              ]}
            >
              {closedCount}
            </Text>
          </View>
        </Pressable>
      </ScrollView>

      {/* SECTION HEADER */}
      <SectionHeader
        title={
          filter === 'all'
            ? 'All Customer Inquiries'
            : filter === 'new'
            ? 'New & Unread Inquiries'
            : filter === 'responded'
            ? 'Responded Conversations'
            : 'Closed / Resolved Inquiries'
        }
        subtitle="Tap any inquiry to open full conversation details (S10)"
        count={filteredInquiries.length}
      />

      {/* 03. EMPTY STATE */}
      {filteredInquiries.length === 0 ? (
        <EmptyStateCard
          icon="message"
          title={
            searchQuery
              ? `No inquiries matching "${searchQuery}"`
              : filter === 'new'
              ? 'No New Inquiries'
              : filter === 'responded'
              ? 'No Responded Inquiries'
              : filter === 'closed'
              ? 'No Closed Inquiries'
              : 'No Customer Inquiries'
          }
          description={
            searchQuery
              ? 'Try searching with another keyword like a fish species or customer name.'
              : filter === 'new'
              ? "All customer questions have been answered. You're completely caught up!"
              : filter === 'responded'
              ? 'Inquiries you have replied to will appear under this filter.'
              : filter === 'closed'
              ? 'Resolved inquiries or fulfilled requests marked as closed will be archived here.'
              : 'When buyers message you from the FishMate app, their questions will show here.'
          }
          actionText={filter !== 'all' || searchQuery ? 'View All Inquiries' : undefined}
          onAction={() => {
            setFilter('all');
            setSearchQuery('');
          }}
        />
      ) : (
        /* 01 & 02. INQUIRY CARDS LIST */
        filteredInquiries.map((inquiry) => {
          const status = getInquiryStatus(inquiry);
          const isNew = status === 'new';
          const isResponded = status === 'responded';
          const isClosed = status === 'closed';

          // Extract customer initials
          const nameParts = inquiry.customerName.split(' ');
          const initials =
            nameParts.length >= 2
              ? `${nameParts[0][0]}${nameParts[1][0]}`
              : nameParts[0].slice(0, 2).toUpperCase();

          return (
            <Pressable
              key={inquiry.id}
              accessibilityRole="button"
              accessibilityLabel={`Inquiry from ${inquiry.customerName}`}
              onPress={() => handleOpenInquiryDetails(inquiry)}
              style={[
                styles.inquiryCard,
                isNew && styles.inquiryCardNew,
                isClosed && styles.inquiryCardClosed,
              ]}
            >
              {/* TOP ROW: CUSTOMER NAME, RECEIVED DATE & STATUS BADGE */}
              <View style={styles.cardHeaderRow}>
                {/* CUSTOMER AVATAR INITIALS */}
                <View
                  style={[
                    styles.avatarInitialsBox,
                    isNew ? styles.avatarNew : isResponded ? styles.avatarResponded : styles.avatarClosed,
                  ]}
                >
                  <Text
                    style={[
                      styles.avatarInitialsText,
                      isNew ? styles.avatarTextNew : isResponded ? styles.avatarTextResponded : styles.avatarTextClosed,
                    ]}
                  >
                    {initials}
                  </Text>
                </View>

                {/* CUSTOMER NAME & RECEIVED DATE */}
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={styles.nameRow}>
                    <Text numberOfLines={1} style={styles.customerName}>
                      {inquiry.customerName}
                    </Text>
                    {isNew ? <View style={styles.unreadGlowDot} /> : null}
                  </View>
                  <View style={styles.receivedDateRow}>
                    <FishermanIcon name="clock" size={11} color={ui.muted} />
                    <Text style={styles.receivedDateText}>
                      {inquiry.receivedDate || inquiry.timeAgo}
                    </Text>
                  </View>
                </View>

                {/* 01 & 03. STATUS BADGE (EXACT STATUSES PROPOSED UI DECISION) */}
                <View
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
                    {isNew ? 'NEW' : isResponded ? 'RESPONDED' : 'CLOSED'}
                  </Text>
                </View>
              </View>

              {/* 01. RELATED FISH LISTING CHIP */}
              <View style={styles.fishChipRow}>
                <View style={styles.fishChip}>
                  <Text style={styles.fishChipIcon}>🐟</Text>
                  <Text numberOfLines={1} style={styles.fishChipText}>
                    {inquiry.listingName || 'Fresh Harbor Catch'}
                  </Text>
                </View>
                {inquiry.customerPhone ? (
                  <View style={styles.phoneChip}>
                    <FishermanIcon name="phone" size={10} color={ui.tealDark} />
                    <Text style={styles.phoneChipText}>{inquiry.customerPhone}</Text>
                  </View>
                ) : null}
              </View>

              {/* 01. MESSAGE PREVIEW */}
              <View style={styles.messageBox}>
                <Text numberOfLines={2} style={styles.messagePreviewText}>
                  &ldquo;{inquiry.message}&rdquo;
                </Text>
              </View>

              {/* REPLY SUMMARY IF RESPONDED */}
              {inquiry.replyMessage ? (
                <View style={styles.replyPreviewBox}>
                  <FishermanIcon name="check" size={11} color={ui.success} />
                  <Text numberOfLines={1} style={styles.replyPreviewText}>
                    You: {inquiry.replyMessage}
                  </Text>
                </View>
              ) : null}

              {/* CARD FOOTER: TAP TO VIEW INQUIRY DETAILS (S10) */}
              <View style={styles.cardFooter}>
                <Text style={styles.tapActionText}>
                  {isNew ? 'Reply to inquiry →' : 'View conversation history (S10) →'}
                </Text>
                <FishermanIcon name="chevron-right" size={14} color={ui.tealDark} />
              </View>
            </Pressable>
          );
        })
      )}
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

  // OVERVIEW CARD
  overviewCard: {
    backgroundColor: ui.surface,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: ui.border,
    marginBottom: 14,
    shadowColor: ui.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  overviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  overviewEyebrow: {
    fontSize: 9,
    fontWeight: '900',
    color: ui.tealDark,
    letterSpacing: 1.2,
  },
  overviewTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: ui.navy,
    marginTop: 2,
  },
  overviewSub: {
    fontSize: 11,
    color: ui.muted,
    marginTop: 2,
    lineHeight: 15,
  },
  newBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 14,
  },
  newGlowDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#0284C7',
  },
  newBadgePillText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0369A1',
  },

  // SEARCH BAR
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ui.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ui.border,
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: ui.navy,
    fontWeight: '600',
  },
  clearSearchText: {
    fontSize: 14,
    color: ui.muted,
    fontWeight: '900',
  },

  // FILTER TABS
  filterScroll: {
    gap: 8,
    paddingBottom: 4,
    marginBottom: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 13,
    borderRadius: 14,
    backgroundColor: ui.surface,
    borderWidth: 1,
    borderColor: ui.border,
  },
  filterChipActive: {
    backgroundColor: ui.tealDark,
    borderColor: ui.tealDark,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '800',
    color: ui.muted,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  filterBadge: {
    backgroundColor: '#EBF4F6',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  filterBadgeActiveNew: {
    backgroundColor: '#0284C7',
  },
  filterBadgeActiveResponded: {
    backgroundColor: '#059669',
  },
  filterBadgeActiveClosed: {
    backgroundColor: '#64748B',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: ui.navy,
  },
  filterBadgeTextActive: {
    color: '#FFFFFF',
  },
  filterBadgeTextActiveNew: {
    color: '#FFFFFF',
  },
  filterBadgeTextActiveResponded: {
    color: '#FFFFFF',
  },
  filterBadgeTextActiveClosed: {
    color: '#FFFFFF',
  },

  // INQUIRY CARDS
  inquiryCard: {
    backgroundColor: ui.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: ui.border,
    marginBottom: 12,
    shadowColor: ui.shadow,
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  inquiryCardNew: {
    borderColor: '#7DD3FC',
    backgroundColor: '#FAFDFE',
  },
  inquiryCardClosed: {
    opacity: 0.85,
    backgroundColor: '#FAFCFC',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarInitialsBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarNew: {
    backgroundColor: '#E0F2FE',
  },
  avatarResponded: {
    backgroundColor: '#ECFDF5',
  },
  avatarClosed: {
    backgroundColor: '#F1F5F9',
  },
  avatarInitialsText: {
    fontSize: 14,
    fontWeight: '900',
  },
  avatarTextNew: {
    color: '#0284C7',
  },
  avatarTextResponded: {
    color: '#059669',
  },
  avatarTextClosed: {
    color: '#64748B',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '900',
    color: ui.navy,
  },
  unreadGlowDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#0284C7',
  },
  receivedDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  receivedDateText: {
    fontSize: 10,
    color: ui.muted,
    fontWeight: '600',
  },

  // 01 & 03. STATUS BADGE STYLES
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
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
    borderColor: '#E2E8F0',
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
    fontSize: 9,
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

  // FISH CHIP & PHONE
  fishChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  fishChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F0F9FA',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4EEF2',
  },
  fishChipIcon: {
    fontSize: 11,
  },
  fishChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.tealDark,
  },
  phoneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FCFD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  phoneChipText: {
    fontSize: 10,
    color: ui.muted,
    fontWeight: '600',
  },

  // MESSAGE PREVIEW
  messageBox: {
    backgroundColor: '#F8FCFD',
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#EBF4F6',
  },
  messagePreviewText: {
    fontSize: 12,
    lineHeight: 18,
    color: ui.navy,
    fontWeight: '600',
    fontStyle: 'italic',
  },

  // REPLY PREVIEW
  replyPreviewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginTop: 8,
  },
  replyPreviewText: {
    fontSize: 10,
    color: '#065F46',
    fontWeight: '700',
    flex: 1,
  },

  // CARD FOOTER
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F4F6',
  },
  tapActionText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.tealDark,
  },
});

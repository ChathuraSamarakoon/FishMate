import { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { FishermanShell } from '@/components/fisherman/FishermanShell';
import { FishermanIcon } from '@/components/fisherman/FishermanIcon';
import {
  BasicProfitCard,
  EmptyStateCard,
  MetricStatCard,
  RecentActivityItem,
  RecentInquiryCard,
  RecentOrderCard,
  RevenueCard,
  SectionHeader,
  money,
} from '@/components/fisherman/atoms';
import { fishermanUi as ui } from '@/components/fisherman/theme';
import { currentFishermanProfile } from '@/data/fishermanData';
import { getSession } from '@/services/demoAuth';
import { useFisherman } from '@/components/fisherman/FishermanContext';

export default function FishermanDashboardScreen() {
  const session = getSession();
  const {
    orders,
    inquiries,
    summary,
    activities,
    updateOrderStatus,
    replyInquiry,
    isSimulatingEmpty,
    toggleSimulateEmpty,
  } = useFisherman();
  const [statusAtSea, setStatusAtSea] = useState(false);

  // Derive seller display name
  const sellerName =
    session && session.role === 'fisherman'
      ? session.fullName
      : currentFishermanProfile.name;
  const sellerFirstName = sellerName.split(' ')[0];

  // Quick order status update for demo interactivity
  const handleUpdateOrderStatus = (orderId: string) => {
    updateOrderStatus(orderId);
  };

  const handleReplyInquiry = (inquiryId: string, customerName: string) => {
    Alert.alert(
      `Reply to ${customerName}`,
      'This connects directly with customer inquiry messages. Fast replies increase harbor catch sales by 35%!',
      [
        {
          text: 'Send Quick Reply (S09)',
          onPress: () => {
            replyInquiry(
              inquiryId,
              'Yes, landed this morning from Sagara Rani II. Fresh on ice!',
            );
            Alert.alert('Replied', `Response sent to ${customerName}!`);
          },
        },
        { text: 'Close', style: 'cancel' },
      ],
    );
  };

  const toggleStatus = () => {
    const next = !statusAtSea;
    setStatusAtSea(next);
    Alert.alert(
      next ? 'Status: Out at Sea ⚓' : 'Status: Docked & Selling 🐟',
      next
        ? 'Your profile now shows customers that you are currently on a fishing voyage. Catch pre-orders remain open.'
        : 'Your profile now shows customers that you are docked at harbor with fresh stock ready for immediate pickup & delivery.',
    );
  };

  return (
    <FishermanShell
      title={`Ayubowan, ${sellerFirstName}!`}
      subtitle={currentFishermanProfile.village}
      rightIcon="plus"
      rightLabel="Add Fish (S06)"
      onRightPress={() => router.push('/fisherman/s06')}
    >
      {/* 01. GREETING + SELLER NAME / PHOTO */}
      <View style={styles.sellerHeaderCard}>
        <View style={styles.sellerTopRow}>
          <Image
            source={currentFishermanProfile.avatar}
            style={styles.sellerAvatar}
            resizeMode="cover"
          />
          <View style={styles.sellerInfoCol}>
            <View style={styles.greetingRow}>
              <Text style={styles.greetingEyebrow}>WELCOME BACK</Text>
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>VERIFIED SELLER</Text>
              </View>
            </View>
            <Text numberOfLines={1} style={styles.sellerName}>
              {sellerName}
            </Text>
            <View style={styles.harborRow}>
              <FishermanIcon name="pin" size={12} color={ui.tealDark} />
              <Text numberOfLines={1} style={styles.harborText}>
                {currentFishermanProfile.village} · {currentFishermanProfile.boatName}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sellerDivider} />

        <View style={styles.sellerMetaRow}>
          <Pressable
            accessibilityRole="button"
            onPress={toggleStatus}
            style={[
              styles.statusTogglePill,
              statusAtSea ? styles.statusAtSea : styles.statusDocked,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                statusAtSea ? styles.statusDotSea : styles.statusDotDocked,
              ]}
            />
            <Text
              numberOfLines={1}
              style={[
                styles.statusToggleText,
                statusAtSea ? styles.statusTextSea : styles.statusTextDocked,
              ]}
            >
              {statusAtSea ? 'Out at Sea (Voyage Active)' : 'Docked & Accepting Orders'}
            </Text>
            <FishermanIcon
              name="chevron-right"
              size={12}
              color={statusAtSea ? '#087E8B' : ui.success}
            />
          </Pressable>

          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>★ {currentFishermanProfile.rating}</Text>
            <Text style={styles.ratingSub}>({currentFishermanProfile.completedOrders})</Text>
          </View>
        </View>
      </View>

      {/* QUICK ACTIONS BANNER */}
      <View style={styles.quickBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add Fish (S06)"
          onPress={() => router.push('/fisherman/s06')}
          style={styles.quickActionItem}
        >
          <View style={[styles.quickActionIconWrap, { backgroundColor: ui.tealLight }]}>
            <FishermanIcon name="plus" size={16} color={ui.tealDark} />
          </View>
          <Text numberOfLines={1} style={styles.quickActionLabel}>
            Add Fish
          </Text>
          <View style={[styles.quickActionBadge, { backgroundColor: ui.tealLight }]}>
            <Text style={[styles.quickActionBadgeText, { color: ui.tealDark }]}>S06</Text>
          </View>
        </Pressable>

        <View style={styles.quickSeparator} />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="New Trip (S12)"
          onPress={() => router.push('/fisherman/s12')}
          style={styles.quickActionItem}
        >
          <View style={[styles.quickActionIconWrap, { backgroundColor: ui.softBlue }]}>
            <FishermanIcon name="clock" size={16} color={ui.navy} />
          </View>
          <Text numberOfLines={1} style={styles.quickActionLabel}>
            New Trip
          </Text>
          <View style={[styles.quickActionBadge, { backgroundColor: ui.softBlue }]}>
            <Text style={[styles.quickActionBadgeText, { color: ui.navy }]}>S12</Text>
          </View>
        </Pressable>

        <View style={styles.quickSeparator} />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Orders (S22)"
          onPress={() => router.push('/fisherman/s22')}
          style={styles.quickActionItem}
        >
          <View style={[styles.quickActionIconWrap, { backgroundColor: ui.warningSoft }]}>
            <FishermanIcon name="bag" size={16} color={ui.warning} />
          </View>
          <Text numberOfLines={1} style={styles.quickActionLabel}>
            Orders
          </Text>
          <View style={[styles.quickActionBadge, { backgroundColor: ui.warningSoft }]}>
            <Text style={[styles.quickActionBadgeText, { color: ui.warning }]}>S22</Text>
          </View>
        </Pressable>
      </View>

      {/* 02, 03, 04, 05. 4 CORE METRIC CARDS */}
      <View style={styles.metricsGrid}>
        {/* Active Fish Listings count -> S06 */}
        <MetricStatCard
          label="Active Fish Listings"
          value={summary.activeListingsCount}
          subtext="4 ready stock, 2 limited"
          icon="sparkles"
          accentColor={ui.teal}
          badgeText="S06"
          onPress={() => router.push('/fisherman/s06')}
        />

        {/* New Inquiries count -> S09 */}
        <MetricStatCard
          label="New Inquiries"
          value={summary.newInquiriesCount}
          subtext="2 unread, awaiting reply"
          icon="message"
          accentColor="#2563EB"
          badgeText="S09"
          onPress={() => router.push('/fisherman/s09')}
        />
      </View>

      <View style={[styles.metricsGrid, { marginTop: 12 }]}>
        {/* Pending Orders count -> S22 */}
        <MetricStatCard
          label="Pending Orders"
          value={summary.pendingOrdersCount}
          subtext="Rs. 32,500 pending dispatch"
          icon="bag"
          accentColor={ui.warning}
          badgeText="S22"
          onPress={() => router.push('/fisherman/s22')}
        />

        {/* Total Fishing Trips -> S12 */}
        <MetricStatCard
          label="Total Fishing Trips"
          value={summary.totalTripsCount}
          subtext="14 this month · 1 planned"
          icon="clock"
          accentColor={ui.success}
          badgeText="S12"
          onPress={() => router.push('/fisherman/s12')}
        />
      </View>

      {/* 06. REVENUE & BASIC PROFIT CARDS -> S21 */}
      <SectionHeader
        title="Financial Health"
        subtitle="Earnings & voyage cost balance"
        actionText="Summary (S21)"
        onAction={() => router.push('/fisherman/s21')}
      />

      {/* Revenue Card -> S21 */}
      <RevenueCard
        revenue={summary.monthlyRevenue}
        growthPercent={summary.revenueGrowthPercent}
        period="This Month"
        dailyAverage={Math.round(summary.monthlyRevenue / 25)}
        onPress={() => router.push('/fisherman/s21')}
      />

      {/* Basic Profit Card -> S21 */}
      <BasicProfitCard
        profit={summary.estimatedProfit}
        marginPercent={summary.profitMarginPercent}
        fuelCost={summary.fuelCost}
        iceBaitCost={summary.iceBaitCost}
        harborFee={summary.harborFee}
        onPress={() => router.push('/fisherman/s21')}
      />

      {/* 07. RECENT ORDERS -> S22 */}
      <SectionHeader
        title="Recent Orders"
        subtitle="Latest customer seafood orders"
        count={orders.length}
        actionText="All Orders (S22)"
        onAction={() => router.push('/fisherman/s22')}
      />

      {orders.length === 0 ? (
        <EmptyStateCard
          icon="bag"
          title="No active orders right now"
          description="New pre-orders and harbor catch requests from local buyers will appear here in real-time."
          actionText="View Orders Screen (S22)"
          onAction={() => router.push('/fisherman/s22')}
        />
      ) : (
        orders.slice(0, 3).map((order) => (
          <RecentOrderCard
            key={order.id}
            order={order}
            onPress={() =>
              Alert.alert(
                `Order ${order.orderNumber}`,
                `Customer: ${order.customerName}\nPhone: ${order.customerPhone}\nItems: ${order.items
                  .map((i) => `${i.fishName} (${i.quantityKg}kg)`)
                  .join(', ')}\nTotal: ${money(order.totalAmount)}\nNote: ${
                  order.note ?? 'None'
                }`,
              )
            }
            onUpdateStatus={() => handleUpdateOrderStatus(order.id)}
          />
        ))
      )}

      {/* 07. RECENT INQUIRIES -> S09 */}
      <SectionHeader
        title="Recent Inquiries"
        subtitle="Buyer questions on catch, cuts & delivery"
        count={inquiries.length}
        actionText="All Inquiries (S09)"
        onAction={() => router.push('/fisherman/s09')}
      />

      {inquiries.length === 0 ? (
        <EmptyStateCard
          icon="message"
          title="No customer inquiries"
          description="When customers ask questions regarding fish cuts, cleaning, or ice-box delivery, they will appear here."
          actionText="+ Add Fresh Catch (S06)"
          onAction={() => router.push('/fisherman/s06')}
        />
      ) : (
        inquiries.slice(0, 3).map((inquiry) => (
          <RecentInquiryCard
            key={inquiry.id}
            inquiry={inquiry}
            onPress={() =>
              Alert.alert(
                `Inquiry from ${inquiry.customerName}`,
                `"${inquiry.message}"\n\nFish: ${inquiry.listingName ?? 'Daily Catch'}\nReceived: ${
                  inquiry.timeAgo
                }`,
                [
                  {
                    text: 'Reply via Chat',
                    onPress: () => handleReplyInquiry(inquiry.id, inquiry.customerName),
                  },
                  {
                    text: 'Call Customer',
                    onPress: () =>
                      Alert.alert(
                        'Dialing Customer',
                        `Connecting call to ${inquiry.customerPhone ?? 'customer'}...`,
                      ),
                  },
                  { text: 'Close', style: 'cancel' },
                ],
              )
            }
            onReply={() => handleReplyInquiry(inquiry.id, inquiry.customerName)}
          />
        ))
      )}

      {/* 08. RECENT ACTIVITY DISPLAY */}
      <SectionHeader
        title="Recent Activity"
        subtitle="Real-time log of orders, voyages, and payouts"
        count={activities.length}
      />

      {activities.length === 0 ? (
        <EmptyStateCard
          icon="clock"
          title="No recent activity logged"
          description="Your catch publishing, order milestones, and voyage logs will generate a real-time activity stream here."
        />
      ) : (
        activities.slice(0, 4).map((activity) => (
          <RecentActivityItem key={activity.id} activity={activity} />
        ))
      )}

      {/* DEMO STATE & VALIDATION TOGGLE */}
      <View style={styles.demoBar}>
        <View style={{ flex: 1 }}>
          <Text style={styles.demoBarLabel}>BEHAVIOR & VALIDATION (03)</Text>
          <Text style={styles.demoBarSub}>
            {isSimulatingEmpty
              ? 'Displaying Empty States & 0 counters'
              : 'Live Mock Data Connected & Updating Cards'}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={toggleSimulateEmpty}
          style={[styles.demoToggleBtn, isSimulatingEmpty && styles.demoToggleBtnActive]}
        >
          <Text style={[styles.demoToggleText, isSimulatingEmpty && styles.demoToggleTextActive]}>
            {isSimulatingEmpty ? 'Restore Mock Data' : 'Simulate Empty State'}
          </Text>
        </Pressable>
      </View>

      {/* HARBOR ADVISORY / FOOTER */}
      <View style={styles.advisoryCard}>
        <View style={styles.advisoryIcon}>
          <FishermanIcon name="sparkles" size={17} color={ui.tealDark} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.advisoryTitle}>Negombo Harbor Weather Notice</Text>
          <Text style={styles.advisoryText}>
            Calm seas predicted for western shelf waters until 08:00 AM tomorrow. Good conditions
            for yellowfin tuna long-lining and prawn nets.
          </Text>
        </View>
      </View>
    </FishermanShell>
  );
}

const styles = StyleSheet.create({
  sellerHeaderCard: {
    backgroundColor: ui.surface,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: ui.border,
    shadowColor: ui.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  sellerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  sellerAvatar: {
    width: 68,
    height: 68,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: ui.tealLight,
  },
  sellerInfoCol: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  greetingEyebrow: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: ui.tealDark,
  },
  verifiedBadge: {
    backgroundColor: ui.tealLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 8,
    fontWeight: '900',
    color: ui.tealDark,
    letterSpacing: 0.5,
  },
  sellerName: {
    fontSize: 20,
    fontWeight: '900',
    color: ui.navy,
    letterSpacing: -0.4,
    marginTop: 3,
  },
  harborRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  harborText: {
    fontSize: 11,
    color: ui.muted,
    fontWeight: '600',
  },
  sellerDivider: {
    height: 1,
    backgroundColor: ui.borderSubtle,
    marginVertical: 14,
  },
  sellerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  statusTogglePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    gap: 7,
  },
  statusDocked: {
    backgroundColor: ui.successSoft,
  },
  statusAtSea: {
    backgroundColor: ui.softBlue,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusDotDocked: {
    backgroundColor: ui.success,
  },
  statusDotSea: {
    backgroundColor: '#087E8B',
  },
  statusToggleText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '800',
  },
  statusTextDocked: {
    color: ui.success,
  },
  statusTextSea: {
    color: '#087E8B',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: ui.goldSoft,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#9E720A',
  },
  ratingSub: {
    fontSize: 10,
    fontWeight: '700',
    color: ui.muted,
  },
  quickBar: {
    backgroundColor: ui.surface,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginTop: 14,
    borderWidth: 1,
    borderColor: ui.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: ui.shadow,
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  quickActionItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 2,
    gap: 4,
  },
  quickActionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.navy,
    textAlign: 'center',
  },
  quickActionBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 1,
  },
  quickActionBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  quickSeparator: {
    width: 1,
    height: 38,
    backgroundColor: ui.borderSubtle,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  advisoryCard: {
    backgroundColor: ui.tealLight,
    borderRadius: 20,
    padding: 16,
    marginTop: 18,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#D4EDE9',
  },
  advisoryIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  advisoryTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: ui.navy,
  },
  advisoryText: {
    fontSize: 11,
    color: ui.muted,
    lineHeight: 17,
    marginTop: 3,
  },
  demoBar: {
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#EFE1CB',
    borderRadius: 18,
    padding: 14,
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  demoBarLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: ui.warning,
    letterSpacing: 1.2,
  },
  demoBarSub: {
    fontSize: 11,
    color: ui.navy,
    fontWeight: '700',
    marginTop: 2,
  },
  demoToggleBtn: {
    backgroundColor: ui.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ui.border,
  },
  demoToggleBtnActive: {
    backgroundColor: ui.teal,
    borderColor: ui.teal,
  },
  demoToggleText: {
    fontSize: 11,
    fontWeight: '900',
    color: ui.navy,
  },
  demoToggleTextActive: {
    color: '#FFFFFF',
  },
});

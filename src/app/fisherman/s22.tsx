import { useMemo, useState } from 'react';
import {
  Alert,
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
import { EmptyStateCard, OrderStatusBadge, SectionHeader, money } from '@/components/fisherman/atoms';
import { fishermanUi as ui } from '@/components/fisherman/theme';
import { useFisherman } from '@/components/fisherman/FishermanContext';
import type { FishermanOrder, FishermanOrderStatus } from '@/types';

/**
 * 01. FILTER TABS:
 * Pending / Confirmed / Preparing / Delivered / Cancelled filters (+ All Orders)
 */
export type OrderFilterTab =
  | 'all'
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'delivered'
  | 'cancelled';

const FILTER_TABS: { key: OrderFilterTab; label: string }[] = [
  { key: 'all', label: 'All Orders' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

/**
 * Normalizes order status against the user's primary filter groups
 */
function matchesOrderStatus(orderStatus: FishermanOrderStatus, filter: OrderFilterTab): boolean {
  if (filter === 'all') return true;
  if (filter === 'pending') return orderStatus === 'pending';
  if (filter === 'confirmed') return orderStatus === 'confirmed' || orderStatus === 'ready';
  if (filter === 'preparing') return orderStatus === 'preparing';
  if (filter === 'delivered') {
    return (
      orderStatus === 'delivered' ||
      orderStatus === 'completed' ||
      orderStatus === 'dispatched'
    );
  }
  if (filter === 'cancelled') return orderStatus === 'cancelled';
  return false;
}

export default function S22OrdersScreen() {
  const { orders, isSimulatingEmpty, toggleSimulateEmpty, resetDemoData } = useFisherman();
  const [filter, setFilter] = useState<OrderFilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 01. NEW ORDERS COUNT
  const pendingOrders = useMemo(
    () => orders.filter((o) => o.status === 'pending'),
    [orders],
  );
  const newOrdersCount = pendingOrders.length;
  const pendingTotalValue = useMemo(
    () => pendingOrders.reduce((sum, o) => sum + o.totalAmount, 0),
    [pendingOrders],
  );

  // Filter orders based on active filter tab and text search
  const filteredOrders = useMemo(() => {
    if (isSimulatingEmpty) return [];

    return orders.filter((o) => {
      const statusMatch = matchesOrderStatus(o.status, filter);
      const query = searchQuery.trim().toLowerCase();

      const searchMatch =
        query === '' ||
        o.orderNumber.toLowerCase().includes(query) ||
        o.customerName.toLowerCase().includes(query) ||
        o.customerLocation.toLowerCase().includes(query) ||
        o.items.some((i) => i.fishName.toLowerCase().includes(query));

      return statusMatch && searchMatch;
    });
  }, [orders, filter, searchQuery, isSimulatingEmpty]);

  // Total gross value of currently filtered orders
  const filteredTotalValue = useMemo(
    () => filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0),
    [filteredOrders],
  );

  // Status counts for badge counters on filter chips
  const counts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter((o) => matchesOrderStatus(o.status, 'pending')).length,
      confirmed: orders.filter((o) => matchesOrderStatus(o.status, 'confirmed')).length,
      preparing: orders.filter((o) => matchesOrderStatus(o.status, 'preparing')).length,
      delivered: orders.filter((o) => matchesOrderStatus(o.status, 'delivered')).length,
      cancelled: orders.filter((o) => matchesOrderStatus(o.status, 'cancelled')).length,
    };
  }, [orders]);

  // 02. BUTTONS & NAVIGATION: ORDER CARD -> S23
  const handleOpenOrderDetails = (order: FishermanOrder) => {
    router.push({
      pathname: '/fisherman/s23' as never,
      params: {
        id: order.id,
        orderNumber: order.orderNumber,
      },
    });
  };

  return (
    <FishermanShell
      title="S22 · Customer Orders"
      subtitle="Marketplace orders, preparation & fulfillment"
      back
      rightIcon="bag"
      rightLabel={newOrdersCount > 0 ? `${newOrdersCount} New` : 'Orders'}
      onRightPress={() => setFilter('pending')}
    >
      {/* SCREEN TAG & EXPANDED FEATURE BADGE */}
      <View style={styles.badgeRow}>
        <View style={styles.screenTag}>
          <Text style={styles.screenTagText}>SCREEN S22</Text>
        </View>
        <View style={styles.expandedFeatureBadge}>
          <Text style={styles.expandedFeatureText}>
            ✨ EXPANDED FEATURE BEYOND ORIGINAL PROPOSAL
          </Text>
        </View>
      </View>

      {/* 03. EXPANDED FEATURE CONTEXT BANNER */}
      <View style={styles.expandedInfoBanner}>
        <FishermanIcon name="sparkles" size={14} color={ui.tealDark} />
        <Text style={styles.expandedInfoText}>
          Direct marketplace customer order queue with live dispatch tracking and customer notifications.
        </Text>
      </View>

      {/* 01. NEW ORDERS COUNT (HERO KPI CARD) */}
      <View style={styles.newOrdersCard}>
        <View style={styles.newOrdersTop}>
          <View>
            <View style={styles.alertPulseRow}>
              <View style={[styles.pulseDot, newOrdersCount > 0 && styles.pulseDotActive]} />
              <Text style={styles.newOrdersLabel}>NEW MARKETPLACE ORDERS</Text>
            </View>
            <Text style={styles.newOrdersCountText}>
              {newOrdersCount} {newOrdersCount === 1 ? 'New Order' : 'New Orders'}
            </Text>
          </View>

          <View style={styles.pendingAmountWrap}>
            <Text style={styles.pendingAmountLabel}>Pending Acceptance</Text>
            <Text style={styles.pendingAmountValue}>{money(pendingTotalValue)}</Text>
          </View>
        </View>

        <Text style={styles.newOrdersSubtext}>
          {newOrdersCount > 0
            ? 'Action required: Review customer catch requests, confirm available stock, and start packing.'
            : 'All received customer orders are currently acknowledged and moving through fulfillment.'}
        </Text>

        {newOrdersCount > 0 && filter !== 'pending' && (
          <Pressable
            accessibilityRole="button"
            onPress={() => setFilter('pending')}
            style={styles.viewPendingQuickBtn}
          >
            <Text style={styles.viewPendingQuickText}>
              Filter to {newOrdersCount} Pending Orders →
            </Text>
          </Pressable>
        )}
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchBar}>
        <FishermanIcon name="search" size={16} color={ui.muted} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by ID (#ORD-8821), buyer name, or fish..."
          placeholderTextColor={ui.mutedLight}
          style={styles.searchInput}
        />
        {searchQuery.length > 0 && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            onPress={() => setSearchQuery('')}
            hitSlop={8}
          >
            <Text style={styles.clearSearch}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* 01. PENDING / CONFIRMED / PREPARING / DELIVERED / CANCELLED FILTERS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        {FILTER_TABS.map((tab) => {
          const selected = filter === tab.key;
          const count = counts[tab.key];
          return (
            <Pressable
              key={tab.key}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setFilter(tab.key)}
              style={[styles.filterChip, selected && styles.filterChipSelected]}
            >
              <Text
                style={[
                  styles.filterLabel,
                  selected && styles.filterLabelSelected,
                ]}
              >
                {tab.label}
              </Text>
              <View
                style={[
                  styles.filterCountBadge,
                  selected && styles.filterCountBadgeSelected,
                ]}
              >
                <Text
                  style={[
                    styles.filterCountText,
                    selected && styles.filterCountTextSelected,
                  ]}
                >
                  {count}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* SECTION HEADER WITH ORDER COUNT & GROSS VALUE */}
      <SectionHeader
        title={
          filter === 'all'
            ? 'All Orders'
            : `${FILTER_TABS.find((t) => t.key === filter)?.label} Orders`
        }
        subtitle={`Showing ${filteredOrders.length} orders totaling ${money(filteredTotalValue)}`}
        count={filteredOrders.length}
      />

      {/* 03. BEHAVIOR & VALIDATION: NO ORDERS EMPTY STATE */}
      {filteredOrders.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyStateCard
            title="No Orders Found"
            description={
              isSimulatingEmpty
                ? 'Demo simulation mode is active. No orders are currently visible.'
                : searchQuery
                ? `No orders matching "${searchQuery}" under ${filter} filter.`
                : `There are currently no ${filter} orders in your queue.`
            }
            icon="bag"
            actionText={
              isSimulatingEmpty
                ? 'Restore Sample Orders'
                : searchQuery || filter !== 'all'
                ? 'Reset to All Orders'
                : 'Refresh Demo Orders'
            }
            onAction={() => {
              if (isSimulatingEmpty) {
                toggleSimulateEmpty();
              } else {
                setSearchQuery('');
                setFilter('all');
                resetDemoData();
              }
            }}
          />
        </View>
      ) : (
        /* 01. ORDERS LIST (ID, BUYER, DATE, AMOUNT, STATUS) */
        <View style={styles.ordersListContainer}>
          {filteredOrders.map((order) => {
            const itemsSummary = order.items
              .map((i) => `${i.quantityKg} kg ${i.fishName}`)
              .join(' · ');

            return (
              <Pressable
                key={order.id}
                accessibilityRole="button"
                accessibilityLabel={`Order ${order.orderNumber} for ${order.customerName}`}
                onPress={() => handleOpenOrderDetails(order)}
                style={({ pressed }) => [
                  styles.orderCard,
                  pressed && styles.orderCardPressed,
                ]}
              >
                {/* 01. TOP ROW: ID, DATE & STATUS */}
                <View style={styles.cardHeaderRow}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={styles.orderIdBadgeRow}>
                      <View style={styles.idBadge}>
                        <Text style={styles.idBadgeText}>{order.orderNumber}</Text>
                      </View>
                      <Text style={styles.dateText}>
                        {order.createdAt}
                      </Text>
                    </View>

                    {/* 01. BUYER NAME & CONTACT */}
                    <Text numberOfLines={1} style={styles.buyerName}>
                      {order.customerName}
                    </Text>
                    <View style={styles.buyerLocationRow}>
                      <FishermanIcon name="pin" size={12} color={ui.muted} />
                      <Text numberOfLines={1} style={styles.buyerLocationText}>
                        {order.customerLocation}
                      </Text>
                    </View>
                  </View>

                  {/* 01. STATUS BADGE */}
                  <OrderStatusBadge status={order.status} />
                </View>

                {/* ITEMS SPECIFICATION */}
                <View style={styles.orderItemsBox}>
                  <FishermanIcon name="sparkles" size={13} color={ui.tealDark} />
                  <Text numberOfLines={2} style={styles.itemsSummaryText}>
                    {itemsSummary}
                  </Text>
                </View>

                {/* SPECIAL INSTRUCTION NOTE (IF PRESENT) */}
                {order.note ? (
                  <View style={styles.noteRow}>
                    <Text numberOfLines={1} style={styles.noteText}>
                      💬 Note: {order.note}
                    </Text>
                  </View>
                ) : null}

                {/* 01. BOTTOM ROW: TOTAL AMOUNT & CLICK ACTION (ORDER CARD -> S23) */}
                <View style={styles.cardFooterRow}>
                  <View>
                    <Text style={styles.amountLabel}>ORDER TOTAL</Text>
                    <Text style={styles.amountValue}>
                      {money(order.totalAmount)}
                    </Text>
                  </View>

                  {/* 02. BUTTONS & NAVIGATION: ORDER CARD -> S23 */}
                  <View style={styles.viewDetailsRow}>
                    <Text style={styles.viewDetailsText}>View Order (S23)</Text>
                    <FishermanIcon name="chevron-right" size={14} color={ui.tealDark} />
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* DEMO EMPTY STATE TOGGLE & FOOTER */}
      <View style={styles.footerToolsRow}>
        <Pressable
          accessibilityRole="button"
          onPress={toggleSimulateEmpty}
          style={styles.demoToggleBtn}
        >
          <Text style={styles.demoToggleText}>
            {isSimulatingEmpty ? '👁 Show Orders' : '🧪 Test Empty State'}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            resetDemoData();
            Alert.alert('Demo Orders Reset', 'Sample orders restored.');
          }}
          style={styles.demoToggleBtn}
        >
          <Text style={styles.demoToggleText}>🔄 Reset Demo Data</Text>
        </Pressable>
      </View>
    </FishermanShell>
  );
}

const styles = StyleSheet.create({
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
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
  expandedFeatureBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  expandedFeatureText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#6D28D9',
    letterSpacing: 0.5,
  },
  expandedInfoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDFA',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    marginBottom: 12,
  },
  expandedInfoText: {
    fontSize: 11,
    color: ui.tealDark,
    fontWeight: '700',
    flex: 1,
    lineHeight: 15,
  },
  newOrdersCard: {
    backgroundColor: ui.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    shadowColor: '#D97706',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    marginBottom: 14,
  },
  newOrdersTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  alertPulseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ui.muted,
  },
  pulseDotActive: {
    backgroundColor: '#EF4444',
  },
  newOrdersLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#92400E',
  },
  newOrdersCountText: {
    fontSize: 24,
    fontWeight: '900',
    color: ui.navy,
    letterSpacing: -0.4,
    marginTop: 2,
  },
  pendingAmountWrap: {
    alignItems: 'flex-end',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  pendingAmountLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#92400E',
  },
  pendingAmountValue: {
    fontSize: 13,
    fontWeight: '900',
    color: '#78350F',
    marginTop: 1,
  },
  newOrdersSubtext: {
    fontSize: 11,
    color: ui.muted,
    lineHeight: 16,
    marginTop: 6,
  },
  viewPendingQuickBtn: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#FEF3C7',
    alignSelf: 'flex-start',
  },
  viewPendingQuickText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#B45309',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ui.surface,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: ui.border,
    marginBottom: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: ui.navy,
    fontWeight: '600',
  },
  clearSearch: {
    fontSize: 14,
    color: ui.muted,
    fontWeight: '800',
    padding: 4,
  },
  filterScroll: {
    gap: 8,
    paddingBottom: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 14,
    backgroundColor: ui.surface,
    borderWidth: 1,
    borderColor: ui.border,
  },
  filterChipSelected: {
    backgroundColor: ui.teal,
    borderColor: ui.teal,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.navy,
  },
  filterLabelSelected: {
    color: '#FFFFFF',
  },
  filterCountBadge: {
    backgroundColor: ui.bg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  filterCountBadgeSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  filterCountText: {
    fontSize: 10,
    fontWeight: '900',
    color: ui.muted,
  },
  filterCountTextSelected: {
    color: '#FFFFFF',
  },
  emptyWrap: {
    marginTop: 8,
    marginBottom: 20,
  },
  ordersListContainer: {
    gap: 12,
    marginBottom: 20,
  },
  orderCard: {
    backgroundColor: ui.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: ui.border,
    shadowColor: ui.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  orderCardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  orderIdBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  idBadge: {
    backgroundColor: ui.tealLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  idBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: ui.tealDark,
  },
  dateText: {
    fontSize: 10,
    color: ui.muted,
    fontWeight: '700',
  },
  buyerName: {
    fontSize: 13,
    fontWeight: '900',
    color: ui.navy,
    marginTop: 2,
  },
  buyerLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  buyerLocationText: {
    fontSize: 10,
    color: ui.muted,
    fontWeight: '600',
  },
  orderItemsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: ui.bg,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginVertical: 6,
  },
  itemsSummaryText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.navy,
    flex: 1,
  },
  noteRow: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 6,
  },
  noteText: {
    fontSize: 10,
    color: '#92400E',
    fontWeight: '700',
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: ui.borderSubtle,
  },
  amountLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: ui.muted,
    letterSpacing: 0.5,
  },
  amountValue: {
    fontSize: 15,
    fontWeight: '900',
    color: ui.tealDark,
  },
  viewDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: ui.tealLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  viewDetailsText: {
    fontSize: 11,
    fontWeight: '900',
    color: ui.tealDark,
  },
  footerToolsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 6,
    marginBottom: 30,
  },
  demoToggleBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: ui.surface,
    borderWidth: 1,
    borderColor: ui.border,
  },
  demoToggleText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.navy,
  },
});

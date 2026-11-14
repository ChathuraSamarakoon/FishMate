import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { FishermanShell } from '@/components/fisherman/FishermanShell';
import { FishermanIcon } from '@/components/fisherman/FishermanIcon';
import { EmptyStateCard, RecentOrderCard, SectionHeader, money } from '@/components/fisherman/atoms';
import { fishermanUi as ui } from '@/components/fisherman/theme';
import { useFisherman } from '@/components/fisherman/FishermanContext';
import type { FishermanOrderStatus } from '@/types';

type FilterTab = 'all' | FishermanOrderStatus;

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All Orders' },
  { key: 'pending', label: 'Pending' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready' },
  { key: 'dispatched', label: 'Dispatched' },
  { key: 'completed', label: 'Completed' },
];

export default function S22OrdersScreen() {
  const { orders, updateOrderStatus } = useFisherman();
  const [filter, setFilter] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter((o) => {
    const matchesFilter = filter === 'all' || o.status === filter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.items.some((i) => i.fishName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const totalValue = filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const handleUpdateStatus = (orderId: string) => {
    updateOrderStatus(orderId);
    Alert.alert('Status Updated (S22)', 'Order progress updated. Dashboard cards reflect new count.');
  };

  return (
    <FishermanShell
      title="S22 · Orders & Deliveries"
      subtitle="Customer order fulfillment workflow"
      back
      rightIcon="bag"
      rightLabel="Orders"
      onRightPress={() => setFilter('pending')}
    >
      <View style={styles.badgeRow}>
        <View style={styles.screenTag}>
          <Text style={styles.screenTagText}>SCREEN S22</Text>
        </View>
        <Text style={styles.helperText}>Live catch order dispatch & customer deliveries</Text>
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchBar}>
        <FishermanIcon name="search" size={16} color={ui.muted} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by customer, order # or fish species..."
          placeholderTextColor={ui.mutedLight}
          style={styles.searchInput}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
            <Text style={styles.clearSearch}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* SUMMARY BAR */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.summaryLabel}>SHOWING {filteredOrders.length} ORDERS</Text>
            <Text style={styles.summaryValue}>{money(totalValue)}</Text>
          </View>
          <View style={styles.orderPill}>
            <Text style={styles.orderPillText}>
              {orders.filter((o) => o.status === 'pending').length} Pending Action
            </Text>
          </View>
        </View>
      </View>

      {/* FILTER TABS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        {TABS.map((tab) => {
          const selected = filter === tab.key;
          const count =
            tab.key === 'all' ? orders.length : orders.filter((o) => o.status === tab.key).length;
          return (
            <Pressable
              key={tab.key}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setFilter(tab.key)}
              style={[styles.filterChip, selected && styles.filterChipSelected]}
            >
              <Text style={[styles.filterLabel, selected && styles.filterLabelSelected]}>
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

      <SectionHeader
        title={filter === 'all' ? 'All Active Orders' : `${filter.toUpperCase()} Orders`}
        subtitle="Tap order for full receipt and customer delivery address"
      />

      {filteredOrders.length === 0 ? (
        <EmptyStateCard
          icon="bag"
          title="No matching orders found"
          description="Try selecting a different filter tab or clearing your search term to see orders."
          actionText="Show All Orders"
          onAction={() => {
            setFilter('all');
            setSearchQuery('');
          }}
        />
      ) : (
        filteredOrders.map((order) => (
          <RecentOrderCard
            key={order.id}
            order={order}
            onPress={() =>
              Alert.alert(
                `Order ${order.orderNumber} (S22)`,
                `Customer: ${order.customerName}\nPhone: ${order.customerPhone}\nItems: ${order.items
                  .map((i) => `${i.fishName} (${i.quantityKg}kg @ ${money(i.pricePerKg)}/kg)`)
                  .join(', ')}\nTotal: ${money(order.totalAmount)}\nDelivery: ${order.customerLocation}\nNote: ${
                  order.note ?? 'Standard packaging on ice'
                }`,
                [
                  {
                    text: 'Call Buyer',
                    onPress: () =>
                      Alert.alert('Dialing', `Calling ${order.customerName} at ${order.customerPhone}...`),
                  },
                  { text: 'Close', style: 'cancel' },
                ],
              )
            }
            onUpdateStatus={() => handleUpdateStatus(order.id)}
          />
        ))
      )}
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ui.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: ui.border,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: ui.navy,
  },
  clearSearch: {
    color: ui.muted,
    fontSize: 14,
    fontWeight: '900',
    padding: 4,
  },
  summaryCard: {
    backgroundColor: ui.surface,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: ui.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: ui.tealDark,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '900',
    color: ui.navy,
    marginTop: 4,
  },
  orderPill: {
    backgroundColor: ui.warningSoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  orderPillText: {
    fontSize: 11,
    fontWeight: '900',
    color: ui.warning,
  },
  filterScroll: {
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: ui.surface,
    borderWidth: 1,
    borderColor: ui.border,
  },
  filterChipSelected: {
    backgroundColor: ui.teal,
    borderColor: ui.teal,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: ui.navy,
  },
  filterLabelSelected: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  filterCountBadge: {
    backgroundColor: ui.softBlue,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  filterCountBadgeSelected: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  filterCountText: {
    fontSize: 10,
    fontWeight: '900',
    color: ui.navy,
  },
  filterCountTextSelected: {
    color: '#FFFFFF',
  },
  emptyCard: {
    backgroundColor: ui.surface,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ui.border,
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: ui.navy,
  },
  emptyText: {
    fontSize: 12,
    color: ui.muted,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
  },
});

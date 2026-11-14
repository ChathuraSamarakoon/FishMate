import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FishermanShell } from '@/components/fisherman/FishermanShell';
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

export default function FishermanOrdersScreen() {
  const { orders, updateOrderStatus } = useFisherman();
  const [filter, setFilter] = useState<FilterTab>('all');

  const filteredOrders =
    filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  const totalValue = filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const handleUpdateStatus = (orderId: string) => {
    updateOrderStatus(orderId);
    Alert.alert('Status Updated', 'Order progress updated. Dashboard cards reflect new count.');
  };

  return (
    <FishermanShell
      title="Customer Orders"
      subtitle="Fulfill catch orders & deliveries"
      rightIcon="filter"
      rightLabel="Filter"
      onRightPress={() => setFilter('pending')}
    >
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.summaryLabel}>SHOWING {filteredOrders.length} ORDERS</Text>
            <Text style={styles.summaryValue}>{money(totalValue)}</Text>
          </View>
          <View style={styles.orderPill}>
            <Text style={styles.orderPillText}>
              {orders.filter((o) => o.status === 'pending').length} Pending
            </Text>
          </View>
        </View>
      </View>

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
        title={filter === 'all' ? 'All Received Orders' : `${filter.toUpperCase()} Orders`}
        subtitle="Manage customer orders from preparation to dispatch"
      />

      {filteredOrders.length === 0 ? (
        <EmptyStateCard
          icon="bag"
          title="No orders in this category"
          description="When customers order your catch, they will appear here automatically."
          actionText="Show All Orders"
          onAction={() => setFilter('all')}
        />
      ) : (
        filteredOrders.map((order) => (
          <RecentOrderCard
            key={order.id}
            order={order}
            onPress={() =>
              Alert.alert(
                `Order ${order.orderNumber}`,
                `Customer: ${order.customerName}\nPhone: ${order.customerPhone}\nItems: ${order.items
                  .map((i) => `${i.fishName} (${i.quantityKg}kg)`)
                  .join(', ')}\nTotal: ${money(order.totalAmount)}\nDelivery: ${order.customerLocation}\nNote: ${
                  order.note ?? 'Standard packaging'
                }`,
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
  summaryCard: {
    backgroundColor: ui.surface,
    padding: 18,
    borderRadius: 22,
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
    fontSize: 24,
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
    paddingVertical: 14,
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

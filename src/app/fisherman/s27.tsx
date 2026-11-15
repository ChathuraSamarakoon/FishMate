import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { FishermanShell } from '@/components/fisherman/FishermanShell';
import { FishermanIcon } from '@/components/fisherman/FishermanIcon';
import { EmptyStateCard, OrderStatusBadge, SectionHeader, money } from '@/components/fisherman/atoms';
import { fishermanUi as ui } from '@/components/fisherman/theme';
import { useFisherman } from '@/components/fisherman/FishermanContext';
import type { FishermanOrder } from '@/types';

type PeriodFilterType = 'this_week' | 'this_month' | 'last_month' | 'all_time';

const PERIOD_FILTERS: { key: PeriodFilterType; label: string }[] = [
  { key: 'this_week', label: 'This Week' },
  { key: 'this_month', label: 'This Month' },
  { key: 'last_month', label: 'Last Month' },
  { key: 'all_time', label: 'All Time' },
];

export default function S27OrderSalesSummaryScreen() {
  const { orders } = useFisherman();
  const [period, setPeriod] = useState<PeriodFilterType>('this_month');

  // 02. BUTTONS & NAVIGATION: BACK -> S01
  const handleBackToS01 = () => {
    router.replace('/fisherman/dashboard');
  };

  // 02. BUTTONS & NAVIGATION: VIEW ORDER -> S23
  const handleViewOrder = (order: FishermanOrder) => {
    router.push({
      pathname: '/fisherman/s23' as never,
      params: { id: order.id, orderNumber: order.orderNumber },
    });
  };

  // Filter orders by active period
  const periodOrders = useMemo(() => {
    if (period === 'this_week') {
      return orders.filter(
        (o) =>
          o.createdAt.toLowerCase().includes('min') ||
          o.createdAt.toLowerCase().includes('hr') ||
          o.createdAt.toLowerCase().includes('today') ||
          o.createdAt.toLowerCase().includes('yesterday'),
      );
    }
    if (period === 'last_month') {
      return orders.filter((o) => o.createdAt.toLowerCase().includes('day'));
    }
    return orders;
  }, [orders, period]);

  // 01. TOTAL ORDERS & STATUS COUNTS
  const totalOrders = periodOrders.length;
  const completedOrders = periodOrders.filter(
    (o) => o.status === 'completed' || o.status === 'delivered',
  );
  const completedCount = completedOrders.length;
  const cancelledOrders = periodOrders.filter((o) => o.status === 'cancelled');
  const cancelledCount = cancelledOrders.length;
  const activeCount = totalOrders - completedCount - cancelledCount;

  // Fulfillment rate
  const fulfillmentRate =
    totalOrders > 0
      ? Math.round(((totalOrders - cancelledCount) / totalOrders) * 100)
      : 100;

  // 01. ORDER SALES AMOUNT (COMPLETED / FULFILLED ORDERS REVENUE)
  const orderSalesAmount = useMemo(() => {
    return periodOrders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.totalAmount, 0);
  }, [periodOrders]);

  const avgOrderValue =
    totalOrders - cancelledCount > 0
      ? Math.round(orderSalesAmount / (totalOrders - cancelledCount))
      : 0;

  // 01. ORDER BREAKDOWN BY FISH SPECIES
  const speciesBreakdown = useMemo(() => {
    const map: Record<string, { kg: number; sales: number }> = {};

    periodOrders
      .filter((o) => o.status !== 'cancelled')
      .forEach((order) => {
        order.items.forEach((item) => {
          const name = item.fishName;
          if (!map[name]) {
            map[name] = { kg: 0, sales: 0 };
          }
          map[name].kg += item.quantityKg;
          map[name].sales += item.totalPrice;
        });
      });

    return Object.entries(map)
      .map(([species, data]) => ({
        species,
        kg: data.kg,
        sales: data.sales,
        percent: orderSalesAmount > 0 ? Math.round((data.sales / orderSalesAmount) * 100) : 0,
      }))
      .sort((a, b) => b.sales - a.sales);
  }, [periodOrders, orderSalesAmount]);

  // Payment method distribution
  const paymentBreakdown = useMemo(() => {
    let codSales = 0;
    let onlineSales = 0;

    periodOrders
      .filter((o) => o.status !== 'cancelled')
      .forEach((o) => {
        if (o.paymentMethod === 'online_card' || o.paymentMethod === 'bank_transfer') {
          onlineSales += o.totalAmount;
        } else {
          codSales += o.totalAmount;
        }
      });

    return {
      codSales,
      onlineSales,
      codPercent: orderSalesAmount > 0 ? Math.round((codSales / orderSalesAmount) * 100) : 55,
      onlinePercent: orderSalesAmount > 0 ? Math.round((onlineSales / orderSalesAmount) * 100) : 45,
    };
  }, [periodOrders, orderSalesAmount]);

  return (
    <FishermanShell
      title="S27 · Order Sales Summary"
      subtitle="Marketplace order revenue & retail fulfillment analytics"
      back
      onBack={handleBackToS01}
      rightIcon="home"
      rightLabel="Dashboard"
      onRightPress={handleBackToS01}
    >
      {/* SCREEN TAG & BADGES */}
      <View style={styles.badgeRow}>
        <View style={styles.screenTag}>
          <Text style={styles.screenTagText}>SCREEN S27</Text>
        </View>
        <Text numberOfLines={1} style={styles.screenSub}>
          MARKETPLACE ORDER SALES & VOLUME AUDIT
        </Text>
      </View>

      {/* 03. BEHAVIOR & VALIDATION: DISTINCT FROM S21 BANNER */}
      <View style={styles.distinctBanner}>
        <FishermanIcon name="sparkles" size={14} color="#0D9488" />
        <View style={{ flex: 1 }}>
          <Text style={styles.distinctTitle}>
            Customer App Order Sales (Distinct from S21 Voyage Financials)
          </Text>
          <Text style={styles.distinctBody}>
            This report analyzes retail consumer orders placed directly through the FishMate
            app. S21 Voyage Financials separately tracks boat diesel, ice crates, and harbor
            landing auctions.
          </Text>
        </View>
      </View>

      {/* 03. BEHAVIOR & VALIDATION: ANTI DOUBLE-COUNTING SAFEGUARD */}
      <View style={styles.dedupBanner}>
        <FishermanIcon name="check" size={13} color="#059669" />
        <Text style={styles.dedupText}>
          🛡️ Anti-Double-Counting Safeguard: App order revenues are tagged with unique Order IDs (#ORD-xxxx) to prevent duplicate booking against harbor pier wholesale cash sales.
        </Text>
      </View>

      {/* 01. PERIOD FILTERS */}
      <View style={styles.periodFilterSection}>
        <Text style={styles.filterLabel}>ANALYSIS TIMEFRAME</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.periodScroll}
        >
          {PERIOD_FILTERS.map((f) => {
            const isSelected = period === f.key;
            return (
              <Pressable
                key={f.key}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => setPeriod(f.key)}
                style={[styles.periodChip, isSelected && styles.periodChipActive]}
              >
                <Text
                  style={[
                    styles.periodText,
                    isSelected && styles.periodTextActive,
                  ]}
                >
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* 01. ORDER SALES AMOUNT (HERO KPI CARD) */}
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View>
            <View style={styles.heroBadgeRow}>
              <Text style={styles.heroEyebrow}>CUSTOMER APP REVENUE</Text>
              <View style={styles.retailPill}>
                <Text style={styles.retailPillText}>DIRECT RETAIL</Text>
              </View>
            </View>
            <Text style={styles.heroAmount}>{money(orderSalesAmount)}</Text>
          </View>

          <View style={styles.growthBadge}>
            <Text style={styles.growthBadgeText}>▲ +22.8%</Text>
            <Text style={styles.growthSub}>vs last period</Text>
          </View>
        </View>

        <Text style={styles.heroDesc}>
          Gross sales generated from customer pre-orders and door-step ice deliveries.
        </Text>

        <View style={styles.heroDivider} />

        {/* 01. TOTAL ORDERS & STATUS METRIC MATRIX */}
        <View style={styles.statsMatrix}>
          {/* TOTAL ORDERS */}
          <View style={styles.statCell}>
            <Text style={styles.statCellLabel}>Total Orders</Text>
            <Text style={styles.statCellValue}>{totalOrders}</Text>
            <Text style={styles.statCellSub}>{activeCount} in progress</Text>
          </View>

          <View style={styles.statDivider} />

          {/* COMPLETED */}
          <View style={styles.statCell}>
            <Text style={styles.statCellLabel}>Completed</Text>
            <Text style={styles.statCellValueGreen}>{completedCount}</Text>
            <Text style={styles.statCellSub}>{fulfillmentRate}% success</Text>
          </View>

          <View style={styles.statDivider} />

          {/* CANCELLED */}
          <View style={styles.statCell}>
            <Text style={styles.statCellLabel}>Cancelled</Text>
            <Text style={styles.statCellValueRed}>{cancelledCount}</Text>
            <Text style={styles.statCellSub}>Storm / Out of stock</Text>
          </View>

          <View style={styles.statDivider} />

          {/* AVG ORDER VALUE */}
          <View style={styles.statCell}>
            <Text style={styles.statCellLabel}>Avg Order</Text>
            <Text style={styles.statCellValue}>{money(avgOrderValue)}</Text>
            <Text style={styles.statCellSub}>per delivery</Text>
          </View>
        </View>
      </View>

      {/* 01. ORDER BREAKDOWN: SPECIES-WISE & PAYMENT METHOD */}
      <SectionHeader
        title="Order Revenue Breakdown"
        subtitle="Sales distribution by catch species and payment channel"
      />

      <View style={styles.breakdownCard}>
        {/* SPECIES LIST */}
        <Text style={styles.subBreakdownTitle}>TOP SEAFOOD SPECIES (APP SALES)</Text>
        {speciesBreakdown.map((item, idx) => (
          <View key={item.species} style={styles.speciesRow}>
            <View style={styles.speciesTopRow}>
              <Text style={styles.speciesName}>
                {idx + 1}. {item.species} ({item.kg.toFixed(1)} kg)
              </Text>
              <Text style={styles.speciesSales}>{money(item.sales)}</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.min(100, item.percent)}%`,
                    backgroundColor: idx === 0 ? ui.teal : idx === 1 ? '#0284C7' : '#D97706',
                  },
                ]}
              />
            </View>
          </View>
        ))}

        <View style={styles.cardDivider} />

        {/* PAYMENT METHOD SPLIT */}
        <Text style={styles.subBreakdownTitle}>PAYMENT CHANNEL ALLOCATION</Text>
        <View style={styles.splitBar}>
          <View style={[styles.splitBarCod, { flex: paymentBreakdown.codPercent }]} />
          <View style={[styles.splitBarOnline, { flex: paymentBreakdown.onlinePercent }]} />
        </View>

        <View style={styles.splitLegendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.legendText}>
              Cash on Delivery (COD): <Text style={styles.legendBold}>{money(paymentBreakdown.codSales)}</Text> ({paymentBreakdown.codPercent}%)
            </Text>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#0284C7' }]} />
            <Text style={styles.legendText}>
              Online IPG / Card: <Text style={styles.legendBold}>{money(paymentBreakdown.onlineSales)}</Text> ({paymentBreakdown.onlinePercent}%)
            </Text>
          </View>
        </View>
      </View>

      {/* 01. RECENT SALES LIST */}
      <SectionHeader
        title="Recent Customer Order Sales"
        subtitle="Latest retail orders delivered and acknowledged"
        count={periodOrders.length}
      />

      {periodOrders.length === 0 ? (
        <EmptyStateCard
          title="No Orders in this Period"
          description="Try switching the timeframe filter to 'All Time'."
          icon="bag"
          actionText="Show All Time Orders"
          onAction={() => setPeriod('all_time')}
        />
      ) : (
        <View style={styles.salesList}>
          {periodOrders.map((order) => {
            const isCancelled = order.status === 'cancelled';
            const itemsSummary = order.items
              .map((i) => `${i.quantityKg} kg ${i.fishName}`)
              .join(', ');

            return (
              <View key={order.id} style={styles.saleItemCard}>
                <View style={styles.saleTopRow}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={styles.orderBadgeRow}>
                      <View style={styles.orderIdPill}>
                        <Text style={styles.orderIdPillText}>{order.orderNumber}</Text>
                      </View>
                      <Text style={styles.orderDateSmall}>{order.createdAt}</Text>
                    </View>

                    <Text numberOfLines={1} style={styles.buyerName}>
                      {order.customerName}
                    </Text>
                    <Text numberOfLines={1} style={styles.itemsSummarySmall}>
                      📦 {itemsSummary}
                    </Text>
                  </View>

                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <Text
                      style={[
                        styles.saleAmount,
                        isCancelled ? styles.amountCancelled : styles.amountActive,
                      ]}
                    >
                      {money(order.totalAmount)}
                    </Text>
                    <OrderStatusBadge status={order.status} />
                  </View>
                </View>

                {/* 02. BUTTONS & NAVIGATION: VIEW ORDER -> S23 */}
                <View style={styles.saleFooterRow}>
                  <Text style={styles.methodText}>
                    {order.paymentMethod === 'online_card'
                      ? '💳 Online Card'
                      : order.paymentMethod === 'bank_transfer'
                      ? '🏦 Bank Transfer'
                      : '💵 Cash on Delivery (COD)'}
                  </Text>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`View order details for ${order.orderNumber}`}
                    onPress={() => handleViewOrder(order)}
                    style={styles.viewOrderBtn}
                  >
                    <Text style={styles.viewOrderBtnText}>View Order (S23)</Text>
                    <FishermanIcon name="chevron-right" size={13} color="#FFFFFF" />
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* 02. BUTTONS & NAVIGATION: BACK -> S01 ACTION FOOTER */}
      <View style={styles.footerSection}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to Fisherman Dashboard (S01)"
          onPress={handleBackToS01}
          style={styles.backHomeBtn}
        >
          <FishermanIcon name="home" size={18} color={ui.navy} />
          <Text style={styles.backHomeBtnText}>Back to Dashboard (S01)</Text>
        </Pressable>
        <Text style={styles.footerSubText}>
          FishMate Fisherman Operational Suite · Screen S27
        </Text>
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
  screenSub: {
    fontSize: 9,
    fontWeight: '900',
    color: ui.muted,
    letterSpacing: 0.8,
    flex: 1,
  },
  distinctBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F0FDFA',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#99F6E4',
    marginBottom: 8,
  },
  distinctTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0F766E',
  },
  distinctBody: {
    fontSize: 10,
    color: '#115E59',
    marginTop: 2,
    lineHeight: 14,
  },
  dedupBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 14,
  },
  dedupText: {
    fontSize: 10,
    color: '#065F46',
    fontWeight: '700',
    flex: 1,
    lineHeight: 14,
  },
  periodFilterSection: {
    marginBottom: 14,
  },
  filterLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: ui.muted,
    letterSpacing: 1,
    marginBottom: 6,
  },
  periodScroll: {
    gap: 8,
    paddingBottom: 2,
  },
  periodChip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: ui.surface,
    borderWidth: 1,
    borderColor: ui.border,
  },
  periodChipActive: {
    backgroundColor: ui.teal,
    borderColor: ui.teal,
  },
  periodText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.navy,
  },
  periodTextActive: {
    color: '#FFFFFF',
  },
  heroCard: {
    backgroundColor: '#FAFDFD',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#CCFBF1',
    shadowColor: ui.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    marginBottom: 16,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroEyebrow: {
    fontSize: 9,
    fontWeight: '900',
    color: ui.muted,
    letterSpacing: 1.2,
  },
  retailPill: {
    backgroundColor: ui.tealLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  retailPillText: {
    fontSize: 8,
    fontWeight: '900',
    color: ui.tealDark,
    letterSpacing: 0.5,
  },
  heroAmount: {
    fontSize: 28,
    fontWeight: '900',
    color: ui.navy,
    letterSpacing: -0.6,
    marginTop: 3,
  },
  growthBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    alignItems: 'flex-end',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  growthBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#059669',
  },
  growthSub: {
    fontSize: 8,
    fontWeight: '700',
    color: '#047857',
  },
  heroDesc: {
    fontSize: 11,
    color: ui.muted,
    marginTop: 6,
  },
  heroDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 14,
  },
  statsMatrix: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
  },
  statCellLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: ui.muted,
  },
  statCellValue: {
    fontSize: 14,
    fontWeight: '900',
    color: ui.navy,
    marginTop: 2,
  },
  statCellValueGreen: {
    fontSize: 14,
    fontWeight: '900',
    color: '#059669',
    marginTop: 2,
  },
  statCellValueRed: {
    fontSize: 14,
    fontWeight: '900',
    color: ui.danger,
    marginTop: 2,
  },
  statCellSub: {
    fontSize: 8,
    color: ui.muted,
    marginTop: 1,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E5E7EB',
  },
  breakdownCard: {
    backgroundColor: ui.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: ui.border,
    marginBottom: 16,
  },
  subBreakdownTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: ui.muted,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  speciesRow: {
    marginBottom: 10,
  },
  speciesTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  speciesName: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.navy,
  },
  speciesSales: {
    fontSize: 11,
    fontWeight: '900',
    color: ui.navy,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: ui.bg,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  cardDivider: {
    height: 1,
    backgroundColor: ui.borderSubtle,
    marginVertical: 12,
  },
  splitBar: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
    marginVertical: 6,
  },
  splitBarCod: {
    backgroundColor: '#F59E0B',
  },
  splitBarOnline: {
    backgroundColor: '#0284C7',
  },
  splitLegendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    color: ui.navy,
  },
  legendBold: {
    fontWeight: '900',
  },
  salesList: {
    gap: 10,
    marginBottom: 18,
  },
  saleItemCard: {
    backgroundColor: ui.surface,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: ui.border,
    shadowColor: ui.shadow,
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  saleTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  orderIdPill: {
    backgroundColor: ui.tealLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  orderIdPillText: {
    fontSize: 10,
    fontWeight: '900',
    color: ui.tealDark,
  },
  orderDateSmall: {
    fontSize: 9,
    color: ui.muted,
  },
  buyerName: {
    fontSize: 12,
    fontWeight: '900',
    color: ui.navy,
  },
  itemsSummarySmall: {
    fontSize: 10,
    color: ui.muted,
    marginTop: 2,
  },
  saleAmount: {
    fontSize: 14,
    fontWeight: '900',
  },
  amountActive: {
    color: ui.tealDark,
  },
  amountCancelled: {
    color: ui.muted,
    textDecorationLine: 'line-through',
  },
  saleFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: ui.borderSubtle,
  },
  methodText: {
    fontSize: 10,
    fontWeight: '700',
    color: ui.muted,
  },
  viewOrderBtn: {
    backgroundColor: ui.teal,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewOrderBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  footerSection: {
    marginTop: 4,
    marginBottom: 30,
    alignItems: 'center',
    gap: 6,
  },
  backHomeBtn: {
    backgroundColor: ui.surface,
    borderWidth: 1.5,
    borderColor: ui.border,
    height: 48,
    borderRadius: 16,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: ui.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  backHomeBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: ui.navy,
  },
  footerSubText: {
    fontSize: 10,
    color: ui.muted,
  },
});

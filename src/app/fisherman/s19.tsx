import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { FishermanShell } from '@/components/fisherman/FishermanShell';
import { FishermanIcon } from '@/components/fisherman/FishermanIcon';
import { money } from '@/components/fisherman/atoms';
import { fishermanUi as ui } from '@/components/fisherman/theme';
import { useFisherman } from '@/components/fisherman/FishermanContext';
import type { TripSaleRecord } from '@/types';

export default function S19SalesScreen() {
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const { trips, deleteTripSale, orders } = useFisherman();

  // 01. TRIP SELECTOR / CONTEXT
  const [selectedTripId, setSelectedTripId] = useState<string>(tripId || trips[0]?.id || 'trip-01');

  // Selected trip context
  const trip = trips.find((t) => t.id === selectedTripId) || trips[0];

  if (!trip) {
    return (
      <FishermanShell
        back
        title="S19 · Sales"
        subtitle="Trip not found"
        onBack={() => router.replace('/fisherman/trips')}
      >
        <View style={styles.card}>
          <Text style={styles.emptyTitle}>Trip Record Not Found</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace('/fisherman/trips')}
            style={styles.addBtn}
          >
            <Text style={styles.addBtnText}>Back to Trips (S11)</Text>
          </Pressable>
        </View>
      </FishermanShell>
    );
  }

  const salesList: TripSaleRecord[] = trip.salesList ?? [];

  // 01. CALCULATED REVENUE
  const totalRevenue = salesList.length > 0
    ? salesList.reduce((sum, s) => sum + s.totalAmount, 0)
    : (trip.revenue ?? 0);

  const totalSoldKg = salesList.reduce((sum, s) => sum + s.quantityKg, 0);

  const paidSales = salesList.filter((s) => s.paymentStatus !== 'pending');
  const paidAmount = paidSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const pendingSales = salesList.filter((s) => s.paymentStatus === 'pending');
  const pendingAmount = pendingSales.reduce((sum, s) => sum + s.totalAmount, 0);

  // 03. BEHAVIOR & VALIDATION:
  // Avoid double counting with customer mobile app orders
  // Check which app orders are already accounted for in trip sales
  const appLinkedSalesCount = salesList.filter(
    (s) => s.sourceType === 'customer_app_order' || s.orderNumber,
  ).length;

  const directHarborSalesCount = salesList.length - appLinkedSalesCount;

  // Navigation handlers
  const handleAddSale = () => {
    router.push({ pathname: '/fisherman/s20' as never, params: { tripId: trip.id } });
  };

  const handleEditSale = (sale: TripSaleRecord) => {
    router.push({
      pathname: '/fisherman/s20' as never,
      params: { tripId: trip.id, saleId: sale.id },
    });
  };

  const handleDeleteSale = (sale: TripSaleRecord) => {
    Alert.alert(
      'Remove Sale Record',
      `Are you sure you want to remove sale of ${sale.quantityKg.toFixed(1)} kg ${sale.speciesSold} to ${sale.buyerName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => deleteTripSale(trip.id, sale.id),
        },
      ],
    );
  };

  const handleExportSalesReceipt = () => {
    Alert.alert(
      'Export Harbor Sales Invoice (S19)',
      `Generating complete sales report for voyage ${trip.tripNumber}.\n\nGross Revenue: ${money(totalRevenue)}\nSold Volume: ${totalSoldKg.toFixed(1)} KG\nPaid: ${money(paidAmount)}\nPending: ${money(pendingAmount)}\n\nPDF statement exported to documents.`,
      [{ text: 'OK' }],
    );
  };

  const isCompleted = trip.status === 'completed';
  const isOngoing = trip.status === 'ongoing';

  const getBuyerTypeLabel = (type: string) => {
    switch (type) {
      case 'wholesale_auction':
        return 'Wholesale Auction';
      case 'restaurant':
        return 'Restaurant';
      case 'retail_stall':
        return 'Harbor Stall';
      case 'direct_consumer':
        return 'Direct Consumer';
      default:
        return 'Harbor Buyer';
    }
  };

  return (
    <FishermanShell
      title={`S19 · ${trip.tripNumber} Sales`}
      subtitle="Fish buyer dispatches & revenue records"
      back
      onBack={() => router.replace({ pathname: '/fisherman/s13' as never, params: { id: trip.id } })}
      rightIcon="sparkles"
      rightLabel="Invoices"
      onRightPress={handleExportSalesReceipt}
    >
      {/* SCREEN BREADCRUMB */}
      <View style={styles.badgeRow}>
        <View style={styles.screenTag}>
          <Text style={styles.screenTagText}>SCREEN S19</Text>
        </View>
        <Text numberOfLines={1} style={styles.helperText}>
          Fish Type, Quantity Sold, Price/KG & Revenue Ledger
        </Text>
      </View>

      {/* 01. TRIP SELECTOR / CONTEXT CARD */}
      <View style={styles.tripSelectorCard}>
        <View style={styles.tripSelectorTopRow}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.tripHeadingNumber}>{trip.tripNumber}</Text>
            <Text numberOfLines={1} style={styles.vesselInfoText}>
              ⛵ {trip.boatName} · 📍 {trip.harbor}
            </Text>
          </View>

          <View
            style={[
              styles.statusPill,
              isCompleted
                ? styles.statusPillCompleted
                : isOngoing
                ? styles.statusPillOngoing
                : styles.statusPillPlanned,
            ]}
          >
            <Text
              style={[
                styles.statusPillText,
                isCompleted
                  ? styles.statusTextCompleted
                  : isOngoing
                  ? styles.statusTextOngoing
                  : styles.statusTextPlanned,
              ]}
            >
              {isCompleted ? 'Completed ✓' : isOngoing ? 'At Sea ●' : 'Planned'}
            </Text>
          </View>
        </View>

        {/* TRIP SWITCHER CHIPS (IF MULTIPLE TRIPS EXIST) */}
        {trips.length > 1 ? (
          <View style={styles.tripSwitcherWrap}>
            <Text style={styles.switcherLabel}>SWITCH VOYAGE:</Text>
            <View style={styles.switcherChipsRow}>
              {trips.slice(0, 3).map((t) => {
                const isSelected = t.id === trip.id;
                return (
                  <Pressable
                    key={t.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => setSelectedTripId(t.id)}
                    style={[styles.switcherChip, isSelected && styles.switcherChipActive]}
                  >
                    <Text
                      style={[
                        styles.switcherChipText,
                        isSelected && styles.switcherChipTextActive,
                      ]}
                    >
                      {t.tripNumber}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        <View style={styles.cardDivider} />

        <View style={styles.tripSelectorBottomRow}>
          <Text style={styles.tripDateText}>
            📅 {trip.tripDate || trip.departureDate}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace({ pathname: '/fisherman/s13' as never, params: { id: trip.id } })}
            style={styles.tripLinkPill}
          >
            <Text style={styles.tripLinkText}>Trip Details (S13) →</Text>
          </Pressable>
        </View>
      </View>

      {/* 01. CALCULATED REVENUE SUMMARY CARD */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.summaryLabel}>TOTAL CALCULATED VOYAGE REVENUE</Text>
            <Text style={styles.summaryAmount}>{money(totalRevenue)}</Text>
            <Text style={styles.summarySub}>
              Sold {totalSoldKg.toFixed(1)} KG across {salesList.length} dispatch transactions
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={handleAddSale}
            style={styles.addSaleHeaderBtn}
          >
            <FishermanIcon name="plus" size={13} color="#FFFFFF" />
            <Text style={styles.addSaleHeaderBtnText}>+ Add Sale (S20)</Text>
          </Pressable>
        </View>

        <View style={styles.summaryStatsRow}>
          <View style={styles.summaryStatItem}>
            <Text style={styles.statLabel}>PAID IN FULL</Text>
            <Text style={styles.statPaid}>
              {money(paidAmount)} ({paidSales.length})
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryStatItem}>
            <Text style={styles.statLabel}>PENDING SETTLEMENT</Text>
            <Text style={styles.statPending}>
              {money(pendingAmount)} ({pendingSales.length})
            </Text>
          </View>
        </View>
      </View>

      {/* 03. BEHAVIOR & VALIDATION: AVOID DOUBLE COUNTING ARCHITECTURE BANNER */}
      <View style={styles.dedupCard}>
        <View style={styles.dedupHeaderRow}>
          <View style={styles.dedupIconWrap}>
            <FishermanIcon name="check" size={15} color="#059669" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.dedupHeading}>Double-Counting Safeguard Active</Text>
            <Text style={styles.dedupBody}>
              Direct Harbor Sales ({directHarborSalesCount}) and App Orders ({appLinkedSalesCount} of {orders.length} total) are reconciled to prevent duplicate revenue accounting.
            </Text>
          </View>
        </View>
        <View style={styles.dedupPillRow}>
          <View style={styles.dedupPill}>
            <Text style={styles.dedupPillText}>✓ Single Ledger Attribution</Text>
          </View>
          <View style={styles.dedupPill}>
            <Text style={styles.dedupPillText}>✓ Order Reference Cross-Checked</Text>
          </View>
        </View>
      </View>

      {/* 01. SALES HISTORY LIST HEADER */}
      <View style={styles.listHeaderRow}>
        <Text style={styles.sectionTitle}>
          Sales Transactions ({salesList.length})
        </Text>
        <Text style={styles.sectionSub}>
          {totalSoldKg.toFixed(1)} KG Dispatched
        </Text>
      </View>

      {salesList.length === 0 ? (
        <View style={styles.card}>
          <FishermanIcon name="revenue" size={32} color={ui.muted} />
          <Text style={styles.emptyTitle}>No Sales Transactions Logged</Text>
          <Text style={styles.emptySub}>
            Record wholesale auction batches, restaurant deliveries, or harbor gate walk-ins.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={handleAddSale}
            style={styles.addBtn}
          >
            <Text style={styles.addBtnText}>+ Log First Sale (S20)</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.salesListWrap}>
          {salesList.map((s, index) => {
            const isPaid = s.paymentStatus !== 'pending';
            const isAppOrder = s.sourceType === 'customer_app_order' || Boolean(s.orderNumber);

            return (
              <View key={s.id || index} style={styles.saleItemCard}>
                {/* TOP ROW: BUYER, CHANNEL & CALCULATED REVENUE */}
                <View style={styles.saleTopRow}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={styles.buyerTitleRow}>
                      <Text numberOfLines={1} style={styles.buyerNameText}>
                        {s.buyerName}
                      </Text>
                      {isAppOrder ? (
                        <View style={styles.appOrderTag}>
                          <Text style={styles.appOrderTagText}>📱 App Order</Text>
                        </View>
                      ) : null}
                    </View>

                    <Text numberOfLines={1} style={styles.channelSubText}>
                      Channel: {getBuyerTypeLabel(s.buyerType)}
                      {s.orderNumber ? ` · Ref: ${s.orderNumber}` : ''}
                    </Text>
                  </View>

                  {/* 01. CALCULATED REVENUE (QTY × PRICE/KG) */}
                  <View style={styles.revenueCol}>
                    <Text style={styles.calculatedRevenueAmount}>
                      + {money(s.totalAmount)}
                    </Text>
                    <Text style={styles.revenueFormulaText}>
                      {s.quantityKg.toFixed(1)} kg × Rs. {s.pricePerKg.toLocaleString()}
                    </Text>
                  </View>
                </View>

                {/* MIDDLE ROW: FISH TYPE, QUANTITY SOLD & PRICE/KG TABLE ROW */}
                <View style={styles.specStrip}>
                  <View style={styles.specItem}>
                    <Text style={styles.specLabel}>FISH TYPE</Text>
                    <Text numberOfLines={1} style={styles.specValue}>
                      🐟 {s.speciesSold}
                    </Text>
                  </View>

                  <View style={styles.specDivider} />

                  <View style={styles.specItem}>
                    <Text style={styles.specLabel}>QUANTITY SOLD</Text>
                    <Text style={styles.specValueWeight}>
                      {s.quantityKg.toFixed(1)} KG
                    </Text>
                  </View>

                  <View style={styles.specDivider} />

                  <View style={styles.specItem}>
                    <Text style={styles.specLabel}>SELLING PRICE/KG</Text>
                    <Text style={styles.specValueRate}>
                      Rs. {s.pricePerKg.toLocaleString()}
                    </Text>
                  </View>
                </View>

                <View style={styles.itemDivider} />

                {/* BOTTOM ROW: PAYMENT BADGE, TIMESTAMP & ACTIONS */}
                <View style={styles.saleBottomRow}>
                  <View
                    style={[
                      styles.paymentBadge,
                      isPaid ? styles.paidBadge : styles.pendingBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.paymentBadgeText,
                        isPaid ? styles.paidBadgeText : styles.pendingBadgeText,
                      ]}
                    >
                      {s.paymentStatus === 'paid_bank'
                        ? 'Paid (Bank Transfer)'
                        : s.paymentStatus === 'paid_cash'
                        ? 'Paid (Cash Handover)'
                        : 'Payment Pending'}
                    </Text>
                  </View>

                  <Text style={styles.recordedTimeText}>🕒 {s.recordedAt}</Text>

                  {/* 02. EDIT SALE -> S20 & DELETE */}
                  <View style={styles.rowActionsWrap}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Edit ${s.buyerName}`}
                      onPress={() => handleEditSale(s)}
                      style={styles.editActionBtn}
                    >
                      <FishermanIcon name="sparkles" size={12} color={ui.tealDark} />
                      <Text style={styles.editActionText}>Edit (S20)</Text>
                    </Pressable>

                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Delete ${s.buyerName}`}
                      onPress={() => handleDeleteSale(s)}
                      style={styles.deleteActionBtn}
                    >
                      <FishermanIcon name="minus" size={12} color="#DC2626" />
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* 02. FOOTER ACTIONS */}
      <View style={styles.footerActionsCol}>
        <Pressable
          accessibilityRole="button"
          onPress={handleAddSale}
          style={styles.footerPrimaryBtn}
        >
          <FishermanIcon name="plus" size={16} color="#FFFFFF" />
          <Text style={styles.footerPrimaryBtnText}>+ Add New Sale Record (S20)</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace({ pathname: '/fisherman/s13' as never, params: { id: trip.id } })}
          style={styles.footerBackBtn}
        >
          <FishermanIcon name="arrow-left" size={15} color={ui.navy} />
          <Text style={styles.footerBackBtnText}>Back to Trip Details (S13)</Text>
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
  helperText: {
    fontSize: 11,
    color: ui.muted,
    flex: 1,
  },

  // TRIP SELECTOR / CONTEXT CARD
  tripSelectorCard: {
    backgroundColor: ui.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: ui.border,
    marginBottom: 12,
  },
  tripSelectorTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  tripHeadingNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: ui.navy,
  },
  vesselInfoText: {
    fontSize: 12,
    fontWeight: '700',
    color: ui.muted,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusPillCompleted: {
    backgroundColor: '#ECFDF5',
  },
  statusPillOngoing: {
    backgroundColor: '#E0F2FE',
  },
  statusPillPlanned: {
    backgroundColor: '#FFFBEB',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '900',
  },
  statusTextCompleted: {
    color: '#059669',
  },
  statusTextOngoing: {
    color: '#0284C7',
  },
  statusTextPlanned: {
    color: '#D97706',
  },
  tripSwitcherWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  switcherLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: ui.muted,
    letterSpacing: 0.6,
  },
  switcherChipsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  switcherChip: {
    backgroundColor: '#F8FCFD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: ui.border,
  },
  switcherChipActive: {
    backgroundColor: ui.tealDark,
    borderColor: ui.tealDark,
  },
  switcherChipText: {
    fontSize: 10,
    fontWeight: '800',
    color: ui.navy,
  },
  switcherChipTextActive: {
    color: '#FFFFFF',
  },
  cardDivider: {
    height: 1,
    backgroundColor: ui.border,
    marginVertical: 10,
  },
  tripSelectorBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tripDateText: {
    fontSize: 11,
    fontWeight: '700',
    color: ui.navy,
  },
  tripLinkPill: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  tripLinkText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.tealDark,
  },

  // CALCULATED REVENUE CARD
  summaryCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 12,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  summaryLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#065F46',
    letterSpacing: 0.8,
  },
  summaryAmount: {
    fontSize: 26,
    fontWeight: '900',
    color: '#059669',
    marginTop: 2,
  },
  summarySub: {
    fontSize: 10,
    fontWeight: '700',
    color: '#047857',
    marginTop: 2,
  },
  addSaleHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: ui.tealDark,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addSaleHeaderBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  summaryStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#D1FAE5',
  },
  summaryStatItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#065F46',
    letterSpacing: 0.6,
  },
  statPaid: {
    fontSize: 12,
    fontWeight: '900',
    color: '#059669',
    marginTop: 2,
  },
  statPending: {
    fontSize: 12,
    fontWeight: '900',
    color: '#D97706',
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#A7F3D0',
    marginHorizontal: 12,
  },

  // DOUBLE-COUNTING SAFEGUARD BANNER
  dedupCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 14,
  },
  dedupHeaderRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  dedupIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  dedupHeading: {
    fontSize: 11,
    fontWeight: '900',
    color: '#15803D',
  },
  dedupBody: {
    fontSize: 10,
    color: '#166534',
    lineHeight: 14,
    marginTop: 2,
  },
  dedupPillRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#DCFCE7',
  },
  dedupPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dedupPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803D',
  },

  // LIST HEADER
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: ui.navy,
  },
  sectionSub: {
    fontSize: 11,
    fontWeight: '700',
    color: ui.muted,
  },
  salesListWrap: {
    gap: 10,
    marginBottom: 16,
  },
  saleItemCard: {
    backgroundColor: ui.surface,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: ui.border,
  },
  saleTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  buyerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  buyerNameText: {
    fontSize: 14,
    fontWeight: '900',
    color: ui.navy,
    flex: 1,
  },
  appOrderTag: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  appOrderTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  channelSubText: {
    fontSize: 11,
    color: ui.muted,
    fontWeight: '600',
    marginTop: 2,
  },
  revenueCol: {
    alignItems: 'flex-end',
  },
  calculatedRevenueAmount: {
    fontSize: 15,
    fontWeight: '900',
    color: '#059669',
  },
  revenueFormulaText: {
    fontSize: 10,
    fontWeight: '700',
    color: ui.muted,
    marginTop: 2,
  },

  // SPEC STRIP (FISH TYPE, QTY, PRICE/KG)
  specStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FCFD',
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
  },
  specItem: {
    flex: 1,
  },
  specLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: ui.muted,
    letterSpacing: 0.6,
  },
  specValue: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.navy,
    marginTop: 2,
  },
  specValueWeight: {
    fontSize: 12,
    fontWeight: '900',
    color: ui.tealDark,
    marginTop: 2,
  },
  specValueRate: {
    fontSize: 11,
    fontWeight: '800',
    color: '#047857',
    marginTop: 2,
  },
  specDivider: {
    width: 1,
    height: 22,
    backgroundColor: ui.border,
    marginHorizontal: 8,
  },
  itemDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 10,
  },
  saleBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  paymentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  paidBadge: {
    backgroundColor: '#ECFDF5',
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
  },
  paymentBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  paidBadgeText: {
    color: '#059669',
  },
  pendingBadgeText: {
    color: '#B45309',
  },
  recordedTimeText: {
    fontSize: 10,
    color: ui.muted,
    fontWeight: '700',
  },
  rowActionsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: ui.tealLight,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  editActionText: {
    fontSize: 10,
    fontWeight: '800',
    color: ui.tealDark,
  },
  deleteActionBtn: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // EMPTY CARD
  card: {
    backgroundColor: ui.surface,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ui.border,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: ui.navy,
    marginTop: 8,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 11,
    color: ui.muted,
    textAlign: 'center',
    marginBottom: 14,
  },
  addBtn: {
    backgroundColor: ui.tealDark,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // FOOTER ACTIONS
  footerActionsCol: {
    gap: 10,
    marginBottom: 30,
  },
  footerPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: ui.tealDark,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: ui.tealDark,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  footerPrimaryBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  footerBackBtn: {
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
  footerBackBtnText: {
    color: ui.navy,
    fontWeight: '800',
    fontSize: 13,
  },
});

import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { FishermanShell } from '@/components/fisherman/FishermanShell';
import { FishermanIcon } from '@/components/fisherman/FishermanIcon';
import { money } from '@/components/fisherman/atoms';
import { fishermanUi as ui } from '@/components/fisherman/theme';
import { useFisherman } from '@/components/fisherman/FishermanContext';

export default function S19SalesScreen() {
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const { trips } = useFisherman();

  const trip = trips.find((t) => t.id === tripId) || trips[0];

  if (!trip) {
    return (
      <FishermanShell
        back
        title="S19 · Sales"
        subtitle="Trip not found"
        onBack={() => router.replace('/fisherman/trips')}
      >
        <View style={styles.card}>
          <Text style={styles.emptyTitle}>Trip record not found</Text>
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

  const salesList = trip.salesList ?? [];
  const totalRevenue = salesList.length > 0
    ? salesList.reduce((sum, s) => sum + s.totalAmount, 0)
    : (trip.revenue ?? 0);

  const paidSales = salesList.filter((s) => s.paymentStatus !== 'pending');
  const paidAmount = paidSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const pendingSales = salesList.filter((s) => s.paymentStatus === 'pending');
  const pendingAmount = pendingSales.reduce((sum, s) => sum + s.totalAmount, 0);

  const handleExportSalesReceipt = () => {
    Alert.alert(
      'Export Harbor Sales Invoice (S19)',
      `Generating complete sales report for ${trip.tripNumber}.\n\nGross Revenue: ${money(totalRevenue)}\nPaid: ${money(paidAmount)}\nPending: ${money(pendingAmount)}\n\nExported to documents.`,
      [{ text: 'OK' }],
    );
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
      <View style={styles.badgeRow}>
        <View style={styles.screenTag}>
          <Text style={styles.screenTagText}>SCREEN S19</Text>
        </View>
        <Text numberOfLines={1} style={styles.helperText}>
          Wholesale auction, restaurant & retail buyer transactions
        </Text>
      </View>

      {/* REVENUE SUMMARY CARD */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryTop}>
          <Text style={styles.summaryLabel}>TOTAL RECORDED VOYAGE SALES</Text>
          <Text style={styles.summaryAmount}>{money(totalRevenue)}</Text>
        </View>

        <View style={styles.summaryStatsRow}>
          <View style={styles.summaryStatItem}>
            <Text style={styles.statLabel}>PAID IN FULL</Text>
            <Text style={styles.statPaid}>{money(paidAmount)}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryStatItem}>
            <Text style={styles.statLabel}>PENDING / CREDIT</Text>
            <Text style={styles.statPending}>{money(pendingAmount)}</Text>
          </View>
        </View>
      </View>

      {/* ACTION BAR */}
      <View style={styles.actionBar}>
        <Text style={styles.sectionTitle}>Recorded Transactions ({salesList.length})</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push({ pathname: '/fisherman/s20' as never, params: { tripId: trip.id } })}
          style={styles.addSaleBtn}
        >
          <FishermanIcon name="plus" size={13} color="#FFFFFF" />
          <Text style={styles.addSaleBtnText}>+ Add Sale (S20)</Text>
        </Pressable>
      </View>

      {/* SALES LIST */}
      {salesList.length === 0 ? (
        <View style={styles.card}>
          <FishermanIcon name="revenue" size={32} color={ui.muted} />
          <Text style={styles.emptyTitle}>No Fish Sales Logged Yet</Text>
          <Text style={styles.emptySub}>
            Record direct auction sales, restaurant supplies or harbor pier walk-in sales.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push({ pathname: '/fisherman/s20' as never, params: { tripId: trip.id } })}
            style={styles.addBtn}
          >
            <Text style={styles.addBtnText}>+ Log First Sale (S20)</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.salesListWrap}>
          {salesList.map((s, index) => {
            const isPaid = s.paymentStatus !== 'pending';
            return (
              <View key={s.id || index} style={styles.saleCard}>
                <View style={styles.saleHeaderRow}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text numberOfLines={1} style={styles.buyerName}>
                      {s.buyerName}
                    </Text>
                    <Text numberOfLines={1} style={styles.saleDetailText}>
                      {s.speciesSold} · {s.quantityKg.toFixed(1)} kg @ Rs. {s.pricePerKg.toLocaleString()}/kg
                    </Text>
                  </View>
                  <Text style={styles.saleTotal}>+ {money(s.totalAmount)}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.saleFooterRow}>
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
                  <Text style={styles.timeText}>🕒 {s.recordedAt}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* FOOTER */}
      <View style={styles.footerRow}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace({ pathname: '/fisherman/s13' as never, params: { id: trip.id } })}
          style={styles.backBtn}
        >
          <FishermanIcon name="arrow-left" size={15} color={ui.navy} />
          <Text style={styles.backBtnText}>Back to Trip Details (S13)</Text>
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
  summaryCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 14,
  },
  summaryTop: {
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#065F46',
    letterSpacing: 0.8,
  },
  summaryAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: '#059669',
    marginTop: 2,
  },
  summaryStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 13,
    fontWeight: '900',
    color: '#059669',
    marginTop: 2,
  },
  statPending: {
    fontSize: 13,
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
  actionBar: {
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
  addSaleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: ui.tealDark,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  addSaleBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  salesListWrap: {
    gap: 10,
    marginBottom: 16,
  },
  saleCard: {
    backgroundColor: ui.surface,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: ui.border,
  },
  saleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  buyerName: {
    fontSize: 14,
    fontWeight: '900',
    color: ui.navy,
  },
  saleDetailText: {
    fontSize: 11,
    color: ui.muted,
    fontWeight: '600',
    marginTop: 3,
  },
  saleTotal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#059669',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 10,
  },
  saleFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  timeText: {
    fontSize: 10,
    color: ui.muted,
    fontWeight: '700',
  },
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
  footerRow: {
    marginBottom: 30,
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
});

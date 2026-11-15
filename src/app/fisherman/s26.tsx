import { useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { FishermanShell } from '@/components/fisherman/FishermanShell';
import { FishermanIcon } from '@/components/fisherman/FishermanIcon';
import { EmptyStateCard, SectionHeader, money } from '@/components/fisherman/atoms';
import { fishermanUi as ui } from '@/components/fisherman/theme';
import { useFisherman } from '@/components/fisherman/FishermanContext';
import type {
  FishermanPaymentTransaction,
  PaymentMethodType,
  PaymentStatusType,
} from '@/types';

type FilterTab = 'all' | PaymentStatusType;

const STATUS_FILTERS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All Transactions' },
  { key: 'paid', label: 'Paid' },
  { key: 'pending', label: 'Pending' },
  { key: 'failed', label: 'Failed' },
  { key: 'refunded', label: 'Refunded' },
];

export default function S26PaymentDetailsScreen() {
  const params = useLocalSearchParams<{
    id?: string;
    orderNumber?: string;
    txnRef?: string;
    from?: string;
  }>();

  const { transactions, updateTransactionStatus } = useFisherman();
  const [filter, setFilter] = useState<FilterTab>('all');

  // Find target transaction if specified in params
  const initialTxn = useMemo(() => {
    if (params.txnRef) {
      return transactions.find((t) => t.transactionRef === params.txnRef);
    }
    if (params.orderNumber) {
      return transactions.find((t) => t.orderNumber === params.orderNumber);
    }
    if (params.id) {
      return transactions.find((t) => t.id === params.id || t.orderId === params.id);
    }
    return transactions[0];
  }, [transactions, params.txnRef, params.orderNumber, params.id]);

  const [selectedTxnId, setSelectedTxnId] = useState<string>(
    initialTxn ? initialTxn.id : transactions[0]?.id || '',
  );

  // Active selected transaction
  const activeTxn = useMemo(() => {
    return (
      transactions.find((t) => t.id === selectedTxnId) ||
      initialTxn ||
      transactions[0]
    );
  }, [transactions, selectedTxnId, initialTxn]);

  // Filtered transactions for the history list
  const filteredTransactions = useMemo(() => {
    if (filter === 'all') return transactions;
    return transactions.filter((t) => t.status === filter);
  }, [transactions, filter]);

  // 02. BUTTONS & NAVIGATION: VIEW RELATED ORDER -> S23
  const handleViewRelatedOrder = (txn: FishermanPaymentTransaction) => {
    router.push({
      pathname: '/fisherman/s23' as never,
      params: {
        id: txn.orderId,
        orderNumber: txn.orderNumber,
      },
    });
  };

  // Back navigation
  const handleBack = () => {
    if (params.from === 's23' && activeTxn) {
      router.replace({
        pathname: '/fisherman/s23' as never,
        params: { id: activeTxn.orderId, orderNumber: activeTxn.orderNumber },
      });
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/fisherman/s22');
    }
  };

  // Call customer shortcut
  const handleCallCustomer = () => {
    if (!activeTxn) return;
    const phone = activeTxn.customerPhone || '077 344 1902';
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Phone Call', `Dialing ${phone} for ${activeTxn.customerName}`);
    });
  };

  // Quick toggle status for demo interactivity
  const handleToggleStatus = (nextStatus: PaymentStatusType) => {
    if (!activeTxn) return;
    updateTransactionStatus(activeTxn.id, nextStatus);
    Alert.alert(
      'Payment Status Updated (Demo)',
      `Transaction ${activeTxn.transactionRef} status updated to: ${nextStatus.toUpperCase()}.`,
    );
  };

  // Status badge styling helper
  const renderStatusBadge = (status: PaymentStatusType) => {
    const configMap: Record<
      PaymentStatusType,
      { label: string; bg: string; text: string }
    > = {
      paid: { label: '● Paid & Settled', bg: '#ECFDF5', text: '#059669' },
      pending: { label: '○ Pending Handover', bg: '#FEF3C7', text: '#D97706' },
      failed: { label: '✕ Transaction Failed', bg: '#FEF2F2', text: '#DC2626' },
      refunded: { label: '↺ Refunded to Buyer', bg: '#F3E8FF', text: '#7C3AED' },
    };
    const c = configMap[status] || configMap.pending;

    return (
      <View style={[styles.statusBadge, { backgroundColor: c.bg }]}>
        <Text style={[styles.statusBadgeText, { color: c.text }]}>{c.label}</Text>
      </View>
    );
  };

  // Method badge styling helper
  const renderMethodBadge = (method: PaymentMethodType) => {
    const isCod = method === 'COD';
    return (
      <View style={[styles.methodBadge, isCod ? styles.methodCod : styles.methodOnline]}>
        <Text style={[styles.methodBadgeText, isCod ? styles.methodCodText : styles.methodOnlineText]}>
          {isCod ? '💵 COD' : '💳 Online'}
        </Text>
      </View>
    );
  };

  return (
    <FishermanShell
      title="S26 · Payment Details"
      subtitle="Order transactions, settlement status & audit"
      back
      onBack={handleBack}
      rightIcon="bag"
      rightLabel="Orders"
      onRightPress={() => router.replace('/fisherman/s22')}
    >
      {/* SCREEN TAG & BADGES */}
      <View style={styles.badgeRow}>
        <View style={styles.screenTag}>
          <Text style={styles.screenTagText}>SCREEN S26</Text>
        </View>
        <Text numberOfLines={1} style={styles.screenSub}>
          PAYMENT & SETTLEMENT RECORD
        </Text>
      </View>

      {/* 03. BEHAVIOR & VALIDATION: SECURITY SAFEGUARD BANNER */}
      <View style={styles.securityBanner}>
        <FishermanIcon name="sparkles" size={14} color="#0E7490" />
        <View style={{ flex: 1 }}>
          <Text style={styles.securityTitle}>
            Demo Data Only in Frontend (PCI-DSS Safeguard)
          </Text>
          <Text style={styles.securityBody}>
            Real credit/debit card numbers or CVV codes are NEVER stored or requested.
            All online transactions use simulated sandbox tokens and demo receipts.
          </Text>
        </View>
      </View>

      {/* 01. ACTIVE TRANSACTION SPOTLIGHT CARD */}
      {activeTxn && (
        <View style={styles.spotlightCard}>
          {/* TOP ROW: REFERENCE, DATE & STATUS */}
          <View style={styles.spotlightHeaderRow}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={styles.refRow}>
                <View style={styles.refPill}>
                  <Text style={styles.refPillText}>
                    {activeTxn.transactionRef}
                  </Text>
                </View>
                {renderMethodBadge(activeTxn.method)}
              </View>

              <Text style={styles.spotlightDateText}>
                📅 {activeTxn.transactionDate}
              </Text>
            </View>

            {/* 01. PAID / PENDING / FAILED / REFUNDED STATUS */}
            {renderStatusBadge(activeTxn.status)}
          </View>

          <View style={styles.divider} />

          {/* 01. AMOUNT HERO ROW */}
          <View style={styles.amountHeroRow}>
            <View>
              <Text style={styles.amountEyebrow}>TRANSACTION AMOUNT</Text>
              <Text style={styles.amountLarge}>{money(activeTxn.amount)}</Text>
            </View>

            <View style={styles.netPayoutBox}>
              <Text style={styles.netPayoutLabel}>Net Payout</Text>
              <Text style={styles.netPayoutValue}>
                {money(activeTxn.netPayout || activeTxn.amount)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* 01. CUSTOMER & ORDER DETAILS ROW */}
          <View style={styles.metaGrid}>
            {/* 01. CUSTOMER */}
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>CUSTOMER / BUYER</Text>
              <Text numberOfLines={1} style={styles.metaValueBold}>
                {activeTxn.customerName}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={handleCallCustomer}
                style={styles.callShortcutRow}
              >
                <FishermanIcon name="phone" size={12} color={ui.tealDark} />
                <Text style={styles.callShortcutText}>
                  {activeTxn.customerPhone || '077 344 1902'}
                </Text>
              </Pressable>
            </View>

            {/* 01. ORDER REFERENCE */}
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>RELATED ORDER</Text>
              <Text style={styles.metaValueBold}>{activeTxn.orderNumber}</Text>
              <Text style={styles.metaSub}>Catch delivery pre-order</Text>
            </View>
          </View>

          {/* PAYMENT METHOD & GATEWAY SPECIFICATION */}
          <View style={styles.methodDetailBox}>
            <Text style={styles.methodDetailTitle}>
              {activeTxn.method === 'COD'
                ? '💵 Cash on Delivery Handover'
                : '💳 Online Digital IPG Payment'}
            </Text>
            <Text style={styles.methodDetailSub}>
              {activeTxn.paymentChannel ||
                (activeTxn.method === 'COD'
                  ? 'Harbor delivery courier receives cash and remits to fisherman.'
                  : 'Processed via LankaPay / Visa IPG (Demo Sandbox Token).')}
            </Text>
            {activeTxn.cardLastFour && (
              <Text style={styles.cardTokenText}>
                Simulated Card: Visa Ending in {activeTxn.cardLastFour}
              </Text>
            )}
            {activeTxn.bankAccountRef && (
              <Text style={styles.bankAccountText}>
                Payout Destination: {activeTxn.bankAccountRef}
              </Text>
            )}
          </View>

          {/* 02. BUTTONS & NAVIGATION: VIEW RELATED ORDER -> S23 */}
          <View style={styles.actionRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`View related order ${activeTxn.orderNumber} in Screen S23`}
              onPress={() => handleViewRelatedOrder(activeTxn)}
              style={styles.viewOrderBtn}
            >
              <FishermanIcon name="bag" size={16} color="#FFFFFF" />
              <Text style={styles.viewOrderBtnText}>
                View Related Order ({activeTxn.orderNumber}) → S23
              </Text>
            </Pressable>
          </View>

          {/* DEMO STATUS OVERRIDE CONTROLS */}
          <View style={styles.statusOverrideRow}>
            <Text style={styles.overrideLabel}>Demo Status Switch:</Text>
            {(['paid', 'pending', 'failed', 'refunded'] as const).map((st) => (
              <Pressable
                key={st}
                accessibilityRole="button"
                onPress={() => handleToggleStatus(st)}
                style={[
                  styles.overridePill,
                  activeTxn.status === st && styles.overridePillActive,
                ]}
              >
                <Text
                  style={[
                    styles.overridePillText,
                    activeTxn.status === st && styles.overridePillTextActive,
                  ]}
                >
                  {st.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* TRANSACTION HISTORY AUDIT LOG */}
      <SectionHeader
        title="Payment & Transaction History"
        subtitle="Itemized audit of customer settlements"
        count={filteredTransactions.length}
      />

      {/* 01. PAID / PENDING / FAILED / REFUNDED FILTERS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        {STATUS_FILTERS.map((f) => {
          const selected = filter === f.key;
          const count =
            f.key === 'all'
              ? transactions.length
              : transactions.filter((t) => t.status === f.key).length;

          return (
            <Pressable
              key={f.key}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setFilter(f.key)}
              style={[styles.filterChip, selected && styles.filterChipSelected]}
            >
              <Text
                style={[
                  styles.filterText,
                  selected && styles.filterTextSelected,
                ]}
              >
                {f.label}
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

      {/* TRANSACTIONS LIST */}
      {filteredTransactions.length === 0 ? (
        <EmptyStateCard
          title="No Transactions Found"
          description={`There are currently no transactions matching the "${filter}" filter.`}
          icon="bag"
          actionText="Show All Transactions"
          onAction={() => setFilter('all')}
        />
      ) : (
        <View style={styles.transactionsList}>
          {filteredTransactions.map((txn) => {
            const isSelected = activeTxn?.id === txn.id;

            return (
              <Pressable
                key={txn.id}
                accessibilityRole="button"
                accessibilityLabel={`Transaction ${txn.transactionRef} for ${txn.customerName}`}
                onPress={() => setSelectedTxnId(txn.id)}
                style={[
                  styles.txnCard,
                  isSelected && styles.txnCardSelected,
                ]}
              >
                <View style={styles.txnCardHeader}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={styles.txnRefBadgeRow}>
                      <Text style={styles.txnRefText}>{txn.transactionRef}</Text>
                      {renderMethodBadge(txn.method)}
                    </View>
                    <Text numberOfLines={1} style={styles.txnCustomerName}>
                      {txn.customerName} · {txn.orderNumber}
                    </Text>
                    <Text style={styles.txnDateSmall}>{txn.transactionDate}</Text>
                  </View>

                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <Text style={styles.txnAmount}>{money(txn.amount)}</Text>
                    {renderStatusBadge(txn.status)}
                  </View>
                </View>

                {/* 02. BUTTONS & NAVIGATION: VIEW RELATED ORDER -> S23 SHORTCUT */}
                <View style={styles.txnCardFooter}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => handleViewRelatedOrder(txn)}
                    style={styles.cardViewOrderLink}
                  >
                    <Text style={styles.cardViewOrderText}>
                      View Order ({txn.orderNumber}) → S23
                    </Text>
                  </Pressable>

                  {isSelected && (
                    <Text style={styles.selectedPill}>Active Focus</Text>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* FOOTER ACTION: RETURN TO ORDERS S22 */}
      <View style={styles.footerSection}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/fisherman/s22')}
          style={styles.backOrdersBtn}
        >
          <FishermanIcon name="arrow-left" size={16} color={ui.navy} />
          <Text style={styles.backOrdersBtnText}>Return to Orders List (S22)</Text>
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
  screenSub: {
    fontSize: 9,
    fontWeight: '900',
    color: ui.muted,
    letterSpacing: 0.8,
    flex: 1,
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F0FDFA',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#99F6E4',
    marginBottom: 14,
  },
  securityTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0E7490',
  },
  securityBody: {
    fontSize: 10,
    color: '#155E75',
    marginTop: 2,
    lineHeight: 14,
  },
  spotlightCard: {
    backgroundColor: ui.surface,
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
  spotlightHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  refRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  refPill: {
    backgroundColor: ui.tealLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  refPillText: {
    fontSize: 12,
    fontWeight: '900',
    color: ui.tealDark,
    letterSpacing: 0.5,
  },
  spotlightDateText: {
    fontSize: 10,
    color: ui.muted,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: ui.borderSubtle,
    marginVertical: 12,
  },
  amountHeroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountEyebrow: {
    fontSize: 9,
    fontWeight: '900',
    color: ui.muted,
    letterSpacing: 1,
  },
  amountLarge: {
    fontSize: 26,
    fontWeight: '900',
    color: ui.navy,
    letterSpacing: -0.5,
    marginTop: 2,
  },
  netPayoutBox: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'flex-end',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  netPayoutLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#065F46',
  },
  netPayoutValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#047857',
    marginTop: 1,
  },
  metaGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: ui.muted,
    letterSpacing: 0.8,
  },
  metaValueBold: {
    fontSize: 12,
    fontWeight: '900',
    color: ui.navy,
    marginTop: 2,
  },
  callShortcutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  callShortcutText: {
    fontSize: 11,
    fontWeight: '700',
    color: ui.tealDark,
  },
  metaSub: {
    fontSize: 10,
    color: ui.muted,
    marginTop: 2,
  },
  methodDetailBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  methodDetailTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: ui.navy,
  },
  methodDetailSub: {
    fontSize: 10,
    color: ui.muted,
    marginTop: 2,
    lineHeight: 14,
  },
  cardTokenText: {
    fontSize: 10,
    fontWeight: '800',
    color: ui.tealDark,
    marginTop: 4,
  },
  bankAccountText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4338CA',
    marginTop: 2,
  },
  actionRow: {
    marginTop: 14,
  },
  viewOrderBtn: {
    backgroundColor: ui.teal,
    height: 46,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: ui.teal,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  viewOrderBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  statusOverrideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: ui.borderSubtle,
    flexWrap: 'wrap',
  },
  overrideLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: ui.muted,
  },
  overridePill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: ui.bg,
    borderWidth: 1,
    borderColor: ui.border,
  },
  overridePillActive: {
    backgroundColor: ui.tealDark,
    borderColor: ui.tealDark,
  },
  overridePillText: {
    fontSize: 9,
    fontWeight: '900',
    color: ui.navy,
  },
  overridePillTextActive: {
    color: '#FFFFFF',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '900',
  },
  methodBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  methodBadgeText: {
    fontSize: 10,
    fontWeight: '900',
  },
  methodCod: {
    backgroundColor: '#FEF3C7',
  },
  methodCodText: {
    color: '#92400E',
    fontSize: 10,
    fontWeight: '900',
  },
  methodOnline: {
    backgroundColor: '#E0F2FE',
  },
  methodOnlineText: {
    color: '#0369A1',
    fontSize: 10,
    fontWeight: '900',
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
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: ui.surface,
    borderWidth: 1,
    borderColor: ui.border,
  },
  filterChipSelected: {
    backgroundColor: ui.teal,
    borderColor: ui.teal,
  },
  filterText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.navy,
  },
  filterTextSelected: {
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
  transactionsList: {
    gap: 10,
    marginBottom: 20,
  },
  txnCard: {
    backgroundColor: ui.surface,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: ui.border,
  },
  txnCardSelected: {
    borderColor: ui.teal,
    backgroundColor: '#F7FCFC',
    borderWidth: 1.5,
  },
  txnCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  txnRefBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  txnRefText: {
    fontSize: 11,
    fontWeight: '900',
    color: ui.tealDark,
  },
  txnCustomerName: {
    fontSize: 12,
    fontWeight: '900',
    color: ui.navy,
  },
  txnDateSmall: {
    fontSize: 9,
    color: ui.muted,
    marginTop: 2,
  },
  txnAmount: {
    fontSize: 14,
    fontWeight: '900',
    color: ui.navy,
  },
  txnCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: ui.borderSubtle,
  },
  cardViewOrderLink: {
    alignSelf: 'flex-start',
  },
  cardViewOrderText: {
    fontSize: 10,
    fontWeight: '800',
    color: ui.tealDark,
  },
  selectedPill: {
    fontSize: 9,
    fontWeight: '900',
    color: ui.tealDark,
    backgroundColor: ui.tealLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  footerSection: {
    marginTop: 6,
    marginBottom: 30,
  },
  backOrdersBtn: {
    backgroundColor: ui.surface,
    borderWidth: 1.5,
    borderColor: ui.border,
    height: 48,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  backOrdersBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: ui.navy,
  },
});

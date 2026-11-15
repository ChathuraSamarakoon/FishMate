import { useMemo } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { FishermanShell } from '@/components/fisherman/FishermanShell';
import { FishermanIcon } from '@/components/fisherman/FishermanIcon';
import { OrderStatusBadge, SectionHeader, money } from '@/components/fisherman/atoms';
import { fishermanUi as ui } from '@/components/fisherman/theme';
import { useFisherman } from '@/components/fisherman/FishermanContext';

export default function S23OrderDetailsScreen() {
  const params = useLocalSearchParams<{ id?: string; orderNumber?: string }>();
  const { orders } = useFisherman();

  // Find the target order by ID or orderNumber
  const order = useMemo(() => {
    return (
      orders.find((o) => o.id === params.id || o.orderNumber === params.orderNumber) ||
      orders[0]
    );
  }, [orders, params.id, params.orderNumber]);

  // 02. BUTTONS & NAVIGATION: BACK -> S22
  const handleBackToS22 = () => {
    router.replace('/fisherman/s22');
  };

  if (!order) {
    return (
      <FishermanShell
        title="S23 · Order Details"
        subtitle="Customer order details"
        back
        onBack={handleBackToS22}
      >
        <View style={styles.notFoundCard}>
          <Text style={styles.notFoundTitle}>Order Not Found</Text>
          <Text style={styles.notFoundSub}>
            The customer order you requested could not be found.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={handleBackToS22}
            style={styles.backBtn}
          >
            <Text style={styles.backBtnText}>Back to Orders List (S22)</Text>
          </Pressable>
        </View>
      </FishermanShell>
    );
  }

  // Financial calculations: Subtotal, delivery fee, total
  const calculatedSubtotal = order.subtotal
    ? order.subtotal
    : order.items.reduce((sum, item) => sum + item.totalPrice, 0) ||
      Math.max(0, order.totalAmount - (order.deliveryFee ?? 350));

  const deliveryFee = order.deliveryFee ?? 350;
  const grandTotal = order.totalAmount;

  // Payment information derivation
  const paymentMethodLabel =
    order.paymentMethod === 'bank_transfer'
      ? 'Bank Transfer (Direct Payout)'
      : order.paymentMethod === 'online_card'
      ? 'Online Card (Pre-paid)'
      : 'Cash on Delivery (Harbor Handover)';

  const isPaid =
    order.paymentStatus === 'paid' ||
    order.status === 'delivered' ||
    order.status === 'completed';

  // 02. BUTTONS & NAVIGATION: ACCEPT / REJECT -> S24
  const handleAcceptReject = (presetAction?: 'accept' | 'reject') => {
    router.push({
      pathname: '/fisherman/s24' as never,
      params: {
        id: order.id,
        orderNumber: order.orderNumber,
        initialAction: presetAction || 'accept',
      },
    });
  };

  // 02. BUTTONS & NAVIGATION: MANAGE DELIVERY -> S25
  const handleManageDelivery = () => {
    router.push({
      pathname: '/fisherman/s25' as never,
      params: {
        id: order.id,
        orderNumber: order.orderNumber,
      },
    });
  };

  // Direct phone call handler
  const handleCallCustomer = () => {
    if (order.customerPhone) {
      Linking.openURL(`tel:${order.customerPhone}`).catch(() => {
        Alert.alert('Phone Call', `Dialing ${order.customerPhone} for ${order.customerName}`);
      });
    } else {
      Alert.alert('Customer Phone', 'No telephone number recorded for this buyer.');
    }
  };

  // Direct SMS message handler
  const handleMessageCustomer = () => {
    if (order.customerPhone) {
      Linking.openURL(`sms:${order.customerPhone}`).catch(() => {
        Alert.alert('Message Buyer', `Sending SMS update to ${order.customerPhone}`);
      });
    } else {
      Alert.alert('Customer Phone', 'No telephone number recorded for this buyer.');
    }
  };

  // Status conditions
  const isPending = order.status === 'pending';
  const isCancelled = order.status === 'cancelled';
  const isDelivered = order.status === 'delivered' || order.status === 'completed';
  const isProcessing =
    order.status === 'confirmed' ||
    order.status === 'preparing' ||
    order.status === 'ready' ||
    order.status === 'dispatched';

  return (
    <FishermanShell
      title={`S23 · ${order.orderNumber}`}
      subtitle="Customer order verification & dispatch audit"
      back
      onBack={handleBackToS22}
      rightIcon="phone"
      rightLabel="Call Buyer"
      onRightPress={handleCallCustomer}
    >
      {/* SCREEN TAG & BADGES */}
      <View style={styles.badgeRow}>
        <View style={styles.screenTag}>
          <Text style={styles.screenTagText}>SCREEN S23</Text>
        </View>
        <Text numberOfLines={1} style={styles.helperText}>
          Order breakdown, buyer contact & status controls
        </Text>
      </View>

      {/* 01. HERO CARD: ORDER ID, DATE & STATUS */}
      <View style={styles.heroCard}>
        <View style={styles.heroHeaderRow}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={styles.orderIdBadge}>
              <Text style={styles.orderIdText}>{order.orderNumber}</Text>
            </View>
            <Text style={styles.orderDateText}>
              Placed on {order.createdAt}
            </Text>
          </View>

          {/* 01. ORDER STATUS BADGE */}
          <OrderStatusBadge status={order.status} />
        </View>

        {/* WORKFLOW TIMELINE */}
        <View style={styles.timelineContainer}>
          {(
            [
              { key: 'pending', label: '1. Received' },
              { key: 'confirmed', label: '2. Confirmed' },
              { key: 'preparing', label: '3. Preparing' },
              { key: 'delivered', label: '4. Delivered' },
            ] as const
          ).map((step, idx) => {
            const isStepActive = order.status === step.key;
            const isPast =
              (order.status === 'confirmed' && step.key === 'pending') ||
              (order.status === 'preparing' &&
                (step.key === 'pending' || step.key === 'confirmed')) ||
              (isDelivered && step.key !== 'delivered');

            return (
              <View key={step.key} style={styles.timelineItem}>
                <View
                  style={[
                    styles.timelineDot,
                    isStepActive && styles.timelineDotActive,
                    isPast && styles.timelineDotPast,
                  ]}
                >
                  <Text
                    style={[
                      styles.timelineDotNum,
                      (isStepActive || isPast) && styles.timelineDotNumActive,
                    ]}
                  >
                    {idx + 1}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.timelineLabel,
                    isStepActive && styles.timelineLabelActive,
                  ]}
                >
                  {step.label}
                </Text>
              </View>
            );
          })}
        </View>

        {/* 03. BEHAVIOR & VALIDATION: BUTTONS SHOWN ONLY FOR RELEVANT STATUS */}
        <View style={styles.actionControlsSection}>
          {/* WHEN STATUS IS PENDING: SHOW ACCEPT/REJECT -> S24 */}
          {isPending && (
            <View style={styles.pendingActionWrap}>
              <Text style={styles.actionGuideTitle}>
                Action Required: Customer Awaiting Order Confirmation
              </Text>
              <View style={styles.pendingBtnRow}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Accept Order and Proceed to S24"
                  onPress={() => handleAcceptReject('accept')}
                  style={styles.acceptPrimaryBtn}
                >
                  <FishermanIcon name="check" size={16} color="#FFFFFF" />
                  <Text style={styles.acceptPrimaryBtnText}>
                    Accept Order (S24)
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Reject Order and Proceed to S24"
                  onPress={() => handleAcceptReject('reject')}
                  style={styles.rejectSecondaryBtn}
                >
                  <Text style={styles.rejectSecondaryBtnText}>
                    Reject (S24)
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* WHEN STATUS IS CONFIRMED / PREPARING / READY / DISPATCHED: SHOW MANAGE DELIVERY -> S25 */}
          {isProcessing && (
            <View style={styles.processingActionWrap}>
              <View style={styles.processingBanner}>
                <FishermanIcon name="sparkles" size={14} color={ui.tealDark} />
                <Text style={styles.processingBannerText}>
                  Order confirmed and in preparation. Ready to coordinate handover?
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Manage Delivery in Screen S25"
                onPress={handleManageDelivery}
                style={styles.manageDeliveryBtn}
              >
                <FishermanIcon name="boat" size={16} color="#FFFFFF" />
                <Text style={styles.manageDeliveryBtnText}>
                  Manage Delivery & Dispatch (S25) →
                </Text>
              </Pressable>
            </View>
          )}

          {/* WHEN STATUS IS DELIVERED: SHOW COMPLETION BANNER */}
          {isDelivered && (
            <View style={styles.deliveredSuccessBanner}>
              <FishermanIcon name="check" size={16} color={ui.success} />
              <View style={{ flex: 1 }}>
                <Text style={styles.deliveredSuccessTitle}>
                  Delivered & Handed Over Successfully
                </Text>
                <Text style={styles.deliveredSuccessSub}>
                  Proof of delivery logged and revenue credited to daily sales tally.
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={handleManageDelivery}
                style={styles.viewPodBtn}
              >
                <Text style={styles.viewPodText}>View POD (S25)</Text>
              </Pressable>
            </View>
          )}

          {/* WHEN STATUS IS CANCELLED: SHOW REJECTION NOTICE */}
          {isCancelled && (
            <View style={styles.cancelledBanner}>
              <FishermanIcon name="alert" size={16} color={ui.danger} />
              <View style={{ flex: 1 }}>
                <Text style={styles.cancelledTitle}>Order Cancelled</Text>
                <Text style={styles.cancelledSub}>
                  {order.rejectionReason ||
                    'This order was declined or cancelled. Catch inventory restored.'}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* 01. CUSTOMER PHONE & NAME CARD */}
      <SectionHeader
        title="Customer Contact"
        subtitle="Buyer details & direct communications"
      />

      <View style={styles.customerCard}>
        <View style={styles.customerTopRow}>
          <View style={styles.customerAvatarBox}>
            <FishermanIcon name="user" size={18} color={ui.tealDark} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text numberOfLines={1} style={styles.customerNameText}>
              {order.customerName}
            </Text>
            <Text style={styles.customerPhoneText}>
              {order.customerPhone || '077 344 1902'}
            </Text>
          </View>

          <View style={styles.commActionsRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Call Customer"
              onPress={handleCallCustomer}
              style={styles.commBtn}
            >
              <FishermanIcon name="phone" size={16} color={ui.tealDark} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Message Customer"
              onPress={handleMessageCustomer}
              style={styles.commBtn}
            >
              <FishermanIcon name="message" size={16} color={ui.tealDark} />
            </Pressable>
          </View>
        </View>

        <View style={styles.cardDivider} />

        {/* 01. DELIVERY ADDRESS */}
        <View style={styles.addressSection}>
          <View style={styles.addressRow}>
            <FishermanIcon name="pin" size={15} color={ui.muted} />
            <View style={{ flex: 1 }}>
              <Text style={styles.addressLabel}>DELIVERY DESTINATION</Text>
              <Text style={styles.addressValue}>
                {order.customerLocation}
              </Text>
              <Text style={styles.addressSchedule}>
                Target Dispatch: {order.deliveryTime}
              </Text>
            </View>
          </View>

          {/* CUSTOMER PREPARATION NOTE */}
          {order.note ? (
            <View style={styles.specialNoteBox}>
              <Text style={styles.specialNoteHeading}>
                💬 Customer Preparation Note:
              </Text>
              <Text style={styles.specialNoteText}>{order.note}</Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* 01. ORDERED FISH, QTY, UNIT PRICE TABLE */}
      <SectionHeader
        title="Ordered Catch Items"
        subtitle="Species, portions, quantity & unit prices"
        count={order.items.length}
      />

      <View style={styles.itemsCard}>
        {/* TABLE HEADER */}
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.tableColHeader, { flex: 2 }]}>FISH ITEM</Text>
          <Text style={[styles.tableColHeader, { flex: 1, textAlign: 'center' }]}>QTY (KG)</Text>
          <Text style={[styles.tableColHeader, { flex: 1.2, textAlign: 'right' }]}>UNIT PRICE</Text>
          <Text style={[styles.tableColHeader, { flex: 1.3, textAlign: 'right' }]}>TOTAL</Text>
        </View>

        {/* ITEM ROWS */}
        {order.items.map((item, idx) => (
          <View
            key={idx}
            style={[styles.tableItemRow, idx > 0 && styles.tableItemRowBorder]}
          >
            <View style={{ flex: 2 }}>
              <Text style={styles.itemFishName}>{item.fishName}</Text>
              <Text style={styles.itemCutSub}>Fresh landed cut</Text>
            </View>
            <Text style={[styles.itemQtyText, { flex: 1, textAlign: 'center' }]}>
              {item.quantityKg} kg
            </Text>
            <Text style={[styles.itemUnitPriceText, { flex: 1.2, textAlign: 'right' }]}>
              {money(item.pricePerKg)}
            </Text>
            <Text style={[styles.itemLineTotalText, { flex: 1.3, textAlign: 'right' }]}>
              {money(item.totalPrice)}
            </Text>
          </View>
        ))}

        <View style={styles.cardDivider} />

        {/* 01. SUBTOTAL, DELIVERY FEE, TOTAL */}
        <View style={styles.totalsSection}>
          <View style={styles.totalLineRow}>
            <Text style={styles.totalLineLabel}>Catch Items Subtotal</Text>
            <Text style={styles.totalLineAmount}>{money(calculatedSubtotal)}</Text>
          </View>

          <View style={styles.totalLineRow}>
            <Text style={styles.totalLineLabel}>Ice-box Delivery & Packaging Fee</Text>
            <Text style={styles.totalLineAmount}>{money(deliveryFee)}</Text>
          </View>

          <View style={styles.grandTotalDivider} />

          <View style={styles.grandTotalRow}>
            <View>
              <Text style={styles.grandTotalLabel}>ORDER GRAND TOTAL</Text>
              <Text style={styles.grandTotalTaxSub}>Inclusive of harbor handling</Text>
            </View>
            <Text style={styles.grandTotalAmount}>{money(grandTotal)}</Text>
          </View>
        </View>
      </View>

      {/* 01. PAYMENT METHOD & STATUS */}
      <SectionHeader
        title="Payment & Settlement"
        subtitle="Payment method and transaction state"
      />

      <View style={styles.paymentCard}>
        <View style={styles.paymentRow}>
          <View style={styles.paymentIconBox}>
            <FishermanIcon name="revenue" size={16} color={ui.tealDark} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.paymentLabel}>PAYMENT METHOD</Text>
            <Text style={styles.paymentValue}>{paymentMethodLabel}</Text>
          </View>
          <View
            style={[
              styles.paymentStatusBadge,
              isPaid ? styles.payStatusPaid : styles.payStatusPending,
            ]}
          >
            <Text
              style={[
                styles.payStatusText,
                isPaid ? styles.payStatusPaidText : styles.payStatusPendingText,
              ]}
            >
              {isPaid ? '● Paid (Settled)' : '○ Pending Handover'}
            </Text>
          </View>
        </View>

        <View style={styles.cardDivider} />
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            router.push({
              pathname: '/fisherman/s26' as never,
              params: {
                orderNumber: order.orderNumber,
                id: order.id,
                from: 's23',
              },
            })
          }
          style={styles.viewPaymentReceiptRow}
        >
          <FishermanIcon name="sparkles" size={13} color={ui.tealDark} />
          <Text style={styles.viewPaymentReceiptText}>
            View Payment & Transaction Settlement (S26) →
          </Text>
        </Pressable>
      </View>

      {/* 02. BUTTONS & NAVIGATION: BACK -> S22 */}
      <View style={styles.footerSection}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to Orders List (S22)"
          onPress={handleBackToS22}
          style={styles.backListBtn}
        >
          <FishermanIcon name="arrow-left" size={16} color={ui.navy} />
          <Text style={styles.backListBtnText}>Back to Orders List (S22)</Text>
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
    marginBottom: 10,
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
    flex: 1,
  },
  heroCard: {
    backgroundColor: ui.surface,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: ui.border,
    shadowColor: ui.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    marginBottom: 16,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderIdBadge: {
    backgroundColor: ui.tealLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  orderIdText: {
    fontSize: 14,
    fontWeight: '900',
    color: ui.tealDark,
    letterSpacing: 0.5,
  },
  orderDateText: {
    fontSize: 11,
    color: ui.muted,
    marginTop: 4,
    fontWeight: '600',
  },
  timelineContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginVertical: 14,
  },
  timelineItem: {
    alignItems: 'center',
    flex: 1,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  timelineDotActive: {
    backgroundColor: ui.teal,
  },
  timelineDotPast: {
    backgroundColor: '#10B981',
  },
  timelineDotNum: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748B',
  },
  timelineDotNumActive: {
    color: '#FFFFFF',
  },
  timelineLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: ui.muted,
    textAlign: 'center',
  },
  timelineLabelActive: {
    color: ui.tealDark,
    fontWeight: '900',
  },
  actionControlsSection: {
    marginTop: 2,
  },
  pendingActionWrap: {
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  actionGuideTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#92400E',
    marginBottom: 10,
    textAlign: 'center',
  },
  pendingBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  acceptPrimaryBtn: {
    flex: 1.6,
    backgroundColor: '#059669',
    height: 46,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#059669',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  acceptPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  rejectSecondaryBtn: {
    flex: 1,
    backgroundColor: '#FEE2E2',
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  rejectSecondaryBtnText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '900',
  },
  processingActionWrap: {
    gap: 10,
  },
  processingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: ui.tealLight,
    padding: 10,
    borderRadius: 12,
  },
  processingBannerText: {
    fontSize: 11,
    fontWeight: '700',
    color: ui.tealDark,
    flex: 1,
  },
  manageDeliveryBtn: {
    backgroundColor: ui.teal,
    height: 48,
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
  manageDeliveryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  deliveredSuccessBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  deliveredSuccessTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#065F46',
  },
  deliveredSuccessSub: {
    fontSize: 10,
    color: '#047857',
    marginTop: 1,
  },
  viewPodBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewPodText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  cancelledBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  cancelledTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#991B1B',
  },
  cancelledSub: {
    fontSize: 10,
    color: '#B91C1C',
    marginTop: 1,
  },
  customerCard: {
    backgroundColor: ui.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: ui.border,
    marginBottom: 16,
  },
  customerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  customerAvatarBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: ui.tealLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerNameText: {
    fontSize: 13,
    fontWeight: '900',
    color: ui.navy,
  },
  customerPhoneText: {
    fontSize: 11,
    color: ui.tealDark,
    fontWeight: '700',
    marginTop: 2,
  },
  commActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  commBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: ui.tealLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDivider: {
    height: 1,
    backgroundColor: ui.borderSubtle,
    marginVertical: 12,
  },
  addressSection: {
    gap: 8,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  addressLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: ui.muted,
    letterSpacing: 0.8,
  },
  addressValue: {
    fontSize: 12,
    fontWeight: '800',
    color: ui.navy,
    marginTop: 2,
    lineHeight: 16,
  },
  addressSchedule: {
    fontSize: 10,
    fontWeight: '700',
    color: ui.tealDark,
    marginTop: 3,
  },
  specialNoteBox: {
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  specialNoteHeading: {
    fontSize: 10,
    fontWeight: '900',
    color: '#92400E',
  },
  specialNoteText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#78350F',
    marginTop: 2,
  },
  itemsCard: {
    backgroundColor: ui.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: ui.border,
    marginBottom: 16,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: ui.borderSubtle,
  },
  tableColHeader: {
    fontSize: 9,
    fontWeight: '900',
    color: ui.muted,
    letterSpacing: 0.5,
  },
  tableItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  tableItemRowBorder: {
    borderTopWidth: 1,
    borderTopColor: ui.borderSubtle,
  },
  itemFishName: {
    fontSize: 12,
    fontWeight: '900',
    color: ui.navy,
  },
  itemCutSub: {
    fontSize: 9,
    color: ui.muted,
    marginTop: 1,
  },
  itemQtyText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.navy,
  },
  itemUnitPriceText: {
    fontSize: 11,
    fontWeight: '700',
    color: ui.muted,
  },
  itemLineTotalText: {
    fontSize: 12,
    fontWeight: '900',
    color: ui.tealDark,
  },
  totalsSection: {
    gap: 6,
  },
  totalLineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLineLabel: {
    fontSize: 11,
    color: ui.muted,
    fontWeight: '700',
  },
  totalLineAmount: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.navy,
  },
  grandTotalDivider: {
    height: 1,
    backgroundColor: ui.borderSubtle,
    marginVertical: 6,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: ui.navy,
    letterSpacing: 0.5,
  },
  grandTotalTaxSub: {
    fontSize: 9,
    color: ui.muted,
    marginTop: 1,
  },
  grandTotalAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: ui.tealDark,
  },
  paymentCard: {
    backgroundColor: ui.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: ui.border,
    marginBottom: 16,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  paymentIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: ui.tealLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: ui.muted,
    letterSpacing: 0.8,
  },
  paymentValue: {
    fontSize: 12,
    fontWeight: '900',
    color: ui.navy,
    marginTop: 2,
  },
  paymentStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  payStatusText: {
    fontSize: 10,
    fontWeight: '900',
  },
  payStatusPaid: {
    backgroundColor: '#ECFDF5',
  },
  payStatusPaidText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '900',
  },
  payStatusPending: {
    backgroundColor: '#FEF3C7',
  },
  payStatusPendingText: {
    color: '#D97706',
    fontSize: 10,
    fontWeight: '900',
  },
  viewPaymentReceiptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 4,
  },
  viewPaymentReceiptText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.tealDark,
  },
  footerSection: {
    marginTop: 4,
    marginBottom: 30,
  },
  backListBtn: {
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
  backListBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: ui.navy,
  },
  notFoundCard: {
    padding: 24,
    alignItems: 'center',
  },
  notFoundTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: ui.navy,
  },
  notFoundSub: {
    fontSize: 12,
    color: ui.muted,
    textAlign: 'center',
    marginVertical: 12,
  },
  backBtn: {
    backgroundColor: ui.teal,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});

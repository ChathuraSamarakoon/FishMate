import { useMemo, useState } from 'react';
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
import type { FishermanOrderStatus } from '@/types';

/**
 * 01. TIMELINE STAGES:
 * Confirmed -> Preparing -> Out for Delivery -> Delivered
 */
type TimelineStage = 'confirmed' | 'preparing' | 'dispatched' | 'delivered';

const TIMELINE_STAGES: {
  key: TimelineStage;
  label: string;
  stepNum: number;
  shortDesc: string;
  detail: string;
}[] = [
  {
    key: 'confirmed',
    label: 'Confirmed',
    stepNum: 1,
    shortDesc: 'Order accepted & catch reserved',
    detail: 'Fish portion reserved from landed cold storage; customer notified.',
  },
  {
    key: 'preparing',
    label: 'Preparing',
    stepNum: 2,
    shortDesc: 'Cleaning & ice-box packing',
    detail: 'Fish cut, vacuum sealed and placed into sub-4°C crushed ice crate.',
  },
  {
    key: 'dispatched',
    label: 'Out for Delivery',
    stepNum: 3,
    shortDesc: 'En route with courier rider',
    detail: 'Ice crate handed over to delivery rider; transit to destination.',
  },
  {
    key: 'delivered',
    label: 'Delivered',
    stepNum: 4,
    shortDesc: 'Handed over & payment settled',
    detail: 'Customer received fresh catch, payment verified, order closed.',
  },
];

/**
 * Normalizes order status into the 4 canonical timeline stages
 */
function normalizeStage(status: FishermanOrderStatus): TimelineStage {
  if (status === 'delivered' || status === 'completed') return 'delivered';
  if (status === 'dispatched' || status === 'ready') return 'dispatched';
  if (status === 'preparing') return 'preparing';
  return 'confirmed';
}

export default function S25ManageDeliveryScreen() {
  const params = useLocalSearchParams<{ id?: string; orderNumber?: string }>();
  const { orders, updateOrder } = useFisherman();

  // Find target order
  const order = useMemo(() => {
    return (
      orders.find((o) => o.id === params.id || o.orderNumber === params.orderNumber) ||
      orders[0]
    );
  }, [orders, params.id, params.orderNumber]);

  // Current milestone stage
  const currentStage = order ? normalizeStage(order.status) : 'confirmed';
  const [localStage, setLocalStage] = useState<TimelineStage>(currentStage);

  // 02. BUTTONS & NAVIGATION: BACK -> S23
  const handleBackToS23 = () => {
    if (order) {
      router.replace({
        pathname: '/fisherman/s23' as never,
        params: { id: order.id, orderNumber: order.orderNumber },
      });
    } else {
      router.replace('/fisherman/s22');
    }
  };

  if (!order) {
    return (
      <FishermanShell
        title="S25 · Manage Delivery"
        subtitle="Order fulfillment & status tracking"
        back
        onBack={handleBackToS22}
      >
        <View style={styles.notFoundCard}>
          <Text style={styles.notFoundTitle}>Order Not Found</Text>
          <Text style={styles.notFoundSub}>
            The delivery record for this order could not be located.
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

  function handleBackToS22() {
    router.replace('/fisherman/s22');
  }

  // Determine next status in sequence
  const nextStageMap: Record<TimelineStage, TimelineStage | null> = {
    confirmed: 'preparing',
    preparing: 'dispatched',
    dispatched: 'delivered',
    delivered: null,
  };
  const nextStage = nextStageMap[localStage];

  // 02. BUTTONS & NAVIGATION: UPDATE STATUS
  const handleUpdateStatus = (targetStage?: TimelineStage) => {
    const stageToSet = targetStage || nextStage;
    if (!stageToSet) {
      Alert.alert('Delivery Complete', 'This order is already marked as Delivered.');
      return;
    }

    const stageLabels: Record<TimelineStage, string> = {
      confirmed: 'Confirmed',
      preparing: 'Preparing (Ice Packing)',
      dispatched: 'Out for Delivery (Dispatched)',
      delivered: 'Delivered (Handover Complete)',
    };

    Alert.alert(
      `Update Delivery Status?`,
      `Transition order ${order.orderNumber} to "${stageLabels[stageToSet]}"? The customer will receive a status notification.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update Status',
          onPress: () => {
            updateOrder(order.id, {
              status: stageToSet as FishermanOrderStatus,
              paymentStatus: stageToSet === 'delivered' ? 'paid' : order.paymentStatus,
            });
            setLocalStage(stageToSet);
            Alert.alert(
              'Status Updated (S25)',
              `Order ${order.orderNumber} is now: ${stageLabels[stageToSet]}.`,
            );
          },
        },
      ],
    );
  };

  // 02. BUTTONS & NAVIGATION: CALL CUSTOMER
  const handleCallCustomer = () => {
    const phone = order.customerPhone || '077 344 1902';
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Call Customer', `Dialing ${phone} for ${order.customerName}`);
    });
  };

  // Direct SMS action
  const handleMessageCustomer = () => {
    const phone = order.customerPhone || '077 344 1902';
    Linking.openURL(`sms:${phone}`).catch(() => {
      Alert.alert('SMS Customer', `Opening messaging for ${phone}`);
    });
  };

  // Item summary for display
  const itemsText = order.items
    .map((i) => `${i.quantityKg} kg ${i.fishName}`)
    .join(' · ');

  return (
    <FishermanShell
      title={`S25 · Manage Delivery`}
      subtitle="Delivery status tracking & customer communication"
      back
      onBack={handleBackToS23}
      rightIcon="phone"
      rightLabel="Call Buyer"
      onRightPress={handleCallCustomer}
    >
      {/* SCREEN TAG & ARCHITECTURE BADGE */}
      <View style={styles.badgeRow}>
        <View style={styles.screenTag}>
          <Text style={styles.screenTagText}>SCREEN S25</Text>
        </View>
        <Text numberOfLines={1} style={styles.screenSubtitle}>
          DELIVERY STATUS & DISPATCH TRACKER
        </Text>
      </View>

      {/* 03. BEHAVIOR & VALIDATION: STATUS-BASED TRACKING ONLY BANNER */}
      <View style={styles.gpsInfoBanner}>
        <FishermanIcon name="pin" size={14} color="#0369A1" />
        <View style={{ flex: 1 }}>
          <Text style={styles.gpsInfoTitle}>
            Status-Based Tracking Only (Actual Rider GPS Later)
          </Text>
          <Text style={styles.gpsInfoBody}>
            Milestone checkpoints trigger instant customer SMS updates. Live rider GPS
            telemetry will be enabled in future rider app integration.
          </Text>
        </View>
      </View>

      {/* 01. ORDER DETAILS CARD */}
      <View style={styles.orderSummaryCard}>
        <View style={styles.orderTopRow}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={styles.orderIdBadge}>
              <Text style={styles.orderIdText}>{order.orderNumber}</Text>
            </View>
            <Text style={styles.orderPlacedDate}>Placed: {order.createdAt}</Text>
          </View>

          {/* 01. CURRENT STATUS BADGE */}
          <View style={styles.statusCol}>
            <Text style={styles.currentStatusLabel}>CURRENT STATUS</Text>
            <OrderStatusBadge status={order.status} />
          </View>
        </View>

        <View style={styles.cardDivider} />

        {/* ORDER ITEMS & VALUE */}
        <View style={styles.itemsSummaryRow}>
          <FishermanIcon name="bag" size={14} color={ui.tealDark} />
          <Text numberOfLines={2} style={styles.itemsSummaryText}>
            {itemsText}
          </Text>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Grand Total (COD / Paid):</Text>
          <Text style={styles.totalAmountText}>{money(order.totalAmount)}</Text>
        </View>
      </View>

      {/* 01. DELIVERY ADDRESS CARD */}
      <SectionHeader
        title="Delivery Destination"
        subtitle="Recipient drop-off address and timing"
      />

      <View style={styles.addressCard}>
        <View style={styles.addressRow}>
          <View style={styles.addressIconWrap}>
            <FishermanIcon name="pin" size={16} color={ui.tealDark} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.addressLabel}>DELIVERY ADDRESS</Text>
            <Text style={styles.addressValue}>{order.customerLocation}</Text>
            <Text style={styles.addressDistance}>
              📍 Approx. 1.8 km from Negombo Harbor Pier · ~8-12 mins transit
            </Text>
            <Text style={styles.addressTargetTime}>
              Target Delivery: {order.deliveryTime}
            </Text>
          </View>
        </View>

        {order.note ? (
          <View style={styles.specialNoteBox}>
            <Text style={styles.specialNoteTitle}>Delivery / Preparation Note:</Text>
            <Text style={styles.specialNoteBody}>{order.note}</Text>
          </View>
        ) : null}
      </View>

      {/* 01. CUSTOMER CONTACT CARD & 02. CALL CUSTOMER */}
      <SectionHeader
        title="Customer Contact"
        subtitle="Recipient verification & direct line"
      />

      <View style={styles.contactCard}>
        <View style={styles.contactTopRow}>
          <View style={styles.customerAvatar}>
            <FishermanIcon name="user" size={18} color={ui.tealDark} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text numberOfLines={1} style={styles.customerName}>
              {order.customerName}
            </Text>
            <Text style={styles.customerPhone}>
              {order.customerPhone || '077 344 1902'}
            </Text>
          </View>

          {/* 02. CALL CUSTOMER BUTTON */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Call customer ${order.customerName}`}
            onPress={handleCallCustomer}
            style={styles.callCustomerBtn}
          >
            <FishermanIcon name="phone" size={16} color="#FFFFFF" />
            <Text style={styles.callCustomerBtnText}>Call Customer</Text>
          </Pressable>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.quickContactFootRow}>
          <Text style={styles.commNote}>
            Need delivery address clarification or gate code?
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={handleMessageCustomer}
            style={styles.smsBtn}
          >
            <FishermanIcon name="message" size={13} color={ui.tealDark} />
            <Text style={styles.smsBtnText}>Send SMS</Text>
          </Pressable>
        </View>
      </View>

      {/* 01. CONFIRMED -> PREPARING -> OUT FOR DELIVERY -> DELIVERED TIMELINE */}
      <SectionHeader
        title="Fulfillment Timeline"
        subtitle="Confirmed → Preparing → Out for Delivery → Delivered"
      />

      <View style={styles.timelineCard}>
        {TIMELINE_STAGES.map((stage, idx) => {
          const isCurrent = localStage === stage.key;
          const isCompleted =
            (localStage === 'preparing' && stage.key === 'confirmed') ||
            (localStage === 'dispatched' &&
              (stage.key === 'confirmed' || stage.key === 'preparing')) ||
            (localStage === 'delivered' && stage.key !== 'delivered');

          const isLast = idx === TIMELINE_STAGES.length - 1;

          return (
            <View key={stage.key} style={styles.timelineRow}>
              {/* TIMELINE CONNECTOR LINE & ICON */}
              <View style={styles.timelineAxis}>
                <View
                  style={[
                    styles.nodeCircle,
                    isCurrent && styles.nodeCircleActive,
                    isCompleted && styles.nodeCircleCompleted,
                  ]}
                >
                  {isCompleted ? (
                    <FishermanIcon name="check" size={13} color="#FFFFFF" />
                  ) : (
                    <Text
                      style={[
                        styles.nodeNum,
                        isCurrent && styles.nodeNumActive,
                      ]}
                    >
                      {stage.stepNum}
                    </Text>
                  )}
                </View>
                {!isLast && (
                  <View
                    style={[
                      styles.connectorLine,
                      isCompleted && styles.connectorLineCompleted,
                    ]}
                  />
                )}
              </View>

              {/* STAGE DETAILS */}
              <View style={[styles.stageDetails, !isLast && { paddingBottom: 16 }]}>
                <View style={styles.stageTitleRow}>
                  <Text
                    style={[
                      styles.stageTitle,
                      isCurrent && styles.stageTitleActive,
                      isCompleted && styles.stageTitleCompleted,
                    ]}
                  >
                    {stage.label}
                  </Text>
                  {isCurrent && (
                    <View style={styles.activePill}>
                      <View style={styles.pulsingDot} />
                      <Text style={styles.activePillText}>CURRENT STAGE</Text>
                    </View>
                  )}
                  {isCompleted && (
                    <View style={styles.completedPill}>
                      <Text style={styles.completedPillText}>COMPLETED</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.stageShortDesc}>{stage.shortDesc}</Text>
                <Text style={styles.stageDetailText}>{stage.detail}</Text>

                {/* ONE-TAP STAGE SELECTOR SHORTCUT */}
                {!isCurrent && (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => handleUpdateStatus(stage.key)}
                    style={styles.switchStageBtn}
                  >
                    <Text style={styles.switchStageText}>
                      Set to {stage.label} →
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* 01 & 02. UPDATE STATUS ACTION SECTION */}
      <View style={styles.actionSection}>
        {nextStage ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Advance status to ${nextStage}`}
            onPress={() => handleUpdateStatus()}
            style={styles.updateStatusPrimaryBtn}
          >
            <FishermanIcon name="check" size={17} color="#FFFFFF" />
            <Text style={styles.updateStatusBtnText}>
              Update Status: Move to{' '}
              {nextStage === 'preparing'
                ? 'Preparing (Ice Packing)'
                : nextStage === 'dispatched'
                ? 'Out for Delivery'
                : 'Delivered'}
            </Text>
          </Pressable>
        ) : (
          <View style={styles.fullyDeliveredBanner}>
            <FishermanIcon name="check" size={18} color="#059669" />
            <View style={{ flex: 1 }}>
              <Text style={styles.fullyDeliveredTitle}>
                Order Handover Complete
              </Text>
              <Text style={styles.fullyDeliveredSub}>
                Fresh catch delivered, customer confirmed, and payment settled.
              </Text>
            </View>
          </View>
        )}

        {/* 02. BUTTONS & NAVIGATION: BACK -> S23 */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to Order Details (S23)"
          onPress={handleBackToS23}
          style={styles.backToS23Btn}
        >
          <FishermanIcon name="arrow-left" size={16} color={ui.navy} />
          <Text style={styles.backToS23Text}>
            Back to Order Details (S23)
          </Text>
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
  screenSubtitle: {
    fontSize: 9,
    fontWeight: '900',
    color: ui.muted,
    letterSpacing: 0.8,
    flex: 1,
  },
  gpsInfoBanner: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: 14,
  },
  gpsInfoTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0369A1',
  },
  gpsInfoBody: {
    fontSize: 10,
    color: '#0284C7',
    marginTop: 2,
    lineHeight: 14,
  },
  orderSummaryCard: {
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
    marginBottom: 16,
  },
  orderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderIdBadge: {
    backgroundColor: ui.tealLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  orderIdText: {
    fontSize: 13,
    fontWeight: '900',
    color: ui.tealDark,
  },
  orderPlacedDate: {
    fontSize: 10,
    color: ui.muted,
    marginTop: 4,
    fontWeight: '600',
  },
  statusCol: {
    alignItems: 'flex-end',
    gap: 3,
  },
  currentStatusLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: ui.muted,
    letterSpacing: 0.8,
  },
  cardDivider: {
    height: 1,
    backgroundColor: ui.borderSubtle,
    marginVertical: 12,
  },
  itemsSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: ui.bg,
    padding: 10,
    borderRadius: 10,
  },
  itemsSummaryText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.navy,
    flex: 1,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: ui.borderSubtle,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.muted,
  },
  totalAmountText: {
    fontSize: 15,
    fontWeight: '900',
    color: ui.tealDark,
  },
  addressCard: {
    backgroundColor: ui.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: ui.border,
    marginBottom: 16,
  },
  addressRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  addressIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: ui.tealLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  addressLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: ui.muted,
    letterSpacing: 0.8,
  },
  addressValue: {
    fontSize: 12,
    fontWeight: '900',
    color: ui.navy,
    marginTop: 2,
    lineHeight: 16,
  },
  addressDistance: {
    fontSize: 10,
    fontWeight: '700',
    color: ui.tealDark,
    marginTop: 3,
  },
  addressTargetTime: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
    marginTop: 2,
  },
  specialNoteBox: {
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  specialNoteTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#92400E',
  },
  specialNoteBody: {
    fontSize: 11,
    fontWeight: '600',
    color: '#78350F',
    marginTop: 1,
  },
  contactCard: {
    backgroundColor: ui.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: ui.border,
    marginBottom: 16,
  },
  contactTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  customerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: ui.tealLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerName: {
    fontSize: 13,
    fontWeight: '900',
    color: ui.navy,
  },
  customerPhone: {
    fontSize: 11,
    fontWeight: '700',
    color: ui.tealDark,
    marginTop: 1,
  },
  callCustomerBtn: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#059669',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  callCustomerBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  quickContactFootRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commNote: {
    fontSize: 10,
    color: ui.muted,
    flex: 1,
  },
  smsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: ui.bg,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: ui.border,
  },
  smsBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: ui.tealDark,
  },
  timelineCard: {
    backgroundColor: ui.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: ui.border,
    marginBottom: 16,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 14,
  },
  timelineAxis: {
    alignItems: 'center',
    width: 28,
  },
  nodeCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#CBD5E1',
  },
  nodeCircleActive: {
    backgroundColor: ui.teal,
    borderColor: ui.tealDark,
    shadowColor: ui.teal,
    shadowOpacity: 0.35,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  nodeCircleCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  nodeNum: {
    fontSize: 11,
    fontWeight: '900',
    color: '#64748B',
  },
  nodeNumActive: {
    color: '#FFFFFF',
  },
  connectorLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  connectorLineCompleted: {
    backgroundColor: '#10B981',
  },
  stageDetails: {
    flex: 1,
  },
  stageTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  stageTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#64748B',
  },
  stageTitleActive: {
    color: ui.tealDark,
  },
  stageTitleCompleted: {
    color: '#065F46',
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: ui.tealLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ui.teal,
  },
  activePillText: {
    fontSize: 8,
    fontWeight: '900',
    color: ui.tealDark,
    letterSpacing: 0.5,
  },
  completedPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  completedPillText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#059669',
    letterSpacing: 0.5,
  },
  stageShortDesc: {
    fontSize: 10,
    fontWeight: '700',
    color: ui.navy,
  },
  stageDetailText: {
    fontSize: 10,
    color: ui.muted,
    marginTop: 2,
    lineHeight: 14,
  },
  switchStageBtn: {
    alignSelf: 'flex-start',
    backgroundColor: ui.bg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
    borderWidth: 1,
    borderColor: ui.border,
  },
  switchStageText: {
    fontSize: 9,
    fontWeight: '800',
    color: ui.tealDark,
  },
  actionSection: {
    gap: 12,
    marginBottom: 30,
  },
  updateStatusPrimaryBtn: {
    backgroundColor: ui.teal,
    height: 50,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: ui.teal,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  updateStatusBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  fullyDeliveredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ECFDF5',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  fullyDeliveredTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#065F46',
  },
  fullyDeliveredSub: {
    fontSize: 10,
    color: '#047857',
    marginTop: 1,
  },
  backToS23Btn: {
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
  backToS23Text: {
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

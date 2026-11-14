import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FishermanIcon, type FishermanIconName } from './FishermanIcon';
import { fishermanUi as ui } from './theme';
import type {
  FishermanActivity,
  FishermanInquiryItem,
  FishermanOrder,
  FishermanOrderStatus,
} from '@/types';

export function money(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-US')}`;
}

export function SectionHeader({
  title,
  subtitle,
  count,
  actionText,
  onAction,
}: {
  title: string;
  subtitle?: string;
  count?: number;
  actionText?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={{ flex: 1 }}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {typeof count === 'number' && (
            <View style={styles.sectionCountPill}>
              <Text style={styles.sectionCountText}>{count}</Text>
            </View>
          )}
        </View>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      {actionText && onAction ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          style={styles.actionBtn}
          hitSlop={8}
        >
          <Text style={styles.actionBtnText}>{actionText}</Text>
          <FishermanIcon name="chevron-right" size={13} color={ui.tealDark} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function MetricStatCard({
  label,
  value,
  subtext,
  icon,
  accentColor = ui.teal,
  badgeText,
  onPress,
}: {
  label: string;
  value: string | number;
  subtext: string;
  icon: FishermanIconName;
  accentColor?: string;
  badgeText?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.metricCard,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.metricTopRow}>
        <View style={[styles.metricIconWrap, { backgroundColor: `${accentColor}18` }]}>
          <FishermanIcon name={icon} size={18} color={accentColor} />
        </View>
        {badgeText ? (
          <View style={[styles.metricBadge, { backgroundColor: `${accentColor}20` }]}>
            <Text style={[styles.metricBadgeText, { color: accentColor }]}>{badgeText}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text numberOfLines={1} style={styles.metricSubtext}>
        {subtext}
      </Text>
    </Pressable>
  );
}

export function RevenueCard({
  revenue,
  growthPercent,
  period = 'This Month',
  dailyAverage,
  onPress,
}: {
  revenue: number;
  growthPercent: number;
  period?: string;
  dailyAverage?: number;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Gross Catch Revenue: ${money(revenue)}`}
      onPress={onPress}
      disabled={!onPress}
      style={styles.revenueCard}
    >
      <View style={styles.financialTop}>
        <View>
          <Text style={styles.financialEyebrow}>REVENUE OVERVIEW</Text>
          <Text style={styles.financialTitle}>Gross Catch Revenue</Text>
        </View>
        <View style={styles.periodPill}>
          <Text style={styles.periodPillText}>{period}</Text>
        </View>
      </View>

      <View style={styles.financialValueRow}>
        <Text style={styles.financialMainValue}>{money(revenue)}</Text>
        <View style={styles.growthBadge}>
          <Text style={styles.growthBadgeText}>▲ +{growthPercent}%</Text>
        </View>
      </View>

      <Text style={styles.financialDescription}>
        Total sales generated from harbor direct catches & customer pre-orders.
      </Text>

      <View style={styles.financialDivider} />

      <View style={styles.financialFooterRow}>
        <View style={styles.footerItem}>
          <Text style={styles.footerItemLabel}>Daily Average</Text>
          <Text style={styles.footerItemValue}>
            {dailyAverage ? money(dailyAverage) : 'Rs. 9,940 / day'}
          </Text>
        </View>
        <View style={styles.footerItem}>
          <Text style={styles.footerItemLabel}>Sales Source</Text>
          <Text style={styles.footerItemValue}>Harbor + App</Text>
        </View>
        <View style={styles.footerItem}>
          <Text style={styles.footerItemLabel}>Payout Status</Text>
          <Text style={[styles.footerItemValue, { color: ui.success }]}>● Verified</Text>
        </View>
      </View>
    </Pressable>
  );
}

export function BasicProfitCard({
  profit,
  marginPercent,
  fuelCost,
  iceBaitCost,
  harborFee,
  onPress,
}: {
  profit: number;
  marginPercent: number;
  fuelCost: number;
  iceBaitCost: number;
  harborFee: number;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Estimated Net Profit: ${money(profit)}`}
      onPress={onPress}
      disabled={!onPress}
      style={styles.profitCard}
    >
      <View style={styles.financialTop}>
        <View>
          <Text style={[styles.financialEyebrow, { color: ui.emerald }]}>
            BASIC PROFIT ESTIMATION
          </Text>
          <Text style={styles.financialTitle}>Estimated Net Profit</Text>
        </View>
        <View style={styles.profitMarginPill}>
          <Text style={styles.profitMarginText}>{marginPercent}% Margin</Text>
        </View>
      </View>

      <View style={styles.financialValueRow}>
        <Text style={[styles.financialMainValue, { color: ui.navy }]}>{money(profit)}</Text>
        <View style={styles.netPill}>
          <Text style={styles.netPillText}>Net Earnings</Text>
        </View>
      </View>

      <Text style={styles.financialDescription}>
        Revenue minus operational voyage expenses (diesel, ice blocks, bait, harbor docking).
      </Text>

      <View style={styles.expenseBreakdownBox}>
        <Text style={styles.expenseBoxTitle}>Operational Expenses Deducted:</Text>
        <View style={styles.expenseChipsRow}>
          <View style={styles.expenseChip}>
            <Text style={styles.expenseChipLabel}>Fuel (Diesel)</Text>
            <Text style={styles.expenseChipValue}>{money(fuelCost)}</Text>
          </View>
          <View style={styles.expenseChip}>
            <Text style={styles.expenseChipLabel}>Ice & Bait</Text>
            <Text style={styles.expenseChipValue}>{money(iceBaitCost)}</Text>
          </View>
          <View style={styles.expenseChip}>
            <Text style={styles.expenseChipLabel}>Harbor & Dock</Text>
            <Text style={styles.expenseChipValue}>{money(harborFee)}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export function OrderStatusBadge({ status }: { status: FishermanOrderStatus }) {
  const config = {
    pending: { label: 'Pending Dispatch', bg: ui.warningSoft, text: ui.warning },
    preparing: { label: 'Packing & Cleaning', bg: ui.tealLight, text: ui.tealDark },
    ready: { label: 'Ready for Pickup', bg: ui.softBlue, text: ui.navy },
    dispatched: { label: 'Out for Delivery', bg: '#F0EAF8', text: '#6C48B2' },
    completed: { label: 'Completed', bg: ui.successSoft, text: ui.success },
    cancelled: { label: 'Cancelled', bg: ui.dangerSoft, text: ui.danger },
  }[status];

  return (
    <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
      <Text style={[styles.statusBadgeText, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

export function RecentOrderCard({
  order,
  onPress,
  onUpdateStatus,
}: {
  order: FishermanOrder;
  onPress: () => void;
  onUpdateStatus?: () => void;
}) {
  const itemsSummary = order.items
    .map((item) => `${item.fishName} (${item.quantityKg} kg)`)
    .join(', ');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Order ${order.orderNumber} for ${order.customerName}`}
      onPress={onPress}
      style={({ pressed }) => [styles.orderCard, pressed && styles.pressed]}
    >
      <View style={styles.orderHeaderRow}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={styles.orderIdRow}>
            <Text style={styles.orderNumber}>{order.orderNumber}</Text>
            <Text style={styles.orderDot}>·</Text>
            <Text style={styles.orderTime}>{order.createdAt}</Text>
          </View>
          <Text numberOfLines={1} style={styles.customerName}>
            {order.customerName}
          </Text>
        </View>
        <OrderStatusBadge status={order.status} />
      </View>

      <View style={styles.orderItemsBox}>
        <FishermanIcon name="listings" size={14} color={ui.tealDark} />
        <Text numberOfLines={2} style={styles.orderItemsText}>
          {itemsSummary}
        </Text>
      </View>

      <View style={styles.orderDeliveryRow}>
        <FishermanIcon name="pin" size={12} color={ui.muted} />
        <Text numberOfLines={1} style={styles.orderDeliveryText}>
          {order.customerLocation}
        </Text>
      </View>

      <View style={styles.orderFooterRow}>
        <View>
          <Text style={styles.orderTotalLabel}>Total Amount</Text>
          <Text style={styles.orderTotalValue}>{money(order.totalAmount)}</Text>
        </View>

        <View style={styles.orderActionButtons}>
          {onUpdateStatus && order.status !== 'completed' && (
            <Pressable
              accessibilityRole="button"
              onPress={onUpdateStatus}
              style={styles.orderQuickBtn}
            >
              <Text style={styles.orderQuickBtnText}>
                {order.status === 'pending'
                  ? 'Confirm'
                  : order.status === 'preparing'
                  ? 'Mark Ready'
                  : 'Dispatch'}
              </Text>
            </Pressable>
          )}
          <View style={styles.orderArrowBtn}>
            <FishermanIcon name="chevron-right" size={15} color={ui.tealDark} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export function RecentInquiryCard({
  inquiry,
  onPress,
  onReply,
}: {
  inquiry: FishermanInquiryItem;
  onPress: () => void;
  onReply?: () => void;
}) {
  const initials = inquiry.customerName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Inquiry from ${inquiry.customerName}`}
      onPress={onPress}
      style={({ pressed }) => [styles.inquiryCard, pressed && styles.pressed]}
    >
      <View style={styles.inquiryTop}>
        <View style={styles.inquiryAvatar}>
          <Text style={styles.inquiryAvatarText}>{initials}</Text>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={styles.inquiryCustomerRow}>
            <Text numberOfLines={1} style={styles.inquiryCustomerName}>
              {inquiry.customerName}
            </Text>
            <Text style={styles.inquiryTime}>{inquiry.timeAgo}</Text>
          </View>
          {inquiry.listingName ? (
            <View style={styles.inquiryFishPill}>
              <Text style={styles.inquiryFishText}>Fish: {inquiry.listingName}</Text>
            </View>
          ) : null}
        </View>
        {inquiry.unread && (
          <View style={styles.unreadDot} />
        )}
      </View>

      <Text numberOfLines={2} style={styles.inquiryMessage}>
        &ldquo;{inquiry.message}&rdquo;
      </Text>

      <View style={styles.inquiryFooterRow}>
        <View style={styles.inquiryStatusPill}>
          <Text style={styles.inquiryStatusText}>
            {inquiry.unread ? '● Requires reply' : '✓ Replied'}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={onReply ?? onPress}
          style={styles.replyButton}
        >
          <FishermanIcon name="message" size={13} color="#FFFFFF" />
          <Text style={styles.replyButtonText}>Reply</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

export function EmptyStateCard({
  icon,
  title,
  description,
  actionText,
  onAction,
}: {
  icon: FishermanIconName;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <FishermanIcon name={icon} size={26} color={ui.tealDark} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDesc}>{description}</Text>
      {actionText && onAction ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          style={styles.emptyActionBtn}
        >
          <Text style={styles.emptyActionText}>{actionText}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function RecentActivityItem({ activity }: { activity: FishermanActivity }) {
  const iconConfig =
    {
      order: { icon: 'bag' as FishermanIconName, color: ui.warning, bg: ui.warningSoft },
      inquiry: { icon: 'message' as FishermanIconName, color: '#2563EB', bg: '#EBF4FF' },
      trip: { icon: 'clock' as FishermanIconName, color: ui.tealDark, bg: ui.tealLight },
      payment: { icon: 'revenue' as FishermanIconName, color: ui.success, bg: ui.successSoft },
      listing: { icon: 'sparkles' as FishermanIconName, color: ui.teal, bg: ui.tealLight },
    }[activity.type] || {
      icon: 'sparkles' as FishermanIconName,
      color: ui.navy,
      bg: ui.softBlue,
    };

  return (
    <View style={styles.activityItem}>
      <View style={[styles.activityIconWrap, { backgroundColor: iconConfig.bg }]}>
        <FishermanIcon name={iconConfig.icon} size={15} color={iconConfig.color} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.activityTopRow}>
          <Text numberOfLines={1} style={styles.activityTitle}>
            {activity.title}
          </Text>
          <Text style={styles.activityTime}>{activity.timeAgo}</Text>
        </View>
        <Text numberOfLines={2} style={styles.activityDesc}>
          {activity.description}
        </Text>
      </View>
      {activity.badge ? (
        <View style={styles.activityBadge}>
          <Text style={styles.activityBadgeText}>{activity.badge}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    marginTop: 26,
    marginBottom: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: ui.navy,
    letterSpacing: -0.4,
  },
  sectionCountPill: {
    backgroundColor: ui.tealLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  sectionCountText: {
    fontSize: 11,
    fontWeight: '900',
    color: ui.tealDark,
  },
  sectionSubtitle: {
    color: ui.muted,
    fontSize: 11,
    marginTop: 3,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    padding: 6,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: ui.tealDark,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
  metricCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: ui.surface,
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: ui.border,
    shadowColor: ui.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  metricTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  metricIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  metricBadgeText: {
    fontSize: 10,
    fontWeight: '900',
  },
  metricValue: {
    fontSize: 26,
    fontWeight: '900',
    color: ui.navy,
    letterSpacing: -0.5,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: ui.navy,
    marginTop: 3,
  },
  metricSubtext: {
    fontSize: 10,
    color: ui.muted,
    marginTop: 4,
  },
  revenueCard: {
    backgroundColor: ui.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: ui.border,
    marginTop: 10,
    shadowColor: ui.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  profitCard: {
    backgroundColor: '#FAFDFD',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#CDE5E2',
    marginTop: 14,
    shadowColor: ui.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  financialTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  financialEyebrow: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: ui.tealDark,
  },
  financialTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: ui.navy,
    marginTop: 4,
  },
  periodPill: {
    backgroundColor: ui.softBlue,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  periodPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.navy,
  },
  profitMarginPill: {
    backgroundColor: ui.emeraldSoft,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  profitMarginText: {
    fontSize: 11,
    fontWeight: '900',
    color: ui.emerald,
  },
  financialValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  financialMainValue: {
    fontSize: 28,
    fontWeight: '900',
    color: ui.navy,
    letterSpacing: -0.6,
  },
  growthBadge: {
    backgroundColor: ui.successSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  growthBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: ui.success,
  },
  netPill: {
    backgroundColor: ui.tealLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  netPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.tealDark,
  },
  financialDescription: {
    fontSize: 11,
    color: ui.muted,
    lineHeight: 17,
    marginTop: 8,
  },
  financialDivider: {
    height: 1,
    backgroundColor: ui.borderSubtle,
    marginVertical: 14,
  },
  financialFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerItem: {
    gap: 3,
  },
  footerItemLabel: {
    fontSize: 10,
    color: ui.muted,
    fontWeight: '700',
  },
  footerItemValue: {
    fontSize: 12,
    fontWeight: '800',
    color: ui.navy,
  },
  expenseBreakdownBox: {
    marginTop: 14,
    backgroundColor: '#F0F7F6',
    borderRadius: 15,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D7ECE8',
  },
  expenseBoxTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: ui.tealDark,
    marginBottom: 8,
  },
  expenseChipsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  expenseChip: {
    flex: 1,
    minWidth: 80,
    backgroundColor: ui.surface,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D4E8E4',
  },
  expenseChipLabel: {
    fontSize: 9,
    color: ui.muted,
    fontWeight: '700',
  },
  expenseChipValue: {
    fontSize: 11,
    fontWeight: '900',
    color: ui.navy,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '900',
  },
  orderCard: {
    backgroundColor: ui.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: ui.border,
    marginBottom: 12,
    shadowColor: ui.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  orderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  orderIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  orderNumber: {
    fontSize: 12,
    fontWeight: '900',
    color: ui.tealDark,
  },
  orderDot: {
    color: ui.muted,
  },
  orderTime: {
    fontSize: 11,
    color: ui.muted,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '900',
    color: ui.navy,
    marginTop: 3,
  },
  orderItemsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: ui.softBlue,
    padding: 9,
    borderRadius: 11,
    marginTop: 10,
  },
  orderItemsText: {
    fontSize: 11,
    fontWeight: '700',
    color: ui.navy,
    flex: 1,
  },
  orderDeliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 9,
  },
  orderDeliveryText: {
    fontSize: 11,
    color: ui.muted,
    flex: 1,
  },
  orderFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 13,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: ui.borderSubtle,
  },
  orderTotalLabel: {
    fontSize: 9,
    color: ui.muted,
    fontWeight: '700',
  },
  orderTotalValue: {
    fontSize: 16,
    fontWeight: '900',
    color: ui.navy,
  },
  orderActionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderQuickBtn: {
    backgroundColor: ui.teal,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 11,
  },
  orderQuickBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  orderArrowBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: ui.tealLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inquiryCard: {
    backgroundColor: ui.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: ui.border,
    marginBottom: 12,
    shadowColor: ui.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  inquiryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inquiryAvatar: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: ui.softBlue,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: ui.border,
  },
  inquiryAvatarText: {
    fontSize: 12,
    fontWeight: '900',
    color: ui.navy,
  },
  inquiryCustomerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inquiryCustomerName: {
    fontSize: 14,
    fontWeight: '900',
    color: ui.navy,
  },
  inquiryTime: {
    fontSize: 10,
    color: ui.muted,
  },
  inquiryFishPill: {
    alignSelf: 'flex-start',
    backgroundColor: ui.tealLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 7,
    marginTop: 3,
  },
  inquiryFishText: {
    fontSize: 10,
    fontWeight: '800',
    color: ui.tealDark,
  },
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: ui.teal,
  },
  inquiryMessage: {
    fontSize: 12,
    color: '#344E5B',
    lineHeight: 18,
    fontStyle: 'italic',
    marginTop: 10,
  },
  inquiryFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: ui.borderSubtle,
  },
  inquiryStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#F5F8F9',
  },
  inquiryStatusText: {
    fontSize: 10,
    fontWeight: '800',
    color: ui.muted,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: ui.teal,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  replyButtonText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  emptyContainer: {
    backgroundColor: ui.surface,
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ui.border,
    marginTop: 8,
    marginBottom: 12,
  },
  emptyIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: ui.tealLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: ui.navy,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 12,
    color: ui.muted,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 290,
  },
  emptyActionBtn: {
    backgroundColor: ui.teal,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 14,
  },
  emptyActionText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  activityItem: {
    backgroundColor: ui.surface,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: ui.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  activityIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: ui.navy,
    flex: 1,
  },
  activityTime: {
    fontSize: 10,
    color: ui.muted,
    marginLeft: 6,
  },
  activityDesc: {
    fontSize: 11,
    color: ui.muted,
    lineHeight: 16,
    marginTop: 3,
  },
  activityBadge: {
    backgroundColor: ui.softBlue,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 6,
  },
  activityBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: ui.navy,
  },
});

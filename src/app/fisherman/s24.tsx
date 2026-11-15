import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { FishermanIcon } from '@/components/fisherman/FishermanIcon';
import { money } from '@/components/fisherman/atoms';
import { fishermanUi as ui } from '@/components/fisherman/theme';
import { useFisherman } from '@/components/fisherman/FishermanContext';

const PREP_TIMES = ['15 mins', '25 mins', '35 mins', '45 mins', '60 mins'];

const REJECT_REASONS = [
  'Out of fresh catch inventory',
  'Destination outside delivery radius',
  'Boat landing delayed due to sea weather',
  'Unable to fulfill custom butchering cuts',
  'Customer requested cancellation',
];

export default function S24AcceptRejectScreen() {
  const params = useLocalSearchParams<{
    id?: string;
    orderNumber?: string;
    initialAction?: string;
  }>();
  const { orders, updateOrder } = useFisherman();

  const order =
    orders.find((o) => o.id === params.id || o.orderNumber === params.orderNumber) ||
    orders[0];

  const [mode, setMode] = useState<'accept' | 'reject'>(
    params.initialAction === 'reject' ? 'reject' : 'accept',
  );
  const [prepTime, setPrepTime] = useState(PREP_TIMES[1]);
  const [selectedReason, setSelectedReason] = useState(REJECT_REASONS[0]);
  const [customNote, setCustomNote] = useState('');

  if (!order) {
    return (
      <View style={styles.sheetBackdrop}>
        <View style={styles.sheetCard}>
          <Text style={styles.sheetTitle}>Order Record Not Found</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace('/fisherman/s22')}
            style={styles.cancelBtn}
          >
            <Text style={styles.cancelBtnText}>Back to Orders (S22)</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const handleCancel = () => {
    router.replace({
      pathname: '/fisherman/s23' as never,
      params: { id: order.id, orderNumber: order.orderNumber },
    });
  };

  const handleConfirmAction = () => {
    if (mode === 'accept') {
      updateOrder(order.id, {
        status: 'confirmed',
        deliveryTime: `Target Dispatch in ${prepTime}`,
      });

      Alert.alert(
        'Order Accepted (S24)',
        `Order ${order.orderNumber} confirmed with ${prepTime} preparation window. Buyer has been notified via SMS.`,
        [
          {
            text: 'View Order Details (S23)',
            onPress: () => {
              router.replace({
                pathname: '/fisherman/s23' as never,
                params: { id: order.id, orderNumber: order.orderNumber },
              });
            },
          },
        ],
      );
    } else {
      const finalReason = customNote.trim() ? `${selectedReason}: ${customNote.trim()}` : selectedReason;

      updateOrder(order.id, {
        status: 'cancelled',
        rejectionReason: finalReason,
      });

      Alert.alert(
        'Order Declined (S24)',
        `Order ${order.orderNumber} has been rejected (${finalReason}). Buyer notified.`,
        [
          {
            text: 'Return to Orders (S22)',
            onPress: () => {
              router.replace('/fisherman/s22');
            },
          },
        ],
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.sheetBackdrop}
    >
      <View style={styles.sheetContainer}>
        {/* GRAB PILL */}
        <View style={styles.grabHandle} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* HEADER ROW */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.screenTagRow}>
                <View style={styles.screenTag}>
                  <Text style={styles.screenTagText}>SCREEN S24</Text>
                </View>
                <Text style={styles.sheetSubtitle}>ORDER RESPONSE DISPATCHER</Text>
              </View>
              <Text numberOfLines={1} style={styles.sheetTitle}>
                {mode === 'accept' ? 'Accept Customer Order' : 'Decline Customer Order'}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              onPress={handleCancel}
              style={styles.closeBtn}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          {/* ORDER CONTEXT RECAP */}
          <View style={styles.orderContextCard}>
            <View style={styles.orderContextTop}>
              <View>
                <Text style={styles.contextOrderNum}>{order.orderNumber}</Text>
                <Text style={styles.contextBuyer}>{order.customerName}</Text>
              </View>
              <Text style={styles.contextTotal}>{money(order.totalAmount)}</Text>
            </View>
            <Text numberOfLines={2} style={styles.contextItems}>
              📦 {order.items.map((i) => `${i.quantityKg} kg ${i.fishName}`).join(', ')}
            </Text>
          </View>

          {/* ACTION MODE SELECTOR TABS */}
          <View style={styles.modeTabsRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: mode === 'accept' }}
              onPress={() => setMode('accept')}
              style={[styles.modeTab, mode === 'accept' && styles.modeTabAcceptActive]}
            >
              <FishermanIcon
                name="check"
                size={14}
                color={mode === 'accept' ? '#FFFFFF' : '#059669'}
              />
              <Text
                style={[styles.modeTabText, mode === 'accept' && styles.modeTabTextActive]}
              >
                Accept Order
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: mode === 'reject' }}
              onPress={() => setMode('reject')}
              style={[styles.modeTab, mode === 'reject' && styles.modeTabRejectActive]}
            >
              <FishermanIcon
                name="alert"
                size={14}
                color={mode === 'reject' ? '#FFFFFF' : '#DC2626'}
              />
              <Text
                style={[styles.modeTabText, mode === 'reject' && styles.modeTabTextActive]}
              >
                Decline Order
              </Text>
            </Pressable>
          </View>

          {/* ACCEPT WORKFLOW */}
          {mode === 'accept' ? (
            <View style={styles.workflowSection}>
              <Text style={styles.sectionLabel}>1. ESTIMATED PREPARATION & PACKING TIME</Text>
              <View style={styles.chipsWrap}>
                {PREP_TIMES.map((time) => {
                  const isSelected = prepTime === time;
                  return (
                    <Pressable
                      key={time}
                      accessibilityRole="button"
                      onPress={() => setPrepTime(time)}
                      style={[styles.timeChip, isSelected && styles.timeChipActive]}
                    >
                      <Text
                        style={[
                          styles.timeChipText,
                          isSelected && styles.timeChipTextActive,
                        ]}
                      >
                        ⏱ {time}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={[styles.sectionLabel, { marginTop: 14 }]}>
                2. INVENTORY & PACKING VERIFICATION
              </Text>
              <View style={styles.verifyItem}>
                <FishermanIcon name="check" size={14} color="#059669" />
                <Text style={styles.verifyItemText}>
                  Landed catch reserved from cold storage ({order.items.reduce((s, i) => s + i.quantityKg, 0)} kg total).
                </Text>
              </View>
              <View style={styles.verifyItem}>
                <FishermanIcon name="check" size={14} color="#059669" />
                <Text style={styles.verifyItemText}>
                  Ice-box crates and temperature packaging ready.
                </Text>
              </View>

              <Text style={[styles.sectionLabel, { marginTop: 14 }]}>
                3. OPTIONAL NOTE TO BUYER (SMS)
              </Text>
              <TextInput
                value={customNote}
                onChangeText={setCustomNote}
                placeholder="e.g. Steaks will be cut thick as requested and vacuum chilled."
                placeholderTextColor={ui.muted}
                style={styles.textInputBox}
              />
            </View>
          ) : (
            /* REJECT WORKFLOW */
            <View style={styles.workflowSection}>
              <Text style={styles.sectionLabel}>REASON FOR DECLINING ORDER</Text>
              <View style={styles.reasonsList}>
                {REJECT_REASONS.map((reason) => {
                  const isSelected = selectedReason === reason;
                  return (
                    <Pressable
                      key={reason}
                      accessibilityRole="button"
                      onPress={() => setSelectedReason(reason)}
                      style={[styles.reasonRow, isSelected && styles.reasonRowSelected]}
                    >
                      <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                        {isSelected ? <View style={styles.radioInner} /> : null}
                      </View>
                      <Text
                        style={[
                          styles.reasonText,
                          isSelected && styles.reasonTextSelected,
                        ]}
                      >
                        {reason}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={[styles.sectionLabel, { marginTop: 14 }]}>
                ADDITIONAL DETAILS (OPTIONAL)
              </Text>
              <TextInput
                value={customNote}
                onChangeText={setCustomNote}
                placeholder="Reason details explained to customer..."
                placeholderTextColor={ui.muted}
                style={styles.textInputBox}
              />
            </View>
          )}

          {/* BOTTOM ACTIONS */}
          <View style={styles.actionCol}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={mode === 'accept' ? 'Confirm and accept order' : 'Confirm and decline order'}
              onPress={handleConfirmAction}
              style={[
                styles.primaryConfirmBtn,
                mode === 'accept' ? styles.btnAccept : styles.btnReject,
              ]}
            >
              <Text style={styles.primaryConfirmBtnText}>
                {mode === 'accept' ? '✓ Confirm & Accept Order' : '✕ Decline Customer Order'}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={handleCancel}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelBtnText}>Cancel & Return to Order (S23)</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(9, 29, 43, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  sheetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    margin: 20,
    padding: 20,
  },
  grabHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 12,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  screenTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
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
  sheetSubtitle: {
    fontSize: 9,
    fontWeight: '900',
    color: ui.muted,
    letterSpacing: 0.8,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: ui.navy,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ui.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    color: ui.muted,
    fontWeight: '800',
  },
  orderContextCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  orderContextTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  contextOrderNum: {
    fontSize: 13,
    fontWeight: '900',
    color: ui.tealDark,
  },
  contextBuyer: {
    fontSize: 12,
    fontWeight: '800',
    color: ui.navy,
    marginTop: 1,
  },
  contextTotal: {
    fontSize: 15,
    fontWeight: '900',
    color: ui.navy,
  },
  contextItems: {
    fontSize: 11,
    color: ui.muted,
    marginTop: 6,
    fontWeight: '600',
  },
  modeTabsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    borderRadius: 12,
    backgroundColor: ui.bg,
    borderWidth: 1.5,
    borderColor: ui.border,
  },
  modeTabAcceptActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  modeTabRejectActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: '800',
    color: ui.navy,
  },
  modeTabTextActive: {
    color: '#FFFFFF',
  },
  workflowSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: ui.muted,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: ui.bg,
    borderWidth: 1,
    borderColor: ui.border,
  },
  timeChipActive: {
    backgroundColor: ui.tealLight,
    borderColor: ui.teal,
  },
  timeChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.navy,
  },
  timeChipTextActive: {
    color: ui.tealDark,
    fontWeight: '900',
  },
  verifyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    padding: 10,
    borderRadius: 10,
    marginBottom: 6,
  },
  verifyItemText: {
    fontSize: 11,
    color: '#065F46',
    fontWeight: '700',
    flex: 1,
  },
  textInputBox: {
    backgroundColor: ui.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ui.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    color: ui.navy,
    fontWeight: '600',
  },
  reasonsList: {
    gap: 8,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: ui.bg,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: ui.border,
  },
  reasonRowSelected: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: '#DC2626',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
  },
  reasonText: {
    fontSize: 11,
    fontWeight: '700',
    color: ui.navy,
    flex: 1,
  },
  reasonTextSelected: {
    color: '#991B1B',
    fontWeight: '800',
  },
  actionCol: {
    gap: 10,
    marginTop: 10,
  },
  primaryConfirmBtn: {
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ui.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  btnAccept: {
    backgroundColor: '#059669',
  },
  btnReject: {
    backgroundColor: '#DC2626',
  },
  primaryConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  cancelBtn: {
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ui.bg,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: ui.navy,
  },
});

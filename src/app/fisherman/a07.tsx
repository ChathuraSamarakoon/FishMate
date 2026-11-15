import { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { FishermanShell } from '@/components/fisherman/FishermanShell';
import { FishermanIcon } from '@/components/fisherman/FishermanIcon';
import { fishermanUi as ui } from '@/components/fisherman/theme';
import { useFisherman } from '@/components/fisherman/FishermanContext';
import { logout } from '@/services/demoAuth';

export default function A07AccountSettingsScreen() {
  const { profile, resetDemoData } = useFisherman();

  const [orderSms, setOrderSms] = useState(true);
  const [inquiryAlerts, setInquiryAlerts] = useState(true);
  const [seaWeatherAlerts, setSeaWeatherAlerts] = useState(true);
  const [appLanguage, setAppLanguage] = useState<'EN' | 'SI'>('EN');

  const handleEditBank = () => {
    Alert.alert(
      'Bank Account Verification',
      'Payout account is currently linked to Bank of Ceylon (BOC), Negombo Branch.\n\nTo update payout credentials, harbor seller re-verification is required.',
      [{ text: 'OK' }],
    );
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset Demo Data',
      'Reset all mock catches, trips, orders and inquiries to initial state?',
      [
        {
          text: 'Reset All',
          style: 'destructive',
          onPress: () => {
            resetDemoData();
            Alert.alert('Reset Complete', 'Demo data reset to Sunil Perera default storefront.');
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of your fisherman account?', [
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/login');
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <FishermanShell
      title="A07 · Account Settings"
      subtitle="Fisherman credentials, payouts & security"
      back
      rightIcon="user"
    >
      <View style={styles.badgeRow}>
        <View style={styles.screenTag}>
          <Text style={styles.screenTagText}>SCREEN A07</Text>
        </View>
        <Text style={styles.helperText}>Manage account security & banking details</Text>
      </View>

      {/* SELLER VERIFICATION BADGE CARD */}
      <View style={styles.card}>
        <View style={styles.sellerHeaderRow}>
          <Image source={profile.avatar} style={styles.avatar} resizeMode="cover" />
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={styles.verifiedRow}>
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>OFFICIAL HARBOR SUPPLIER</Text>
              </View>
            </View>
            <Text numberOfLines={1} style={styles.sellerName}>
              {profile.name}
            </Text>
            <Text numberOfLines={1} style={styles.sellerPhone}>
              {profile.contactNumber}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Supplier ID</Text>
          <Text style={styles.metaValue}>FISHMATE-LK-NEG-001</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Vessel Mooring</Text>
          <Text style={styles.metaValue}>{profile.boatName} ({profile.registrationNumber})</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Status</Text>
          <Text style={[styles.metaValue, { color: ui.success }]}>● Fully Verified & Active</Text>
        </View>
      </View>

      {/* PAYOUT BANK DETAILS */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Earnings & Payout Bank Account</Text>
          <Pressable onPress={handleEditBank}>
            <Text style={styles.editActionText}>Change</Text>
          </Pressable>
        </View>
        <Text style={styles.cardSub}>
          Customer orders paid online are automatically transferred to your bank account daily:
        </Text>

        <View style={styles.bankCardBox}>
          <View style={styles.bankTopRow}>
            <Text style={styles.bankName}>Bank of Ceylon (BOC)</Text>
            <View style={styles.directDepositBadge}>
              <Text style={styles.directDepositText}>Direct Payout</Text>
            </View>
          </View>
          <Text style={styles.accountNumber}>•••• •••• •••• 8841</Text>
          <View style={styles.bankBottomRow}>
            <Text style={styles.accountName}>W. SUNIL PERERA</Text>
            <Text style={styles.branchName}>Negombo Main Branch</Text>
          </View>
        </View>
      </View>

      {/* NOTIFICATIONS & SMS */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Notifications & SMS Alerts</Text>

        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchTitle}>New Order SMS Alerts</Text>
            <Text style={styles.switchSub}>Instant SMS when a buyer orders catch</Text>
          </View>
          <Switch
            value={orderSms}
            onValueChange={setOrderSms}
            trackColor={{ false: '#D4E2E0', true: ui.teal }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.switchDivider} />

        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchTitle}>Buyer Pre-order Inquiries</Text>
            <Text style={styles.switchSub}>Push alerts for custom fish cut questions</Text>
          </View>
          <Switch
            value={inquiryAlerts}
            onValueChange={setInquiryAlerts}
            trackColor={{ false: '#D4E2E0', true: ui.teal }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.switchDivider} />

        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchTitle}>Marine Weather Warnings</Text>
            <Text style={styles.switchSub}>Sea state and western coast gale alerts</Text>
          </View>
          <Switch
            value={seaWeatherAlerts}
            onValueChange={setSeaWeatherAlerts}
            trackColor={{ false: '#D4E2E0', true: ui.teal }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* LANGUAGE PREFERENCE */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>App Language / භාෂාව</Text>
        <View style={styles.langRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setAppLanguage('EN')}
            style={[styles.langChip, appLanguage === 'EN' && styles.langChipActive]}
          >
            <Text style={[styles.langText, appLanguage === 'EN' && styles.langTextActive]}>
              English (English)
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => setAppLanguage('SI')}
            style={[styles.langChip, appLanguage === 'SI' && styles.langChipActive]}
          >
            <Text style={[styles.langText, appLanguage === 'SI' && styles.langTextActive]}>
              සිංහල (Sinhala)
            </Text>
          </Pressable>
        </View>
      </View>

      {/* DEMO DATA RESET */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Demo Simulation Controls</Text>
        <Text style={styles.cardSub}>
          Reset all mock catch listings, voyages, and customer orders back to Sunil Perera default demo data.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={handleResetData}
          style={styles.resetBtn}
        >
          <FishermanIcon name="sparkles" size={14} color={ui.navy} />
          <Text style={styles.resetBtnText}>Reset Demo Data</Text>
        </Pressable>
      </View>

      {/* LOGOUT BUTTON */}
      <Pressable
        accessibilityRole="button"
        onPress={handleLogout}
        style={styles.logoutBtn}
      >
        <Text style={styles.logoutBtnText}>Log Out of Fisherman Account</Text>
      </Pressable>
    </FishermanShell>
  );
}

const styles = StyleSheet.create({
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
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
  card: {
    backgroundColor: ui.surface,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: ui.border,
    marginBottom: 16,
    shadowColor: ui.shadow,
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: ui.navy,
  },
  cardSub: {
    fontSize: 11,
    color: ui.muted,
    lineHeight: 16,
    marginTop: 2,
    marginBottom: 12,
  },
  editActionText: {
    fontSize: 12,
    fontWeight: '800',
    color: ui.tealDark,
  },
  sellerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: ui.tealLight,
  },
  verifiedRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  verifiedBadge: {
    backgroundColor: ui.tealLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 8,
    fontWeight: '900',
    color: ui.tealDark,
    letterSpacing: 0.5,
  },
  sellerName: {
    fontSize: 17,
    fontWeight: '900',
    color: ui.navy,
  },
  sellerPhone: {
    fontSize: 11,
    color: ui.muted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: ui.borderSubtle,
    marginVertical: 14,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaLabel: {
    fontSize: 11,
    color: ui.muted,
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.navy,
  },
  bankCardBox: {
    backgroundColor: '#0F3C4D',
    borderRadius: 18,
    padding: 18,
  },
  bankTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bankName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#BCECF5',
  },
  directDepositBadge: {
    backgroundColor: 'rgba(22, 213, 215, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  directDepositText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#16D5D7',
  },
  accountNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    marginVertical: 14,
  },
  bankBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountName: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  branchName: {
    fontSize: 10,
    color: '#BCECF5',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  switchTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: ui.navy,
  },
  switchSub: {
    fontSize: 10,
    color: ui.muted,
    marginTop: 2,
  },
  switchDivider: {
    height: 1,
    backgroundColor: ui.borderSubtle,
    marginVertical: 12,
  },
  langRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  langChip: {
    flex: 1,
    backgroundColor: '#F7FAFB',
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: ui.border,
  },
  langChipActive: {
    backgroundColor: ui.teal,
    borderColor: ui.tealDark,
  },
  langText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.navy,
  },
  langTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: ui.softBlue,
    paddingVertical: 11,
    borderRadius: 12,
    marginTop: 4,
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: ui.navy,
  },
  logoutBtn: {
    backgroundColor: ui.surface,
    borderWidth: 1,
    borderColor: '#F3B4BB',
    borderRadius: 16,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#B84958',
  },
});

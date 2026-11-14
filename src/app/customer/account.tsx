import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { CustomerShell } from '@/components/customer/CustomerShell';
import { CustomerIcon } from '@/components/customer/Icon';
import { CustomerAvatar, ProfileInfoRow, ProfileNotice, ProfileSectionHeading } from '@/components/customer/ProfileUI';
import { useCustomerProfile } from '@/components/customer/CustomerProfileContext';
import { useMarketplace } from '@/components/customer/MarketplaceContext';
import { customerUi as c } from '@/components/customer/theme';
import { logout } from '@/services/demoAuth';

export default function CustomerMyProfile() {
  const { saved } = useLocalSearchParams<{ saved?: string }>();
  const { profile } = useCustomerProfile();
  const { inquiries } = useMarketplace();

  if (!profile) {
    return (
      <CustomerShell title="My profile" subtitle="C08 · Customer account">
        <View style={styles.signedOut}>
          <CustomerIcon name="user" color={c.tealDark} size={42} />
          <Text style={styles.signedOutTitle}>Sign in to view your profile</Text>
          <Text style={styles.signedOutBody}>Your customer profile becomes available after you log in with a demo customer account.</Text>
          <Pressable onPress={() => router.replace('/login')} style={styles.primaryButton} accessibilityRole="button"><Text style={styles.primaryText}>Go to login</Text></Pressable>
        </View>
      </CustomerShell>
    );
  }

  const filledFields = [profile.fullName, profile.phone, profile.email, profile.city, profile.address].filter(Boolean).length;
  const completion = Math.round(filledFields / 5 * 100);
  const ownInquiries = inquiries.filter(inquiry => !inquiry.isSample).length;

  return (
    <CustomerShell title="My profile" subtitle="C08 · Your FishMate account">
      {saved === '1' ? <ProfileNotice kind="success">Profile updated! Your changes are saved in this demo session.</ProfileNotice> : null}
      <View style={styles.hero}>
        <View pointerEvents="none" style={styles.heroBubbleOne} />
        <View pointerEvents="none" style={styles.heroBubbleTwo} />
        <View style={styles.heroTop}>
          <Text style={styles.heroEyebrow}>MY FISHMATE ACCOUNT</Text>
          <View style={styles.demoBadge}><Text style={styles.demoBadgeText}>DEMO CUSTOMER</Text></View>
        </View>
        <View style={styles.heroMain}>
          <CustomerAvatar name={profile.fullName} avatarTheme={profile.avatarTheme} size={94} />
          <View style={styles.heroCopy}>
            <Text style={styles.hello}>Welcome aboard,</Text>
            <Text numberOfLines={2} style={styles.name}>{profile.fullName}</Text>
            <Text style={styles.role}>Customer · FishMate member</Text>
          </View>
        </View>
        <Pressable style={styles.editButton} accessibilityRole="button" onPress={() => router.push('/customer/edit-profile')}>
          <Text style={styles.editButtonText}>✎  Edit profile</Text>
          <CustomerIcon name="chevron-right" size={18} color="#FFFFFF" />
        </Pressable>
      </View>

      <View style={styles.progressCard}>
        <View style={styles.progressTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.progressTitle}>Complete your profile</Text>
            <Text style={styles.progressHint}>Add contact and delivery details for future orders.</Text>
          </View>
          <Text style={styles.progressValue}>{completion}%</Text>
        </View>
        <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${completion}%` as `${number}%` }]} /></View>
      </View>

      <ProfileSectionHeading title="Personal details" subtitle="The information currently saved in your demo account" />
      <View style={styles.detailsCard}>
        <ProfileInfoRow icon="user" label="Full name" value={profile.fullName} />
        <ProfileInfoRow icon="phone" label="Mobile number" value={profile.phone} />
        <ProfileInfoRow icon="message" label="Email (optional)" value={profile.email || 'Not added yet'} last />
      </View>

      <ProfileSectionHeading title="Delivery preferences" subtitle="Optional details to help with future checkout" />
      <View style={styles.detailsCard}>
        <ProfileInfoRow icon="pin" label="City / area" value={profile.city || 'Add your city or area'} />
        <ProfileInfoRow icon="pin" label="Preferred delivery address" value={profile.address || 'No saved address yet'} last />
      </View>

      <ProfileSectionHeading title="Quick access" />
      <View style={styles.actionCard}>
        <Pressable accessibilityRole="button" style={styles.actionRow} onPress={() => router.push('/customer/inquiries')}>
          <View style={styles.actionIcon}><CustomerIcon name="message" size={22} color={c.tealDark} /></View>
          <View style={styles.actionTextWrap}>
            <Text style={styles.actionTitle}>My inquiries</Text>
            <Text style={styles.actionSub}>{ownInquiries} inquiry/inquiries created during this session</Text>
          </View>
          <CustomerIcon name="chevron-right" color={c.muted} size={19} />
        </Pressable>
        <View style={styles.actionDivider}/>
        <Pressable accessibilityRole="button" style={styles.actionRow} onPress={() => router.push('/customer/orders')}>
          <View style={styles.actionIcon}><CustomerIcon name="bag" size={22} color={c.tealDark} /></View>
          <View style={styles.actionTextWrap}>
            <Text style={styles.actionTitle}>My orders</Text>
            <Text style={styles.actionSub}>View demo orders, payment and delivery tracking</Text>
          </View>
          <CustomerIcon name="chevron-right" color={c.muted} size={19} />
        </Pressable>
        <View style={styles.actionDivider}/>
        <Pressable accessibilityRole="button" style={styles.actionRow} onPress={() => router.push('/customer/cart')}>
          <View style={styles.actionIcon}><CustomerIcon name="bag" size={22} color={c.tealDark} /></View>
          <View style={styles.actionTextWrap}>
            <Text style={styles.actionTitle}>Shopping cart</Text>
            <Text style={styles.actionSub}>Review your selected fresh seafood</Text>
          </View>
          <CustomerIcon name="chevron-right" color={c.muted} size={19} />
        </Pressable>
        <View style={styles.actionDivider}/>
        <Pressable accessibilityRole="button" style={styles.actionRow} onPress={() => router.push('/customer/search')}>
          <View style={styles.actionIcon}><CustomerIcon name="search" size={22} color={c.tealDark} /></View>
          <View style={styles.actionTextWrap}>
            <Text style={styles.actionTitle}>Explore fresh catches</Text>
            <Text style={styles.actionSub}>Browse available seafood listings</Text>
          </View>
          <CustomerIcon name="chevron-right" color={c.muted} size={19} />
        </Pressable>
      </View>

      <ProfileNotice>Your profile is a frontend demo. No data is saved to a server, and edits reset when the app fully restarts.</ProfileNotice>
      <Pressable
        accessibilityRole="button"
        style={styles.logoutButton}
        onPress={() => { logout(); router.replace('/login'); }}
      ><Text style={styles.logoutText}>Log out of FishMate</Text></Pressable>
    </CustomerShell>
  );
}

const styles = StyleSheet.create({
  signedOut: { backgroundColor: c.surface, borderRadius: 25, padding: 26, borderWidth: 1, borderColor: c.border, alignItems: 'center', marginTop: 12 },
  signedOutTitle: { color: c.navy, fontWeight: '900', fontSize: 20, textAlign: 'center', marginTop: 14 },
  signedOutBody: { color: c.muted, fontSize: 13, lineHeight: 20, marginTop: 10, textAlign: 'center' },
  primaryButton: { marginTop: 20, backgroundColor: c.teal, paddingHorizontal: 25, paddingVertical: 14, borderRadius: 15 },
  primaryText: { fontWeight: '900', fontSize: 13, color: '#FFFFFF' },
  hero: { borderRadius: 28, padding: 21, backgroundColor: '#074C60', overflow: 'hidden', marginTop: 4 },
  heroBubbleOne: { width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(76,224,212,0.12)', position: 'absolute', right: -70, top: -115 },
  heroBubbleTwo: { width: 125, height: 125, borderRadius: 65, backgroundColor: 'rgba(76,224,212,0.09)', position: 'absolute', left: -54, bottom: -80 },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
  heroEyebrow: { color: '#A6F1E7', fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  demoBadge: { backgroundColor: 'rgba(123,239,227,.16)', borderWidth: 1, borderColor: 'rgba(123,239,227,.28)', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 5 },
  demoBadgeText: { color: '#C6FFF6', fontSize: 9, fontWeight: '900', letterSpacing: .6 },
  heroMain: { flexDirection: 'row', gap: 14, alignItems: 'center', paddingTop: 22, paddingBottom: 18 },
  heroCopy: { flex: 1 },
  hello: { fontSize: 12, color: '#ACDCD9', marginBottom: 3 },
  name: { fontSize: 23, fontWeight: '900', color: '#FFFFFF', lineHeight: 28 },
  role: { fontSize: 11, color: '#B1ECE7', marginTop: 8, fontWeight: '700' },
  editButton: { backgroundColor: '#12AAA9', paddingVertical: 13, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10 },
  editButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  progressCard: { marginTop: 14, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, padding: 17, borderRadius: 22 },
  progressTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  progressTitle: { color: c.navy, fontSize: 14, fontWeight: '900' },
  progressHint: { fontSize: 11, lineHeight: 16, color: c.muted, marginTop: 5 },
  progressValue: { color: c.tealDark, fontSize: 20, fontWeight: '900' },
  progressTrack: { height: 7, backgroundColor: '#E7F1F2', marginTop: 15, borderRadius: 9, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 9, backgroundColor: c.teal },
  detailsCard: { paddingHorizontal: 16, borderWidth: 1, borderColor: c.border, borderRadius: 22, backgroundColor: c.surface },
  actionCard: { paddingHorizontal: 15, borderWidth: 1, borderColor: c.border, borderRadius: 22, backgroundColor: c.surface },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 15 },
  actionIcon: { height: 44, width: 44, borderRadius: 14, backgroundColor: c.soft, alignItems: 'center', justifyContent: 'center' },
  actionTextWrap: { flex: 1, gap: 4 },
  actionTitle: { fontSize: 14, fontWeight: '900', color: c.navy },
  actionSub: { fontSize: 11, color: c.muted, lineHeight: 17 },
  actionDivider: { height: 1, backgroundColor: '#EEF3F3', marginLeft: 56 },
  logoutButton: { height: 52, borderRadius: 17, borderWidth: 1, borderColor: '#EDC5C8', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginTop: 17 },
  logoutText: { color: '#B74B59', fontWeight: '900', fontSize: 13 },
});

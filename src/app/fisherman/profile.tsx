import { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { FishermanShell } from '@/components/fisherman/FishermanShell';
import { FishermanIcon } from '@/components/fisherman/FishermanIcon';
import { SectionHeader, money } from '@/components/fisherman/atoms';
import { fishermanUi as ui } from '@/components/fisherman/theme';
import { useFisherman } from '@/components/fisherman/FishermanContext';

export default function FishermanProfileScreen() {
  const { profile, listings } = useFisherman();
  const [viewMode, setViewMode] = useState<'manage' | 'customer'>('manage');
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);

  const phone = profile.contactNumber;

  const handleCall = () => {
    Alert.alert(
      'Call Fisherman Phone',
      `Connecting phone call to ${profile.name} (${phone})...`,
      [
        { text: 'Call Now', onPress: () => Alert.alert('Dialing', `Calling ${phone}`) },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  };

  const handleCopyPhone = () => {
    Alert.alert('Phone Number', `${phone} is registered as your primary customer contact number.`);
  };

  const handleOpenCustomerRoute = () => {
    router.push('/customer/fisherman/fisher-01' as never);
  };

  return (
    <FishermanShell
      title="Storefront & Profile"
      subtitle={viewMode === 'manage' ? 'Seller credentials & storefront settings' : 'Customer View · Live Marketplace Preview'}
      rightIcon={viewMode === 'manage' ? 'sparkles' : 'user'}
      rightLabel={viewMode === 'manage' ? 'Customer View' : 'Manage View'}
      onRightPress={() => setViewMode((prev) => (prev === 'manage' ? 'customer' : 'manage'))}
    >
      {/* MODE SWITCHER: MANAGE vs CUSTOMER PREVIEW */}
      <View style={styles.modeSwitchBar}>
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: viewMode === 'manage' }}
          onPress={() => setViewMode('manage')}
          style={[styles.modeTab, viewMode === 'manage' && styles.modeTabActive]}
        >
          <FishermanIcon
            name="user"
            size={14}
            color={viewMode === 'manage' ? '#FFFFFF' : ui.muted}
          />
          <Text
            numberOfLines={1}
            style={[styles.modeTabText, viewMode === 'manage' && styles.modeTabTextActive]}
          >
            Storefront Manage
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: viewMode === 'customer' }}
          onPress={() => setViewMode('customer')}
          style={[styles.modeTab, viewMode === 'customer' && styles.modeTabActive]}
        >
          <FishermanIcon
            name="sparkles"
            size={14}
            color={viewMode === 'customer' ? '#FFFFFF' : ui.muted}
          />
          <Text
            numberOfLines={1}
            style={[styles.modeTabText, viewMode === 'customer' && styles.modeTabTextActive]}
          >
            Customer Preview
          </Text>
        </Pressable>
      </View>

      {/* 03. CUSTOMER VIEW / PREVIEW MODE BANNER */}
      {viewMode === 'customer' ? (
        <View style={styles.customerNoticeBanner}>
          <View style={styles.customerNoticeLeft}>
            <View style={styles.customerNoticeIconWrap}>
              <FishermanIcon name="sparkles" size={16} color={ui.tealDark} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.customerNoticeTitle}>Customer Preview Mode</Text>
              <Text style={styles.customerNoticeSub}>
                This is how buyers see your storefront in the FishMate marketplace.
              </Text>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={handleOpenCustomerRoute}
            style={styles.openMarketplaceBtn}
          >
            <Text numberOfLines={1} style={styles.openMarketplaceText}>
              Open in App ↗
            </Text>
          </Pressable>
        </View>
      ) : null}

      {/* 02. QUICK NAVIGATION BUTTONS (S03, S04, A07) */}
      <View style={styles.quickNavGrid}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Edit Profile (S03)"
          onPress={() => router.push('/fisherman/s03' as never)}
          style={styles.navCard}
        >
          <View style={[styles.navIconBox, { backgroundColor: ui.tealLight }]}>
            <FishermanIcon name="user" size={17} color={ui.tealDark} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={styles.navTitleRow}>
              <Text numberOfLines={1} style={styles.navTitle}>Edit Profile</Text>
              <View style={[styles.screenBadge, { backgroundColor: ui.tealLight }]}>
                <Text style={[styles.screenBadgeText, { color: ui.tealDark }]}>S03</Text>
              </View>
            </View>
            <Text numberOfLines={1} style={styles.navSub}>Bio, vessel & specialties</Text>
          </View>
          <FishermanIcon name="chevron-right" size={14} color={ui.muted} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Delivery Settings (S04)"
          onPress={() => router.push('/fisherman/s04' as never)}
          style={styles.navCard}
        >
          <View style={[styles.navIconBox, { backgroundColor: ui.softBlue }]}>
            <FishermanIcon name="pin" size={17} color={ui.navy} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={styles.navTitleRow}>
              <Text numberOfLines={1} style={styles.navTitle}>Delivery Settings</Text>
              <View style={[styles.screenBadge, { backgroundColor: ui.softBlue }]}>
                <Text style={[styles.screenBadgeText, { color: ui.navy }]}>S04</Text>
              </View>
            </View>
            <Text numberOfLines={1} style={styles.navSub}>Radius km, fees & zones</Text>
          </View>
          <FishermanIcon name="chevron-right" size={14} color={ui.muted} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Account Settings (A07)"
          onPress={() => router.push('/fisherman/a07' as never)}
          style={styles.navCard}
        >
          <View style={[styles.navIconBox, { backgroundColor: ui.warningSoft }]}>
            <FishermanIcon name="orders" size={17} color={ui.warning} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={styles.navTitleRow}>
              <Text numberOfLines={1} style={styles.navTitle}>Account Settings</Text>
              <View style={[styles.screenBadge, { backgroundColor: ui.warningSoft }]}>
                <Text style={[styles.screenBadgeText, { color: ui.warning }]}>A07</Text>
              </View>
            </View>
            <Text numberOfLines={1} style={styles.navSub}>Security, bank & log out</Text>
          </View>
          <FishermanIcon name="chevron-right" size={14} color={ui.muted} />
        </Pressable>
      </View>

      {/* 01. SELLER PROFILE CARD: PHOTO, NAME, VILLAGE, CONTACT */}
      <View style={styles.profileCard}>
        <View style={styles.sellerHeaderRow}>
          <Image source={profile.avatar} style={styles.avatar} resizeMode="cover" />
          <View style={styles.sellerInfoCol}>
            <View style={styles.badgeRow}>
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>VERIFIED SELLER</Text>
              </View>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>★ {profile.rating}</Text>
                <Text style={styles.ratingCount}>({profile.completedOrders})</Text>
              </View>
            </View>

            <Text numberOfLines={1} style={styles.name}>
              {profile.name}
            </Text>
            <Text numberOfLines={1} style={styles.title}>
              {profile.title}
            </Text>

            <View style={styles.villageRow}>
              <FishermanIcon name="pin" size={13} color={ui.tealDark} />
              <Text numberOfLines={1} style={styles.villageText}>
                {profile.village}
              </Text>
            </View>
          </View>
        </View>

        {/* BIO */}
        <View style={styles.bioBox}>
          <Text style={styles.bioText}>{profile.bio}</Text>
        </View>

        {/* CONTACT ACTIONS ROW */}
        <View style={styles.contactRow}>
          <Pressable
            accessibilityRole="button"
            onPress={handleCall}
            style={styles.callBtn}
          >
            <FishermanIcon name="phone" size={15} color="#FFFFFF" />
            <Text numberOfLines={1} style={styles.callBtnText}>
              Call {phone}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={handleCopyPhone}
            style={styles.copyBtn}
          >
            <FishermanIcon name="check" size={14} color={ui.tealDark} />
            <Text numberOfLines={1} style={styles.copyBtnText}>
              Copy
            </Text>
          </Pressable>
        </View>

        <View style={styles.cardDivider} />

        {/* METADATA ROWS */}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Fishing Vessel</Text>
          <Text style={styles.detailValue}>{profile.boatName ?? 'Sagara Rani II'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Harbor Reg #</Text>
          <Text style={styles.detailValue}>{profile.registrationNumber ?? 'CFV-A-4198-NEG'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Member Since</Text>
          <Text style={styles.detailValue}>{profile.joined}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Response Speed</Text>
          <Text style={styles.detailValue}>{profile.responseTime}</Text>
        </View>
      </View>

      {/* 01. FISH TYPES SOLD */}
      <SectionHeader
        title="Fish Types Sold"
        subtitle="Specialties & fresh seafood varieties on your storefront"
        count={profile.specialties.length}
      />
      <View style={styles.specialtiesWrap}>
        {profile.specialties.map((spec, i) => (
          <View key={i} style={styles.specialtyChip}>
            <FishermanIcon name="sparkles" size={12} color={ui.tealDark} />
            <Text numberOfLines={1} style={styles.specialtyText}>
              {spec}
            </Text>
          </View>
        ))}
      </View>

      {/* 01. SHOP / SELLING LOCATION */}
      <SectionHeader
        title="Shop & Selling Location"
        subtitle="Harbor landing stall & customer pickup spot"
      />
      <View style={styles.locationCard}>
        <View style={styles.locationHeaderRow}>
          <View style={styles.locationIconWrap}>
            <FishermanIcon name="pin" size={20} color={ui.tealDark} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text numberOfLines={1} style={styles.stallTitle}>
              {profile.village}
            </Text>
            <Text style={styles.stallAddress}>
              {profile.stallAddress ?? 'Stall #14, Pier Gate 02, Negombo Fish Harbor, Marine Drive'}
            </Text>
          </View>
        </View>

        <View style={styles.locationDivider} />

        <View style={styles.locationMetaRow}>
          <View style={styles.locationMetaItem}>
            <Text style={styles.locationMetaLabel}>Harbor Berth</Text>
            <Text numberOfLines={1} style={styles.locationMetaValue}>
              {profile.harborMooring ?? 'Berth A-07 (Opposite Ice Factory)'}
            </Text>
          </View>

          <View style={styles.locationMetaItem}>
            <Text style={styles.locationMetaLabel}>Operating Hours</Text>
            <Text numberOfLines={1} style={styles.locationMetaValue}>
              {profile.operatingHours ?? '05:00 AM – 02:00 PM (Daily)'}
            </Text>
          </View>
        </View>

        <View style={styles.pickupPill}>
          <FishermanIcon name="check" size={13} color={ui.tealDark} />
          <Text style={styles.pickupPillText}>
            Direct customer pickup available at harbor pier gate upon boat landing.
          </Text>
        </View>
      </View>

      {/* 01. SHOP PHOTOS GALLERY */}
      <SectionHeader
        title="Shop & Harbor Gallery"
        subtitle="Photos of your vessel, landing dock and cold ice stall"
        count={profile.shopImages.length}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.galleryScroll}
      >
        {profile.shopImages.map((img, index) => (
          <Pressable
            key={index}
            accessibilityRole="imagebutton"
            accessibilityLabel={`View shop photo ${index + 1}`}
            onPress={() => setSelectedPhoto(img)}
            style={styles.galleryCard}
          >
            <Image source={img} style={styles.galleryImg} resizeMode="cover" />
            <View style={styles.galleryBadge}>
              <Text style={styles.galleryBadgeText}>Photo {index + 1}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* 01. DELIVERY AVAILABILITY & MAX DISTANCE */}
      <SectionHeader
        title="Delivery & Coverage"
        subtitle="Customer delivery options & maximum distance radius"
      />
      <View style={styles.deliveryCard}>
        <View style={styles.deliveryTopRow}>
          <View style={styles.deliveryStatusRow}>
            <View
              style={[
                styles.deliveryDot,
                profile.deliveryAvailable !== false ? styles.dotActive : styles.dotInactive,
              ]}
            />
            <Text style={styles.deliveryStatusText}>
              {profile.deliveryAvailable !== false
                ? 'Doorstep Delivery Active'
                : 'Delivery Paused (Harbor Pickup Only)'}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/fisherman/s04' as never)}
            style={styles.changeSettingsBtn}
          >
            <Text style={styles.changeSettingsText}>Edit (S04)</Text>
          </Pressable>
        </View>

        <View style={styles.deliveryRadiusBox}>
          <View style={styles.radiusMainCol}>
            <Text style={styles.radiusValue}>{profile.maxDistanceKm ?? 15} km</Text>
            <Text style={styles.radiusLabel}>Maximum Delivery Radius</Text>
          </View>
          <View style={styles.radiusFeeCol}>
            <Text style={styles.feeValue}>
              {profile.deliveryFee ? money(profile.deliveryFee) : 'Rs. 250'}
            </Text>
            <Text style={styles.feeLabel}>Standard Fee</Text>
          </View>
        </View>

        <Text style={styles.coverageTownsTitle}>Covered Neighborhoods & Towns:</Text>
        <View style={styles.townsChipWrap}>
          {(profile.deliveryTowns ?? ['Negombo', 'Kochchikade', 'Ja-Ela', 'Seeduwa', 'Katunayake']).map(
            (town, idx) => (
              <View key={idx} style={styles.townChip}>
                <Text style={styles.townChipText}>📍 {town}</Text>
              </View>
            ),
          )}
        </View>

        <View style={styles.deliveryNoteRow}>
          <FishermanIcon name="clock" size={13} color={ui.muted} />
          <Text style={styles.deliveryNoteText}>
            Dispatched on crushed ice within 30–45 mins of boat arrival.
          </Text>
        </View>
      </View>

      {/* 01. PUBLISHED LISTINGS PREVIEW */}
      <SectionHeader
        title="Published Listings Preview"
        subtitle="Active fish batches currently visible on your public storefront"
        count={listings.length}
        actionText="+ Add (S06)"
        onAction={() => router.push('/fisherman/s06')}
      />

      {listings.length === 0 ? (
        <View style={styles.emptyListingsBox}>
          <FishermanIcon name="sparkles" size={24} color={ui.tealDark} />
          <Text style={styles.emptyListingsTitle}>No Catch Published Yet</Text>
          <Text style={styles.emptyListingsSub}>
            Publish your landed fish batches so seafood buyers can place instant pre-orders.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/fisherman/s06')}
            style={styles.addCatchBtn}
          >
            <Text style={styles.addCatchBtnText}>+ Publish Catch (S06)</Text>
          </Pressable>
        </View>
      ) : (
        listings.slice(0, 3).map((item) => (
          <View key={item.id} style={styles.listingPreviewCard}>
            <Image source={item.image} style={styles.listingImg} resizeMode="cover" />
            <View style={styles.listingBody}>
              <View style={styles.listingTopRow}>
                <Text numberOfLines={1} style={styles.listingTitle}>
                  {item.name}
                </Text>
                <Text style={styles.listingPrice}>{money(item.price)}/kg</Text>
              </View>

              <Text numberOfLines={1} style={styles.listingSub}>
                {item.category} · {item.freshness}
              </Text>

              <View style={styles.listingFooterRow}>
                <View style={styles.weightPill}>
                  <Text style={styles.weightPillText}>{item.weightLabel}</Text>
                </View>
                <View
                  style={[
                    styles.stockPill,
                    item.stockLabel === 'Ready stock' ? styles.stockReady : styles.stockLimited,
                  ]}
                >
                  <Text
                    style={[
                      styles.stockPillText,
                      item.stockLabel === 'Ready stock'
                        ? styles.stockReadyText
                        : styles.stockLimitedText,
                    ]}
                  >
                    ● {item.stockLabel}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ))
      )}

      {listings.length > 3 && (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/fisherman/listings')}
          style={styles.viewAllListingsBtn}
        >
          <Text style={styles.viewAllListingsText}>
            View All {listings.length} Catch Batches in My Catch →
          </Text>
        </Pressable>
      )}

      {/* FULL PHOTO ZOOM MODAL */}
      <Modal
        visible={!!selectedPhoto}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPhoto(null)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setSelectedPhoto(null)}
        >
          <View style={styles.modalContent}>
            {selectedPhoto && (
              <Image source={selectedPhoto} style={styles.modalImage} resizeMode="contain" />
            )}
            <Pressable
              accessibilityRole="button"
              onPress={() => setSelectedPhoto(null)}
              style={styles.modalCloseBtn}
            >
              <Text style={styles.modalCloseText}>Close Preview ✕</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </FishermanShell>
  );
}

const styles = StyleSheet.create({
  modeSwitchBar: {
    flexDirection: 'row',
    backgroundColor: '#E8F3F2',
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D2E8E5',
    gap: 4,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 12,
  },
  modeTabActive: {
    backgroundColor: ui.teal,
    shadowColor: ui.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: '800',
    color: ui.muted,
  },
  modeTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  customerNoticeBanner: {
    backgroundColor: ui.tealLight,
    borderWidth: 1,
    borderColor: '#BFE7E2',
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  customerNoticeLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  customerNoticeIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerNoticeTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: ui.tealDark,
  },
  customerNoticeSub: {
    fontSize: 10,
    color: ui.navy,
    lineHeight: 14,
    marginTop: 2,
  },
  openMarketplaceBtn: {
    backgroundColor: ui.teal,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  openMarketplaceText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  quickNavGrid: {
    gap: 9,
    marginBottom: 16,
  },
  navCard: {
    backgroundColor: ui.surface,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: ui.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: ui.shadow,
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  navIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: ui.navy,
  },
  screenBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  screenBadgeText: {
    fontSize: 9,
    fontWeight: '900',
  },
  navSub: {
    fontSize: 11,
    color: ui.muted,
    marginTop: 2,
  },
  profileCard: {
    backgroundColor: ui.surface,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: ui.border,
    shadowColor: ui.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    marginBottom: 10,
  },
  sellerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: ui.tealLight,
  },
  sellerInfoCol: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
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
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: ui.goldSoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#9E720A',
  },
  ratingCount: {
    fontSize: 8,
    fontWeight: '700',
    color: ui.muted,
  },
  name: {
    fontSize: 19,
    fontWeight: '900',
    color: ui.navy,
    letterSpacing: -0.4,
  },
  title: {
    fontSize: 11,
    color: ui.muted,
    marginTop: 2,
  },
  villageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  villageText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.tealDark,
  },
  bioBox: {
    backgroundColor: ui.softBlue,
    padding: 12,
    borderRadius: 14,
    marginTop: 14,
  },
  bioText: {
    fontSize: 11,
    color: ui.navy,
    lineHeight: 17,
  },
  contactRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  callBtn: {
    flex: 1,
    backgroundColor: ui.teal,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  callBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  copyBtn: {
    backgroundColor: ui.tealLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  copyBtnText: {
    color: ui.tealDark,
    fontSize: 12,
    fontWeight: '800',
  },
  cardDivider: {
    height: 1,
    backgroundColor: ui.borderSubtle,
    marginVertical: 14,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 9,
    gap: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: ui.muted,
    fontWeight: '600',
    flexShrink: 0,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '800',
    color: ui.navy,
    flex: 1,
    textAlign: 'right',
    lineHeight: 18,
  },
  specialtiesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
    marginBottom: 6,
  },
  specialtyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: ui.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ui.border,
  },
  specialtyText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.navy,
  },
  locationCard: {
    backgroundColor: ui.surface,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: ui.border,
    shadowColor: ui.shadow,
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  locationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  locationIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: ui.tealLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stallTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: ui.navy,
  },
  stallAddress: {
    fontSize: 11,
    color: ui.muted,
    lineHeight: 16,
    marginTop: 3,
  },
  locationDivider: {
    height: 1,
    backgroundColor: ui.borderSubtle,
    marginVertical: 12,
  },
  locationMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  locationMetaItem: {
    flex: 1,
  },
  locationMetaLabel: {
    fontSize: 10,
    color: ui.muted,
    fontWeight: '700',
  },
  locationMetaValue: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.navy,
    marginTop: 2,
  },
  pickupPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: ui.tealLight,
    padding: 10,
    borderRadius: 12,
    marginTop: 12,
  },
  pickupPillText: {
    flex: 1,
    fontSize: 10,
    fontWeight: '800',
    color: ui.tealDark,
    lineHeight: 14,
  },
  galleryScroll: {
    gap: 12,
    paddingRight: 10,
    paddingBottom: 4,
  },
  galleryCard: {
    width: 170,
    height: 115,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: ui.surface,
    borderWidth: 1,
    borderColor: ui.border,
  },
  galleryImg: {
    width: '100%',
    height: '100%',
  },
  galleryBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(6, 63, 80, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  galleryBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  deliveryCard: {
    backgroundColor: ui.surface,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: ui.border,
    shadowColor: ui.shadow,
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  deliveryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deliveryStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deliveryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: ui.success,
  },
  dotInactive: {
    backgroundColor: ui.danger,
  },
  deliveryStatusText: {
    fontSize: 12,
    fontWeight: '800',
    color: ui.navy,
  },
  changeSettingsBtn: {
    backgroundColor: ui.softBlue,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  changeSettingsText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.navy,
  },
  deliveryRadiusBox: {
    flexDirection: 'row',
    backgroundColor: '#F5FAF9',
    borderRadius: 16,
    padding: 14,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#E2F1EE',
  },
  radiusMainCol: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#D7ECE8',
    paddingRight: 10,
  },
  radiusValue: {
    fontSize: 22,
    fontWeight: '900',
    color: ui.tealDark,
    letterSpacing: -0.5,
  },
  radiusLabel: {
    fontSize: 10,
    color: ui.muted,
    fontWeight: '700',
    marginTop: 2,
  },
  radiusFeeCol: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: 'center',
  },
  feeValue: {
    fontSize: 16,
    fontWeight: '900',
    color: ui.navy,
  },
  feeLabel: {
    fontSize: 10,
    color: ui.muted,
    fontWeight: '700',
    marginTop: 2,
  },
  coverageTownsTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.navy,
    marginBottom: 6,
  },
  townsChipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  townChip: {
    backgroundColor: ui.tealLight,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
  },
  townChipText: {
    fontSize: 10,
    fontWeight: '800',
    color: ui.tealDark,
  },
  deliveryNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  deliveryNoteText: {
    fontSize: 10,
    color: ui.muted,
    flex: 1,
  },
  emptyListingsBox: {
    backgroundColor: ui.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ui.border,
  },
  emptyListingsTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: ui.navy,
    marginTop: 10,
  },
  emptyListingsSub: {
    fontSize: 11,
    color: ui.muted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
    maxWidth: 260,
  },
  addCatchBtn: {
    backgroundColor: ui.teal,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
    marginTop: 14,
  },
  addCatchBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  listingPreviewCard: {
    backgroundColor: ui.surface,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: ui.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
    shadowColor: ui.shadow,
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  listingImg: {
    width: 68,
    height: 68,
    borderRadius: 14,
  },
  listingBody: {
    flex: 1,
    minWidth: 0,
  },
  listingTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listingTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: ui.navy,
    flex: 1,
    minWidth: 0,
  },
  listingPrice: {
    fontSize: 13,
    fontWeight: '900',
    color: ui.tealDark,
    marginLeft: 6,
  },
  listingSub: {
    fontSize: 10,
    color: ui.muted,
    marginTop: 2,
  },
  listingFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  weightPill: {
    backgroundColor: ui.softBlue,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  weightPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: ui.navy,
  },
  stockPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  stockReady: {
    backgroundColor: ui.successSoft,
  },
  stockLimited: {
    backgroundColor: ui.warningSoft,
  },
  stockPillText: {
    fontSize: 9,
    fontWeight: '900',
  },
  stockReadyText: {
    color: ui.success,
  },
  stockLimitedText: {
    color: ui.warning,
  },
  viewAllListingsBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  viewAllListingsText: {
    fontSize: 12,
    fontWeight: '800',
    color: ui.tealDark,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 30, 40, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: 300,
    borderRadius: 20,
  },
  modalCloseBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    marginTop: 18,
  },
  modalCloseText: {
    fontSize: 13,
    fontWeight: '900',
    color: ui.navy,
  },
});

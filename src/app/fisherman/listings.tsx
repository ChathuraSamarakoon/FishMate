import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { FishermanShell } from '@/components/fisherman/FishermanShell';
import { FishermanIcon } from '@/components/fisherman/FishermanIcon';
import { EmptyStateCard, SectionHeader, money } from '@/components/fisherman/atoms';
import { fishermanUi as ui } from '@/components/fisherman/theme';
import { useFisherman } from '@/components/fisherman/FishermanContext';

export default function FishermanListingsScreen() {
  const { listings, toggleListingStock, addListing } = useFisherman();

  const handleToggleStock = (id: string, name: string) => {
    toggleListingStock(id);
    Alert.alert('Stock Status Updated', `${name} availability toggled.`);
  };

  const handleAddNewCatch = () => {
    Alert.alert(
      'New Catch Options',
      'Choose how you want to add today’s landed catch:',
      [
        {
          text: 'Open Full Form (S06)',
          onPress: () => router.push('/fisherman/s06'),
        },
        {
          text: 'Quick Add Thalapath (12kg)',
          onPress: () => {
            const newItem = {
              id: `listing-${Date.now()}`,
              name: 'Sailfish (Thalapath)',
              category: 'Premium Pelagic',
              shortDescription: 'Firm large cuts, deep-sea fresh landed.',
              description: 'Fresh sailfish caught this morning offshore Negombo.',
              price: 3800,
              unit: '/kg',
              weightLabel: '12 kg available',
              availableKg: 12,
              stockLabel: 'Ready stock',
              freshness: 'Landed 30 mins ago',
              rating: 5.0,
              reviewCount: 1,
              location: 'Negombo Fish Harbor',
              deliveryEta: '30–45 min',
              distance: 'Harbor Gate',
              image: require('../../../assets/customer/tuna.jpg'),
              sellerId: 'fisher-01',
              tags: ['New catch', 'Super fresh'],
            };
            addListing(newItem);
            Alert.alert('Catch Added', 'Sailfish (Thalapath) 12kg added to your active marketplace listings!');
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  };

  return (
    <FishermanShell
      title="My Fresh Catch"
      subtitle="Active fish listings & daily market prices"
      rightIcon="plus"
      rightLabel="Add catch"
      onRightPress={handleAddNewCatch}
    >
      <View style={styles.topBanner}>
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerEyebrow}>MARKETPLACE INVENTORY</Text>
          <Text style={styles.bannerTitle}>{listings.length} Active Fish Batches</Text>
          <Text style={styles.bannerDesc}>
            Items shown below are live in the FishMate customer marketplace with your harbor pricing.
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={handleAddNewCatch}
          style={styles.addBtn}
        >
          <FishermanIcon name="plus" size={16} color="#FFFFFF" />
          <Text style={styles.addBtnText}>+ Add Catch</Text>
        </Pressable>
      </View>

      <SectionHeader
        title="Live Seafood Listings"
        subtitle="Tap stock label to toggle ready / limited availability"
        count={listings.length}
      />

      {listings.length === 0 ? (
        <EmptyStateCard
          icon="sparkles"
          title="No active fish listings"
          description="Your catch inventory is currently empty. Add your landed fish batches to start receiving customer pre-orders."
          actionText="+ Add Fresh Catch (S06)"
          onAction={handleAddNewCatch}
        />
      ) : (
        listings.map((item) => (
        <View key={item.id} style={styles.listingCard}>
          <Image source={item.image} style={styles.listingImg} resizeMode="cover" />
          <View style={styles.listingBody}>
            <View style={styles.listingTitleRow}>
              <Text numberOfLines={1} style={styles.listingName}>
                {item.name}
              </Text>
              <Text style={styles.listingPrice}>{money(item.price)}</Text>
            </View>

            <Text numberOfLines={1} style={styles.listingSub}>
              {item.category} · {item.freshness}
            </Text>

            <View style={styles.listingBottomRow}>
              <View style={styles.stockInfoPill}>
                <Text style={styles.stockInfoText}>{item.weightLabel}</Text>
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={() => handleToggleStock(item.id, item.name)}
                style={[
                  styles.stockTogglePill,
                  item.stockLabel === 'Ready stock'
                    ? styles.stockReady
                    : styles.stockLimited,
                ]}
              >
                <Text
                  style={[
                    styles.stockToggleText,
                    item.stockLabel === 'Ready stock'
                      ? styles.stockReadyText
                      : styles.stockLimitedText,
                  ]}
                >
                  {item.stockLabel}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )))}
    </FishermanShell>
  );
}

const styles = StyleSheet.create({
  topBanner: {
    backgroundColor: ui.surface,
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: ui.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerEyebrow: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: ui.tealDark,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: ui.navy,
    marginTop: 3,
  },
  bannerDesc: {
    fontSize: 11,
    color: ui.muted,
    lineHeight: 16,
    marginTop: 4,
  },
  addBtn: {
    backgroundColor: ui.teal,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 14,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
  },
  listingCard: {
    backgroundColor: ui.surface,
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: ui.border,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  listingImg: {
    width: 76,
    height: 76,
    borderRadius: 15,
  },
  listingBody: {
    flex: 1,
  },
  listingTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listingName: {
    fontSize: 15,
    fontWeight: '900',
    color: ui.navy,
    flex: 1,
  },
  listingPrice: {
    fontSize: 14,
    fontWeight: '900',
    color: ui.tealDark,
    marginLeft: 6,
  },
  listingSub: {
    fontSize: 11,
    color: ui.muted,
    marginTop: 3,
  },
  listingBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 9,
  },
  stockInfoPill: {
    backgroundColor: ui.softBlue,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  stockInfoText: {
    fontSize: 10,
    fontWeight: '800',
    color: ui.navy,
  },
  stockTogglePill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 9,
  },
  stockReady: {
    backgroundColor: ui.successSoft,
  },
  stockLimited: {
    backgroundColor: ui.warningSoft,
  },
  stockToggleText: {
    fontSize: 10,
    fontWeight: '900',
  },
  stockReadyText: {
    color: ui.success,
  },
  stockLimitedText: {
    color: ui.warning,
  },
});

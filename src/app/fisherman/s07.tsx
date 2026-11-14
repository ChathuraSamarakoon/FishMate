import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { FishermanShell } from '@/components/fisherman/FishermanShell';
import { FishermanIcon } from '@/components/fisherman/FishermanIcon';
import { money } from '@/components/fisherman/atoms';
import { fishermanUi as ui } from '@/components/fisherman/theme';
import { useFisherman } from '@/components/fisherman/FishermanContext';

export default function S07ListingDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { listings, updateListing } = useFisherman();

  const listing = listings.find((l) => l.id === id) || listings[0];

  if (!listing) {
    return (
      <FishermanShell back title="S07 · Catch Not Found" subtitle="Fish listing unavailable">
        <View style={styles.notFoundCard}>
          <Text style={styles.notFoundText}>This catch listing could not be found.</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace('/fisherman/listings')}
            style={styles.backBtn}
          >
            <Text style={styles.backBtnText}>Back to My Catch</Text>
          </Pressable>
        </View>
      </FishermanShell>
    );
  }

  const isReady = listing.stockLabel === 'Ready stock' || listing.stockLabel === 'Available';
  const isLimited = listing.stockLabel === 'Limited stock';

  const handleToggleStatus = () => {
    const nextStatus = isReady ? 'Unavailable' : 'Ready stock';
    updateListing(listing.id, { stockLabel: nextStatus });
    Alert.alert('Status Updated', `${listing.name} is now marked as "${nextStatus}".`);
  };

  const handleEdit = () => {
    router.push({ pathname: '/fisherman/s08', params: { id: listing.id } } as never);
  };

  return (
    <FishermanShell
      title="S07 · Catch Details"
      subtitle={`${listing.name} · Preview`}
      back
      rightIcon="sparkles"
      rightLabel="Edit"
      onRightPress={handleEdit}
    >
      <View style={styles.badgeRow}>
        <View style={styles.screenTag}>
          <Text style={styles.screenTagText}>SCREEN S07</Text>
        </View>
        <Text style={styles.helperText}>Single catch listing details & buyer view</Text>
      </View>

      {/* HERO IMAGE & RATING */}
      <View style={styles.imageCard}>
        <Image source={listing.image} style={styles.heroImage} resizeMode="cover" />
        <View style={styles.imageOverlayTop}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>{listing.category}</Text>
          </View>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>★ {listing.rating.toFixed(1)} ({listing.reviewCount})</Text>
          </View>
        </View>
      </View>

      {/* TITLE & PRICE CARD */}
      <View style={styles.card}>
        <View style={styles.titlePriceRow}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.fishName}>{listing.name}</Text>
            <View style={styles.locationRow}>
              <FishermanIcon name="pin" size={12} color={ui.tealDark} />
              <Text style={styles.locationText}>{listing.location}</Text>
            </View>
          </View>
          <View style={styles.priceWrap}>
            <Text style={styles.priceAmount}>{money(listing.price)}</Text>
            <Text style={styles.priceUnit}>{listing.unit || '/kg'}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* STOCK STATUS & WEIGHT */}
        <View style={styles.stockRow}>
          <View style={styles.weightCol}>
            <Text style={styles.statLabel}>Available Catch</Text>
            <Text style={styles.statValue}>
              {listing.weightLabel || `${listing.availableKg} kg available`}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Toggle availability status"
            onPress={handleToggleStatus}
            style={[
              styles.statusPill,
              isReady
                ? styles.statusReady
                : isLimited
                ? styles.statusLimited
                : styles.statusUnavailable,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                isReady
                  ? styles.dotReady
                  : isLimited
                  ? styles.dotLimited
                  : styles.dotUnavailable,
              ]}
            />
            <Text
              style={[
                styles.statusText,
                isReady
                  ? styles.statusReadyText
                  : isLimited
                  ? styles.statusLimitedText
                  : styles.statusUnavailableText,
              ]}
            >
              {listing.stockLabel} (Tap to change)
            </Text>
          </Pressable>
        </View>
      </View>

      {/* FRESHNESS & LANDING DETAILS */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Freshness & Landed Pier</Text>
        <View style={styles.infoRow}>
          <FishermanIcon name="clock" size={14} color={ui.tealDark} />
          <Text style={styles.infoText}>{listing.freshness}</Text>
        </View>
        <View style={styles.infoRow}>
          <FishermanIcon name="boat" size={14} color={ui.tealDark} />
          <Text style={styles.infoText}>Landed direct from Sagara Rani II deep-sea voyage</Text>
        </View>
        <View style={styles.infoRow}>
          <FishermanIcon name="pin" size={14} color={ui.tealDark} />
          <Text style={styles.infoText}>Chilled on clean crushed ice at Negombo Harbor stall</Text>
        </View>
      </View>

      {/* DESCRIPTION */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Catch Description</Text>
        <Text style={styles.descriptionText}>
          {listing.description || listing.shortDescription || 'Freshly landed deep-sea fish, cleaned and iced.'}
        </Text>
      </View>

      {/* PREPARATION CUTS & SERVICES */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Preparation Options Offered</Text>
        <View style={styles.prepChipsRow}>
          <View style={styles.prepChip}>
            <Text style={styles.prepChipText}>✓ Whole Fish on Ice</Text>
          </View>
          <View style={styles.prepChip}>
            <Text style={styles.prepChipText}>✓ Cleaned & Gutted</Text>
          </View>
          <View style={styles.prepChip}>
            <Text style={styles.prepChipText}>✓ Sliced Steak Packs</Text>
          </View>
        </View>
      </View>

      {/* ACTION BUTTONS */}
      <View style={styles.actionsBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Edit Listing (S08)"
          onPress={handleEdit}
          style={styles.editBtn}
        >
          <FishermanIcon name="sparkles" size={16} color="#FFFFFF" />
          <Text style={styles.editBtnText}>Edit Catch Listing (S08)</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/fisherman/listings')}
          style={styles.cancelBtn}
        >
          <Text style={styles.cancelBtnText}>Back to My Catch</Text>
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
  imageCard: {
    position: 'relative',
    height: 200,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#EBF4F6',
    borderWidth: 1,
    borderColor: ui.border,
    marginBottom: 14,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlayTop: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryPill: {
    backgroundColor: 'rgba(6, 63, 80, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  ratingBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '900',
    color: ui.navy,
  },
  card: {
    backgroundColor: ui.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: ui.border,
    marginBottom: 14,
    shadowColor: ui.shadow,
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  titlePriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  fishName: {
    fontSize: 18,
    fontWeight: '900',
    color: ui.navy,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 11,
    color: ui.muted,
    fontWeight: '600',
  },
  priceWrap: {
    alignItems: 'flex-end',
  },
  priceAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: ui.tealDark,
  },
  priceUnit: {
    fontSize: 11,
    fontWeight: '600',
    color: ui.muted,
  },
  divider: {
    height: 1,
    backgroundColor: ui.borderSubtle,
    marginVertical: 12,
  },
  stockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weightCol: {
    gap: 2,
  },
  statLabel: {
    fontSize: 10,
    color: ui.muted,
    fontWeight: '700',
  },
  statValue: {
    fontSize: 13,
    fontWeight: '900',
    color: ui.navy,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusReady: {
    backgroundColor: ui.successSoft,
  },
  statusLimited: {
    backgroundColor: ui.warningSoft,
  },
  statusUnavailable: {
    backgroundColor: '#FDECEC',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  dotReady: {
    backgroundColor: ui.success,
  },
  dotLimited: {
    backgroundColor: ui.warning,
  },
  dotUnavailable: {
    backgroundColor: ui.danger,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '900',
  },
  statusReadyText: {
    color: ui.success,
  },
  statusLimitedText: {
    color: ui.warning,
  },
  statusUnavailableText: {
    color: ui.danger,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: ui.navy,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    color: ui.navy,
    flex: 1,
  },
  descriptionText: {
    fontSize: 12,
    color: ui.muted,
    lineHeight: 18,
  },
  prepChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  prepChip: {
    backgroundColor: ui.tealLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  prepChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.tealDark,
  },
  actionsBar: {
    gap: 10,
    marginTop: 6,
    marginBottom: 24,
  },
  editBtn: {
    backgroundColor: ui.teal,
    borderRadius: 16,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: ui.tealDark,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  editBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  cancelBtn: {
    backgroundColor: ui.surface,
    borderRadius: 16,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: ui.border,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: ui.muted,
  },
  notFoundCard: {
    backgroundColor: ui.surface,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 14,
    fontWeight: '700',
    color: ui.muted,
    marginBottom: 16,
  },
  backBtn: {
    backgroundColor: ui.teal,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
});

import { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { FishermanShell } from '@/components/fisherman/FishermanShell';
import { FishermanIcon } from '@/components/fisherman/FishermanIcon';
import { EmptyStateCard, SectionHeader, money } from '@/components/fisherman/atoms';
import { fishermanUi as ui } from '@/components/fisherman/theme';
import { useFisherman } from '@/components/fisherman/FishermanContext';
import type { FishListing } from '@/types';

type FilterTab = 'all' | 'available' | 'unavailable';

export default function FishermanListingsScreen() {
  const { listings, updateListing } = useFisherman();
  const [filter, setFilter] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 01. ALL / AVAILABLE / UNAVAILABLE FILTER COUNTS
  const allCount = listings.length;
  const availableCount = listings.filter(
    (item) => item.stockLabel === 'Ready stock' || item.stockLabel === 'Available',
  ).length;
  const unavailableCount = listings.filter(
    (item) =>
      item.stockLabel === 'Unavailable' ||
      item.stockLabel === 'Limited stock' ||
      (item.availableKg !== undefined && item.availableKg <= 0),
  ).length;

  // Real-time filtering by search and status
  const filteredListings = listings.filter((item) => {
    // Status filter
    if (filter === 'available') {
      const isAvailable = item.stockLabel === 'Ready stock' || item.stockLabel === 'Available';
      if (!isAvailable) return false;
    } else if (filter === 'unavailable') {
      const isUnavailable =
        item.stockLabel === 'Unavailable' ||
        item.stockLabel === 'Limited stock' ||
        (item.availableKg !== undefined && item.availableKg <= 0);
      if (!isUnavailable) return false;
    }

    // Search query matching name, category, freshness, or tags
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.freshness.toLowerCase().includes(q) ||
      item.tags?.some((t) => t.toLowerCase().includes(q))
    );
  });

  // 02. AVAILABILITY STATUS UPDATE
  const handleToggleStatus = (item: FishListing) => {
    const isCurrentlyAvailable =
      item.stockLabel === 'Ready stock' || item.stockLabel === 'Available';
    const nextStatus = isCurrentlyAvailable ? 'Unavailable' : 'Ready stock';

    updateListing(item.id, { stockLabel: nextStatus });
    Alert.alert(
      'Availability Updated',
      `${item.name} is now marked as "${nextStatus}". Customer marketplace immediately reflects this update.`,
    );
  };

  // 02. ADD FISH -> S06
  const handleAddFish = () => {
    router.push('/fisherman/s06' as never);
  };

  // 02. CARD -> S07
  const handleOpenDetails = (id: string) => {
    router.push({ pathname: '/fisherman/s07', params: { id } } as never);
  };

  // 02. EDIT -> S08
  const handleOpenEdit = (id: string) => {
    router.push({ pathname: '/fisherman/s08', params: { id } } as never);
  };

  return (
    <FishermanShell
      title="My Fish Listings"
      subtitle="Catch inventory, pricing & availability"
      rightIcon="plus"
      rightLabel="+ Add Fish (S06)"
      onRightPress={handleAddFish}
    >
      {/* 01. MY FISH LISTINGS HEADER BANNER */}
      <View style={styles.topBanner}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={styles.bannerBadgeRow}>
            <Text style={styles.bannerEyebrow}>MARKETPLACE INVENTORY</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{listings.length} Batches</Text>
            </View>
          </View>
          <Text numberOfLines={1} style={styles.bannerTitle}>
            My Fish Listings
          </Text>
          <Text style={styles.bannerDesc}>
            Manage prices, stock availability & preparation cuts visible to buyers.
          </Text>
        </View>

        {/* 01 & 02. + ADD FISH BUTTON -> S06 */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add New Fish (S06)"
          onPress={handleAddFish}
          style={styles.addFishBtn}
        >
          <FishermanIcon name="plus" size={16} color="#FFFFFF" />
          <Text style={styles.addFishBtnText}>+ Add Fish</Text>
        </Pressable>
      </View>

      {/* 01. SEARCH MY LISTINGS */}
      <View style={styles.searchBar}>
        <FishermanIcon name="search" size={16} color={ui.muted} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search fish species, cuts, or freshness..."
          placeholderTextColor={ui.mutedLight}
          style={styles.searchInput}
        />
        {searchQuery.length > 0 && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            onPress={() => setSearchQuery('')}
            hitSlop={8}
            style={styles.clearSearchBtn}
          >
            <Text style={styles.clearSearchText}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* 01. ALL / AVAILABLE / UNAVAILABLE FILTERS */}
      <View style={styles.filterTabsRow}>
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: filter === 'all' }}
          onPress={() => setFilter('all')}
          style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
        >
          <Text
            style={[styles.filterChipText, filter === 'all' && styles.filterChipTextActive]}
          >
            All ({allCount})
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: filter === 'available' }}
          onPress={() => setFilter('available')}
          style={[styles.filterChip, filter === 'available' && styles.filterChipActive]}
        >
          <Text
            style={[styles.filterChipText, filter === 'available' && styles.filterChipTextActive]}
          >
            Available ({availableCount})
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: filter === 'unavailable' }}
          onPress={() => setFilter('unavailable')}
          style={[styles.filterChip, filter === 'unavailable' && styles.filterChipActive]}
        >
          <Text
            style={[
              styles.filterChipText,
              filter === 'unavailable' && styles.filterChipTextActive,
            ]}
          >
            Unavailable ({unavailableCount})
          </Text>
        </Pressable>
      </View>

      {/* SECTION HEADER */}
      <SectionHeader
        title={
          filter === 'all'
            ? 'All Catch Listings'
            : filter === 'available'
            ? 'Available Catch'
            : 'Unavailable Catch'
        }
        subtitle="Tap card to view details (S07), or tap Edit (S08) to modify"
        count={filteredListings.length}
      />

      {/* 03. NO LISTINGS EMPTY STATE */}
      {filteredListings.length === 0 ? (
        <EmptyStateCard
          icon="sparkles"
          title={
            searchQuery.trim()
              ? `No fish matching "${searchQuery}"`
              : filter === 'unavailable'
              ? 'No unavailable listings'
              : 'No active fish listings'
          }
          description={
            searchQuery.trim()
              ? 'Try searching with a different species name or clear the search filter.'
              : 'Your catch inventory is currently empty. Add your landed fish batches to start receiving customer pre-orders.'
          }
          actionText={searchQuery.trim() ? 'Clear Search' : '+ Add Fish Catch (S06)'}
          onAction={searchQuery.trim() ? () => setSearchQuery('') : handleAddFish}
        />
      ) : (
        /* 01. FISH CARDS (PHOTO, TYPE, PRICE/KG, QTY, STATUS) */
        filteredListings.map((item) => {
          const isReady = item.stockLabel === 'Ready stock' || item.stockLabel === 'Available';
          const isLimited = item.stockLabel === 'Limited stock';

          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={`View ${item.name} details (S07)`}
              onPress={() => handleOpenDetails(item.id)}
              style={({ pressed }) => [
                styles.listingCard,
                pressed && styles.cardPressed,
              ]}
            >
              {/* PHOTO */}
              <View style={styles.imageWrap}>
                <Image source={item.image} style={styles.listingImg} resizeMode="cover" />
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>★ {item.rating.toFixed(1)}</Text>
                </View>
              </View>

              {/* CARD DETAILS */}
              <View style={styles.listingBody}>
                <View style={styles.titlePriceRow}>
                  {/* TYPE */}
                  <Text numberOfLines={1} style={styles.fishName}>
                    {item.name}
                  </Text>
                  {/* PRICE/KG */}
                  <Text style={styles.fishPrice}>
                    {money(item.price)}
                    <Text style={styles.priceUnit}>{item.unit || '/kg'}</Text>
                  </Text>
                </View>

                {/* CATEGORY & FRESHNESS */}
                <Text numberOfLines={1} style={styles.categorySub}>
                  {item.category} · {item.freshness}
                </Text>

                {/* QTY & CONTROLS ROW */}
                <View style={styles.cardBottomRow}>
                  {/* QTY (WEIGHT AVAILABLE) */}
                  <View style={styles.qtyPill}>
                    <FishermanIcon name="bag" size={11} color={ui.navy} />
                    <Text style={styles.qtyText}>
                      {item.weightLabel || `${item.availableKg ?? 10} kg left`}
                    </Text>
                  </View>

                  {/* 01 & 02. STATUS CONTROL (TAP TO TOGGLE) */}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Toggle availability for ${item.name}`}
                    onPress={() => handleToggleStatus(item)}
                    style={[
                      styles.statusTogglePill,
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
                        styles.statusToggleText,
                        isReady
                          ? styles.statusReadyText
                          : isLimited
                          ? styles.statusLimitedText
                          : styles.statusUnavailableText,
                      ]}
                    >
                      {item.stockLabel}
                    </Text>
                  </Pressable>

                  {/* 01 & 02. EDIT CONTROL -> S08 */}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Edit ${item.name} (S08)`}
                    onPress={() => handleOpenEdit(item.id)}
                    style={styles.editBtn}
                    hitSlop={8}
                  >
                    <FishermanIcon name="sparkles" size={12} color={ui.tealDark} />
                    <Text style={styles.editBtnText}>Edit (S08)</Text>
                  </Pressable>
                </View>
              </View>
            </Pressable>
          );
        })
      )}
    </FishermanShell>
  );
}

const styles = StyleSheet.create({
  topBanner: {
    backgroundColor: ui.surface,
    padding: 16,
    borderRadius: 22,
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
    marginBottom: 14,
  },
  bannerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  bannerEyebrow: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: ui.tealDark,
  },
  countBadge: {
    backgroundColor: ui.tealLight,
    paddingHorizontal: 7,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  countBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: ui.tealDark,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: ui.navy,
  },
  bannerDesc: {
    fontSize: 11,
    color: ui.muted,
    lineHeight: 15,
    marginTop: 2,
  },
  addFishBtn: {
    backgroundColor: ui.teal,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 14,
    shadowColor: ui.tealDark,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  addFishBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ui.surface,
    borderWidth: 1,
    borderColor: ui.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: ui.navy,
    fontWeight: '600',
    paddingVertical: 0,
  },
  clearSearchBtn: {
    padding: 4,
  },
  clearSearchText: {
    fontSize: 12,
    fontWeight: '800',
    color: ui.muted,
  },
  filterTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterChip: {
    flex: 1,
    backgroundColor: '#F5FAF9',
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4ECE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: ui.teal,
    borderColor: ui.tealDark,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.tealDark,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  listingCard: {
    backgroundColor: ui.surface,
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: ui.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    shadowColor: ui.shadow,
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  imageWrap: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  listingImg: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(6, 63, 80, 0.75)',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  listingBody: {
    flex: 1,
    minWidth: 0,
  },
  titlePriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
  },
  fishName: {
    fontSize: 14,
    fontWeight: '900',
    color: ui.navy,
    flex: 1,
    minWidth: 0,
  },
  fishPrice: {
    fontSize: 14,
    fontWeight: '900',
    color: ui.tealDark,
  },
  priceUnit: {
    fontSize: 10,
    fontWeight: '600',
    color: ui.muted,
  },
  categorySub: {
    fontSize: 11,
    color: ui.muted,
    marginTop: 2,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 9,
    flexWrap: 'wrap',
  },
  qtyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: ui.softBlue,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
  },
  qtyText: {
    fontSize: 10,
    fontWeight: '800',
    color: ui.navy,
  },
  statusTogglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
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
    width: 6,
    height: 6,
    borderRadius: 3,
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
  statusToggleText: {
    fontSize: 10,
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
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: ui.tealLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
    marginLeft: 'auto',
  },
  editBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: ui.tealDark,
  },
});

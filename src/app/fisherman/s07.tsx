import { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { FishermanShell } from '@/components/fisherman/FishermanShell';
import { FishermanIcon } from '@/components/fisherman/FishermanIcon';
import { money } from '@/components/fisherman/atoms';
import { fishermanUi as ui } from '@/components/fisherman/theme';
import { useFisherman } from '@/components/fisherman/FishermanContext';

const shop1 = require('../../../assets/customer/shop_1.jpg');
const shop2 = require('../../../assets/customer/shop_2.jpg');

export default function S07ListingDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { listings, updateListing, profile } = useFisherman();

  // React 19 State hooks declared unconditionally at top
  const [viewMode, setViewMode] = useState<'seller' | 'customer'>('seller');
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [zoomPhoto, setZoomPhoto] = useState<ImageSourcePropType | null>(null);
  const [orderQty, setOrderQty] = useState(1.0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Locate the target listing
  const listing = listings.find((l) => l.id === id) || listings[0];

  if (!listing) {
    return (
      <FishermanShell
        back
        title="S07 · Catch Not Found"
        subtitle="Fish listing unavailable"
        onBack={() => router.replace('/fisherman/listings')}
      >
        <View style={styles.notFoundCard}>
          <View style={styles.notFoundIconWrap}>
            <FishermanIcon name="sparkles" size={32} color={ui.muted} />
          </View>
          <Text style={styles.notFoundTitle}>Catch Listing Not Found</Text>
          <Text style={styles.notFoundSub}>
            This fish listing may have been sold out, deleted, or expired from your harbor inventory.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace('/fisherman/listings')}
            style={styles.notFoundBtn}
          >
            <FishermanIcon name="arrow-left" size={16} color="#FFFFFF" />
            <Text style={styles.notFoundBtnText}>Back to My Listings (S05)</Text>
          </Pressable>
        </View>
      </FishermanShell>
    );
  }

  // Derive status
  const isUnavailable = listing.stockLabel === 'Unavailable';
  const isLimited = listing.stockLabel === 'Limited stock';
  const isReady =
    !isUnavailable &&
    (listing.stockLabel === 'Ready stock' ||
      listing.stockLabel === 'Available' ||
      listing.stockLabel === 'Fresh batch');

  // Photo gallery: use listing gallery or fallbacks
  const gallery: ImageSourcePropType[] =
    listing.galleryImages && listing.galleryImages.length > 0
      ? listing.galleryImages
      : [listing.image, shop1, shop2];

  const currentHeroPhoto = gallery[activePhotoIndex] || listing.image;

  // Metadata
  const displayListingDate =
    listing.listingDate || 'Today, 05:30 AM (Nov 14, 2026 · Morning Boat Landing)';
  const displaySellingLocation =
    listing.sellingLocation ||
    `${profile.village} · ${profile.stallAddress ?? 'Stall #14, Pier Gate 02, Marine Drive'}`;
  const totalBatchWorth = listing.price * listing.availableKg;

  // 02. BUTTON & NAVIGATION ACTIONS
  // Edit Listing -> S08
  const handleEdit = () => {
    router.push({ pathname: '/fisherman/s08', params: { id: listing.id } } as never);
  };

  // Mark Unavailable / Available toggle
  const handleToggleUnavailable = () => {
    if (isUnavailable) {
      updateListing(listing.id, { stockLabel: 'Ready stock' });
      Alert.alert(
        'Marked as Available ✓',
        `${listing.name} is now open for customer orders on the FishMate marketplace.`,
      );
    } else {
      updateListing(listing.id, { stockLabel: 'Unavailable' });
      Alert.alert(
        'Marked as Unavailable ✕',
        `${listing.name} is now hidden from customer orders. You can re-enable availability at any time.`,
      );
    }
  };

  const handleMarkUnavailable = () => {
    updateListing(listing.id, { stockLabel: 'Unavailable' });
    Alert.alert(
      'Marked as Unavailable ✕',
      `${listing.name} has been taken off customer ordering. Existing pending orders remain intact.`,
    );
  };

  const handleMarkAvailable = () => {
    updateListing(listing.id, { stockLabel: 'Ready stock' });
    Alert.alert(
      'Marked as Available ✓',
      `${listing.name} is now active and accepting orders from local buyers.`,
    );
  };

  // Back -> S05
  const handleBackToS05 = () => {
    router.replace('/fisherman/listings');
  };

  // Customer order stepper
  const handleQtyStep = (delta: number) => {
    setOrderQty((prev) => {
      const next = Number((prev + delta).toFixed(1));
      return Math.max(0.5, Math.min(listing.availableKg, next));
    });
  };

  return (
    <FishermanShell
      title="S07 · Catch Details"
      subtitle={`${listing.name} · Details & Preview`}
      back
      onBack={handleBackToS05}
      rightIcon="sparkles"
      rightLabel="Edit Listing (S08)"
      onRightPress={handleEdit}
    >
      {/* SCREEN BREADCRUMB */}
      <View style={styles.breadcrumbRow}>
        <View style={styles.screenTag}>
          <Text style={styles.screenTagText}>SCREEN S07</Text>
        </View>
        <Text numberOfLines={1} style={styles.breadcrumbText}>
          Single catch inventory details & customer preview
        </Text>
      </View>

      {/* TOP VIEW MODE TOGGLE (SELLER MANAGE vs CUSTOMER PREVIEW) */}
      <View style={styles.modeToggleBar}>
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: viewMode === 'seller' }}
          onPress={() => setViewMode('seller')}
          style={[styles.modeTab, viewMode === 'seller' && styles.modeTabActive]}
        >
          <FishermanIcon
            name="bag"
            size={14}
            color={viewMode === 'seller' ? '#FFFFFF' : ui.muted}
          />
          <Text
            numberOfLines={1}
            style={[styles.modeTabText, viewMode === 'seller' && styles.modeTabTextActive]}
          >
            Seller Management
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

      {/* 03. BEHAVIOR & VALIDATION: PROMINENT AVAILABILITY / STATUS UI BADGE */}
      <View
        style={[
          styles.prominentStatusCard,
          isReady
            ? styles.statusCardAvailable
            : isLimited
            ? styles.statusCardLimited
            : styles.statusCardUnavailable,
        ]}
      >
        <View style={styles.statusCardLeft}>
          <View
            style={[
              styles.prominentBadgePill,
              isReady
                ? styles.badgePillAvailable
                : isLimited
                ? styles.badgePillLimited
                : styles.badgePillUnavailable,
            ]}
          >
            <View
              style={[
                styles.prominentGlowingDot,
                isReady
                  ? styles.dotAvailable
                  : isLimited
                  ? styles.dotLimited
                  : styles.dotUnavailable,
              ]}
            />
            <Text
              style={[
                styles.prominentBadgeText,
                isReady
                  ? styles.badgeTextAvailable
                  : isLimited
                  ? styles.badgeTextLimited
                  : styles.badgeTextUnavailable,
              ]}
            >
              {isReady
                ? '● AVAILABLE FOR ORDERS'
                : isLimited
                ? '▲ LIMITED HARBOR STOCK'
                : '✕ CURRENTLY UNAVAILABLE'}
            </Text>
          </View>
          <Text style={styles.statusHelperText}>
            {isReady
              ? 'Active on storefront with instant customer booking and delivery.'
              : isLimited
              ? `Limited quantity (${listing.availableKg} kg remaining in stall). Fast dispatch.`
              : 'Listing is hidden from customer marketplace ordering.'}
          </Text>
        </View>

        {/* PROMINENT QUICK TOGGLE BUTTON */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isUnavailable ? 'Mark available' : 'Mark unavailable'}
          onPress={handleToggleUnavailable}
          style={[
            styles.quickStatusBtn,
            isUnavailable ? styles.quickStatusBtnGreen : styles.quickStatusBtnRed,
          ]}
        >
          {isUnavailable ? (
            <FishermanIcon name="check" size={13} color="#FFFFFF" />
          ) : (
            <Text style={{ color: '#DC2626', fontSize: 13, fontWeight: '900' }}>✕</Text>
          )}
          <Text
            numberOfLines={1}
            style={[
              styles.quickStatusBtnText,
              isUnavailable ? styles.quickStatusBtnTextGreen : styles.quickStatusBtnTextRed,
            ]}
          >
            {isUnavailable ? 'Mark Available' : 'Mark Unavailable'}
          </Text>
        </Pressable>
      </View>

      {/* ========================================================= */}
      {/* VIEW MODE: CUSTOMER-FACING PREVIEW                        */}
      {/* ========================================================= */}
      {viewMode === 'customer' ? (
        <View style={styles.customerPreviewContainer}>
          <View style={styles.previewNoticeBanner}>
            <View style={styles.previewNoticeIconWrap}>
              <FishermanIcon name="sparkles" size={16} color={ui.tealDark} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.previewNoticeTitle}>Customer Marketplace View</Text>
              <Text style={styles.previewNoticeSub}>
                This shows exactly what buyers see when viewing your catch in the FishMate app.
              </Text>
            </View>
          </View>

          {/* CUSTOMER CARD SHELL */}
          <View style={styles.customerCardShell}>
            {/* PHOTO WITH FRESH CATCH BADGE & FAVORITE BUTTON */}
            <View style={styles.customerPhotoWrap}>
              <Image source={currentHeroPhoto} resizeMode="cover" style={styles.customerPhoto} />
              <View style={styles.customerPhotoBadge}>
                <FishermanIcon name="check" color={ui.tealDark} size={14} />
                <Text style={styles.customerPhotoBadgeText}>Harbor Fresh Catch</Text>
              </View>
              <Pressable
                onPress={() => setIsFavorite(!isFavorite)}
                accessibilityRole="button"
                accessibilityLabel="Favorite catch"
                style={styles.customerFavBtn}
              >
                <FishermanIcon
                  name="sparkles"
                  color={isFavorite ? '#DC2626' : ui.navy}
                  size={18}
                />
              </Pressable>
            </View>

            {/* HEADLINE & RATING */}
            <View style={styles.customerHeadRow}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.customerCategoryText}>{listing.category.toUpperCase()}</Text>
                <Text style={styles.customerHeadlineText}>{listing.name}</Text>
              </View>
              <View style={styles.customerRatingBadge}>
                <Text style={styles.customerRatingText}>★ {listing.rating.toFixed(1)}</Text>
              </View>
            </View>

            <Text style={styles.customerDescText}>
              {listing.description ||
                listing.shortDescription ||
                'Freshly landed deep-sea fish, iced and prepared to customer specification.'}
            </Text>

            {/* TAGS */}
            <View style={styles.customerTagsRow}>
              {listing.tags.map((tag, idx) => (
                <View key={idx} style={styles.customerTag}>
                  <Text style={styles.customerTagText}>{tag}</Text>
                </View>
              ))}
            </View>

            {/* PRICE & STOCK PANEL */}
            <View style={styles.customerPricePanel}>
              <View>
                <Text style={styles.customerPriceLabel}>PRICE PER KILOGRAM</Text>
                <Text style={styles.customerPriceAmount}>
                  {money(listing.price)}{' '}
                  <Text style={styles.customerPricePer}>{listing.unit || '/ kg'}</Text>
                </Text>
              </View>
              <View style={styles.customerStockBadge}>
                <Text style={styles.customerStockText}>{listing.availableKg} kg available</Text>
              </View>
            </View>

            {/* STATS TILES */}
            <View style={styles.customerStatsGrid}>
              <View style={styles.customerStatCard}>
                <Text style={styles.customerStatLabel}>Freshness</Text>
                <Text numberOfLines={1} style={styles.customerStatValue}>
                  {listing.freshness}
                </Text>
              </View>
              <View style={styles.customerStatCard}>
                <Text style={styles.customerStatLabel}>Landing Site</Text>
                <Text numberOfLines={1} style={styles.customerStatValue}>
                  {profile.village}
                </Text>
              </View>
            </View>

            {/* QUANTITY STEPPER PREVIEW */}
            <View style={styles.customerQuantityCard}>
              <View>
                <Text style={styles.customerQtyLabel}>ORDER QUANTITY</Text>
                <Text style={styles.customerQtyValue}>{orderQty.toFixed(1)} kg</Text>
              </View>
              <View style={styles.customerStepper}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Decrease quantity"
                  onPress={() => handleQtyStep(-0.5)}
                  disabled={orderQty <= 0.5}
                  style={[styles.customerStepBtn, orderQty <= 0.5 && styles.customerStepDisabled]}
                >
                  <FishermanIcon name="minus" size={16} color={ui.navy} />
                </Pressable>
                <Text style={styles.customerStepNum}>{orderQty.toFixed(1)}</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Increase quantity"
                  onPress={() => handleQtyStep(0.5)}
                  disabled={orderQty >= listing.availableKg}
                  style={[
                    styles.customerStepBtn,
                    orderQty >= listing.availableKg && styles.customerStepDisabled,
                  ]}
                >
                  <FishermanIcon name="plus" size={16} color={ui.navy} />
                </Pressable>
              </View>
            </View>

            {/* ESTIMATED SUBTOTAL */}
            <View style={styles.customerSubtotalRow}>
              <Text style={styles.customerSubtotalLabel}>Estimated Customer Total</Text>
              <Text style={styles.customerSubtotalAmount}>
                {money(listing.price * orderQty)}
              </Text>
            </View>

            {/* SELLER SUMMARY IN PREVIEW */}
            <View style={styles.customerSellerCard}>
              <Image source={profile.avatar} style={styles.customerSellerAvatar} resizeMode="cover" />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text numberOfLines={1} style={styles.customerSellerName}>
                  {profile.name}
                </Text>
                <Text numberOfLines={1} style={styles.customerSellerSub}>
                  {profile.title} · {profile.village}
                </Text>
                <View style={styles.customerRatingRow}>
                  <Text style={styles.customerRatingStar}>★ {profile.rating}</Text>
                  <Text style={styles.customerOrdersCount}>
                    ({profile.completedOrders} orders fulfilled)
                  </Text>
                </View>
              </View>
            </View>

            {/* BUYER ACTION BUTTONS DEMO */}
            <View style={styles.customerActionButtonsRow}>
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  router.push({
                    pathname: '/customer/connect',
                    params: { sellerId: profile.id, listingId: listing.id },
                  } as never)
                }
                style={styles.customerAskBtn}
              >
                <FishermanIcon name="message" size={16} color={ui.tealDark} />
                <Text style={styles.customerAskBtnText}>Ask Seller</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  Alert.alert(
                    'Customer View Simulation',
                    `In customer app, this adds ${orderQty.toFixed(1)} kg of ${listing.name} to the buyer cart.\n\nTotal: ${money(listing.price * orderQty)}`,
                  )
                }
                style={[
                  styles.customerAddCartBtn,
                  isUnavailable && styles.customerAddCartDisabled,
                ]}
                disabled={isUnavailable}
              >
                <FishermanIcon name="bag" size={16} color="#FFFFFF" />
                <Text style={styles.customerAddCartBtnText}>
                  {isUnavailable ? 'Sold Out' : 'Add to Basket'}
                </Text>
              </Pressable>
            </View>

            {/* GUARANTEE BADGE */}
            <View style={styles.guaranteePill}>
              <FishermanIcon name="check" size={13} color={ui.tealDark} />
              <Text style={styles.guaranteePillText}>
                FishMate 100% Pier-Freshness Guarantee · Same-day landed catch
              </Text>
            </View>
          </View>
        </View>
      ) : null}

      {/* ========================================================= */}
      {/* VIEW MODE: SELLER MANAGEMENT (DEFAULT)                    */}
      {/* ========================================================= */}
      {viewMode === 'seller' ? (
        <>
          {/* 01. FISH PHOTO GALLERY */}
          <View style={styles.galleryContainer}>
            {/* HERO ACTIVE PHOTO */}
            <Pressable
              accessibilityRole="imagebutton"
              accessibilityLabel="Tap to enlarge catch photo"
              onPress={() => setZoomPhoto(currentHeroPhoto)}
              style={styles.heroPhotoWrapper}
            >
              <Image source={currentHeroPhoto} style={styles.heroPhotoImage} resizeMode="cover" />

              {/* TOP OVERLAYS */}
              <View style={styles.heroOverlayTop}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{listing.category.toUpperCase()}</Text>
                </View>
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingBadgeText}>★ {listing.rating.toFixed(1)} ({listing.reviewCount})</Text>
                </View>
              </View>

              {/* BOTTOM OVERLAYS */}
              <View style={styles.heroOverlayBottom}>
                <View style={styles.photoCountBadge}>
                  <FishermanIcon name="sparkles" size={12} color="#FFFFFF" />
                  <Text style={styles.photoCountText}>
                    Photo {activePhotoIndex + 1} of {gallery.length}
                  </Text>
                </View>
                <View style={styles.zoomBadge}>
                  <FishermanIcon name="search" size={12} color="#FFFFFF" />
                  <Text style={styles.zoomBadgeText}>Tap to zoom</Text>
                </View>
              </View>
            </Pressable>

            {/* THUMBNAIL SELECTOR ROW */}
            <View style={styles.thumbnailRow}>
              {gallery.map((img, idx) => {
                const isActive = idx === activePhotoIndex;
                return (
                  <Pressable
                    key={idx}
                    accessibilityRole="button"
                    accessibilityLabel={`Select photo ${idx + 1}`}
                    onPress={() => setActivePhotoIndex(idx)}
                    style={[
                      styles.thumbnailCard,
                      isActive && styles.thumbnailCardActive,
                    ]}
                  >
                    <Image source={img} style={styles.thumbnailImg} resizeMode="cover" />
                    {isActive ? (
                      <View style={styles.thumbnailActiveRing} />
                    ) : null}
                    <View style={styles.thumbnailTag}>
                      <Text style={styles.thumbnailTagText}>{idx + 1}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* 01. FISH NAME & TYPE CARD */}
          <View style={styles.card}>
            <View style={styles.fishNameHeaderRow}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text numberOfLines={2} style={styles.fishTitle}>
                  {listing.name}
                </Text>
                <Text numberOfLines={1} style={styles.fishSubCategory}>
                  {listing.category} · {listing.freshness}
                </Text>
              </View>
              <View style={styles.unitPill}>
                <Text style={styles.unitPillText}>{listing.unit || '/kg'}</Text>
              </View>
            </View>

            {/* TAGS ROW */}
            <View style={styles.tagsContainer}>
              {listing.tags.map((t, i) => (
                <View key={i} style={styles.specTag}>
                  <Text style={styles.specTagText}>#{t}</Text>
                </View>
              ))}
            </View>

            <View style={styles.cardDivider} />

            {/* 01. PRICE, QUANTITY, AVAILABILITY METRICS GRID */}
            <View style={styles.metricsGrid}>
              {/* PRICE PER KG */}
              <View style={styles.metricTile}>
                <Text style={styles.metricLabel}>PRICE PER KG</Text>
                <Text style={styles.metricMain}>{money(listing.price)}</Text>
                <Text style={styles.metricSub}>LKR per kilogram</Text>
              </View>

              {/* AVAILABLE QUANTITY */}
              <View style={styles.metricTile}>
                <Text style={styles.metricLabel}>AVAILABLE QUANTITY</Text>
                <Text
                  style={[
                    styles.metricMain,
                    listing.availableKg <= 0 && { color: ui.danger },
                  ]}
                >
                  {listing.availableKg} KG
                </Text>
                <Text style={styles.metricSub}>In harbor ice stall</Text>
              </View>
            </View>

            {/* TOTAL ESTIMATED BATCH WORTH */}
            <View style={styles.batchWorthBanner}>
              <View style={styles.batchWorthLeft}>
                <Text style={styles.batchWorthLabel}>TOTAL BATCH STOCK VALUE</Text>
                <Text style={styles.batchWorthValue}>{money(totalBatchWorth)}</Text>
              </View>
              <View
                style={[
                  styles.stockStatusBadge,
                  isUnavailable
                    ? styles.badgeUnavailable
                    : isLimited
                    ? styles.badgeLimited
                    : styles.badgeAvailable,
                ]}
              >
                <Text
                  style={[
                    styles.stockStatusBadgeText,
                    isUnavailable
                      ? styles.badgeTextRed
                      : isLimited
                      ? styles.badgeTextAmber
                      : styles.badgeTextGreen,
                  ]}
                >
                  {listing.stockLabel}
                </Text>
              </View>
            </View>
          </View>

          {/* 01. LISTING DATE & SELLING LOCATION CARD */}
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>Listing & Harbor Location</Text>

            {/* LISTING DATE */}
            <View style={styles.locationDetailItem}>
              <View style={styles.locationIconCircle}>
                <FishermanIcon name="clock" size={17} color={ui.tealDark} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.locationItemLabel}>Listing & Landing Date</Text>
                <Text style={styles.locationItemValue}>{displayListingDate}</Text>
                <Text style={styles.locationItemSub}>
                  Landed with morning boat arrival from deep-sea voyage
                </Text>
              </View>
            </View>

            <View style={styles.cardDivider} />

            {/* SELLING LOCATION */}
            <View style={styles.locationDetailItem}>
              <View style={styles.locationIconCircle}>
                <FishermanIcon name="pin" size={17} color={ui.tealDark} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.locationItemLabel}>Selling & Pickup Location</Text>
                <Text style={styles.locationItemValue}>{displaySellingLocation}</Text>
                <Text style={styles.locationItemSub}>
                  Mooring: {profile.harborMooring ?? 'Berth A-07 (Opposite Ice Factory)'}
                </Text>
              </View>
            </View>

            <View style={styles.pickupCallout}>
              <FishermanIcon name="check" size={13} color={ui.tealDark} />
              <Text style={styles.pickupCalloutText}>
                Direct harbor walk-in pickup permitted at pier gate. Cash & digital payments accepted.
              </Text>
            </View>
          </View>

          {/* 01. CATCH DESCRIPTION & PREPARATION */}
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>Catch Notes & Preparation Options</Text>
            <Text style={styles.descriptionParagraph}>
              {listing.description ||
                listing.shortDescription ||
                'Freshly landed catch from deep-sea voyage. Chilled immediately on food-grade crushed ice.'}
            </Text>

            <View style={styles.cardDivider} />

            <Text style={styles.subHeading}>Available Preparation Cuts</Text>
            <View style={styles.prepRow}>
              <View style={styles.prepBadge}>
                <Text style={styles.prepBadgeText}>✓ Whole Fish on Ice</Text>
              </View>
              <View style={styles.prepBadge}>
                <Text style={styles.prepBadgeText}>✓ Cleaned & Gutted</Text>
              </View>
              <View style={styles.prepBadge}>
                <Text style={styles.prepBadgeText}>✓ Steak Cut Packs</Text>
              </View>
            </View>
          </View>

          {/* 01. CUSTOMER-FACING PREVIEW CALLOUT CARD (SELLER VIEW) */}
          <View style={styles.previewCalloutCard}>
            <View style={styles.previewCalloutHeader}>
              <View style={styles.previewCalloutIconWrap}>
                <FishermanIcon name="sparkles" size={16} color={ui.tealDark} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.previewCalloutTitle}>Customer-Facing Preview Available</Text>
                <Text style={styles.previewCalloutSub}>
                  Inspect the live storefront layout seen by buyers on FishMate.
                </Text>
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => setViewMode('customer')}
              style={styles.openPreviewBtn}
            >
              <Text style={styles.openPreviewBtnText}>View Customer Storefront Preview ↗</Text>
            </Pressable>
          </View>

          {/* 02. BUTTONS & NAVIGATION / CLICK ACTIONS BAR */}
          <View style={styles.actionButtonsContainer}>
            {/* EDIT LISTING -> S08 */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Edit Listing (S08)"
              onPress={handleEdit}
              style={styles.primaryEditBtn}
            >
              <FishermanIcon name="sparkles" size={17} color="#FFFFFF" />
              <Text style={styles.primaryEditBtnText}>Edit Catch Listing (S08)</Text>
            </Pressable>

            {/* 02. MARK UNAVAILABLE / MARK AVAILABLE BUTTON */}
            {isUnavailable ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Mark listing as available"
                onPress={handleMarkAvailable}
                style={styles.markAvailableActionBtn}
              >
                <FishermanIcon name="check" size={16} color="#FFFFFF" />
                <Text style={styles.markAvailableActionText}>
                  ✓ Mark as Available (Re-open Orders)
                </Text>
              </Pressable>
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Mark listing as unavailable"
                onPress={handleMarkUnavailable}
                style={styles.markUnavailableActionBtn}
              >
                <Text style={{ color: '#DC2626', fontSize: 16, fontWeight: '900' }}>✕</Text>
                <Text style={styles.markUnavailableActionText}>
                  ✕ Mark Unavailable (Pause Orders)
                </Text>
              </Pressable>
            )}

            {/* 02. BACK -> S05 */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back to My Fish Listings"
              onPress={handleBackToS05}
              style={styles.backActionBtn}
            >
              <FishermanIcon name="arrow-left" size={16} color={ui.navy} />
              <Text style={styles.backActionBtnText}>Back to My Listings (S05)</Text>
            </Pressable>
          </View>
        </>
      ) : null}

      {/* FULL PHOTO ZOOM MODAL */}
      <Modal
        visible={zoomPhoto !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setZoomPhoto(null)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={styles.modalCloseArea}
            onPress={() => setZoomPhoto(null)}
          >
            <View style={styles.modalCloseBtn}>
              <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '900' }}>✕</Text>
            </View>
          </Pressable>
          {zoomPhoto ? (
            <View style={styles.modalImageCard}>
              <Image source={zoomPhoto} style={styles.modalImage} resizeMode="contain" />
              <Text style={styles.modalCaption}>{listing.name} · Harbor Fresh Catch</Text>
            </View>
          ) : null}
        </View>
      </Modal>
    </FishermanShell>
  );
}

const styles = StyleSheet.create({
  breadcrumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
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
  breadcrumbText: {
    fontSize: 11,
    color: ui.muted,
    flex: 1,
  },
  notFoundCard: {
    backgroundColor: ui.surface,
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ui.border,
    marginTop: 20,
  },
  notFoundIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EBF4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: ui.navy,
    marginBottom: 6,
  },
  notFoundSub: {
    fontSize: 13,
    color: ui.muted,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  notFoundBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: ui.tealDark,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  notFoundBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },

  // MODE TOGGLE BAR
  modeToggleBar: {
    flexDirection: 'row',
    backgroundColor: '#E8F3F5',
    padding: 4,
    borderRadius: 16,
    marginBottom: 14,
    gap: 6,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 10,
    borderRadius: 12,
  },
  modeTabActive: {
    backgroundColor: ui.tealDark,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: '800',
    color: ui.muted,
  },
  modeTabTextActive: {
    color: '#FFFFFF',
  },

  // 03. PROMINENT STATUS / AVAILABILITY CARD
  prominentStatusCard: {
    borderRadius: 20,
    padding: 14,
    borderWidth: 1.5,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  statusCardAvailable: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  statusCardLimited: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
  },
  statusCardUnavailable: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  statusCardLeft: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  prominentBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  badgePillAvailable: {
    backgroundColor: '#D1FAE5',
  },
  badgePillLimited: {
    backgroundColor: '#FEF3C7',
  },
  badgePillUnavailable: {
    backgroundColor: '#FEE2E2',
  },
  prominentGlowingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotAvailable: {
    backgroundColor: '#059669',
  },
  dotLimited: {
    backgroundColor: '#D97706',
  },
  dotUnavailable: {
    backgroundColor: '#DC2626',
  },
  prominentBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  badgeTextAvailable: {
    color: '#065F46',
  },
  badgeTextLimited: {
    color: '#92400E',
  },
  badgeTextUnavailable: {
    color: '#991B1B',
  },
  statusHelperText: {
    fontSize: 11,
    color: ui.navy,
    lineHeight: 15,
  },
  quickStatusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 11,
    borderRadius: 12,
    borderWidth: 1,
  },
  quickStatusBtnRed: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FCA5A5',
  },
  quickStatusBtnGreen: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  quickStatusBtnText: {
    fontSize: 11,
    fontWeight: '900',
  },
  quickStatusBtnTextRed: {
    color: '#DC2626',
  },
  quickStatusBtnTextGreen: {
    color: '#FFFFFF',
  },

  // 01. PHOTO GALLERY
  galleryContainer: {
    marginBottom: 14,
  },
  heroPhotoWrapper: {
    position: 'relative',
    height: 230,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#EBF4F6',
    borderWidth: 1,
    borderColor: ui.border,
  },
  heroPhotoImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlayTop: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: 'rgba(6, 63, 80, 0.82)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  ratingBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
  },
  ratingBadgeText: {
    color: '#996600',
    fontSize: 11,
    fontWeight: '900',
  },
  heroOverlayBottom: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  photoCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
  },
  photoCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  zoomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
  },
  zoomBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  thumbnailRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  thumbnailCard: {
    position: 'relative',
    flex: 1,
    height: 64,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: '#EBF4F6',
  },
  thumbnailCardActive: {
    borderColor: '#16D5D7',
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
  },
  thumbnailActiveRing: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    borderWidth: 2,
    borderColor: '#16D5D7',
    borderRadius: 12,
  },
  thumbnailTag: {
    position: 'absolute',
    bottom: 3,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  thumbnailTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },

  // CARDS
  card: {
    backgroundColor: ui.surface,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: ui.border,
    marginBottom: 14,
  },
  fishNameHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  fishTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: ui.navy,
    letterSpacing: -0.4,
  },
  fishSubCategory: {
    fontSize: 12,
    color: ui.muted,
    marginTop: 3,
    fontWeight: '600',
  },
  unitPill: {
    backgroundColor: ui.tealLight,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
  },
  unitPillText: {
    fontSize: 11,
    fontWeight: '900',
    color: ui.tealDark,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  specTag: {
    backgroundColor: '#F0F9FA',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4EEF2',
  },
  specTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: ui.tealDark,
  },
  cardDivider: {
    height: 1,
    backgroundColor: ui.border,
    marginVertical: 13,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  metricTile: {
    flex: 1,
    backgroundColor: '#F8FCFD',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E3F1F4',
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: ui.tealDark,
    letterSpacing: 1.1,
  },
  metricMain: {
    fontSize: 20,
    fontWeight: '900',
    color: ui.navy,
    marginTop: 4,
  },
  metricSub: {
    fontSize: 10,
    color: ui.muted,
    marginTop: 2,
  },
  batchWorthBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EBF7F9',
    borderRadius: 16,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#C7E8EE',
  },
  batchWorthLeft: {
    gap: 2,
  },
  batchWorthLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: ui.tealDark,
    letterSpacing: 1,
  },
  batchWorthValue: {
    fontSize: 17,
    fontWeight: '900',
    color: ui.navy,
  },
  stockStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  badgeAvailable: {
    backgroundColor: '#D1FAE5',
  },
  badgeLimited: {
    backgroundColor: '#FEF3C7',
  },
  badgeUnavailable: {
    backgroundColor: '#FEE2E2',
  },
  stockStatusBadgeText: {
    fontSize: 11,
    fontWeight: '900',
  },
  badgeTextGreen: {
    color: '#065F46',
  },
  badgeTextAmber: {
    color: '#92400E',
  },
  badgeTextRed: {
    color: '#991B1B',
  },

  // LOCATION CARD
  cardSectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: ui.navy,
    marginBottom: 12,
  },
  locationDetailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  locationIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: ui.tealLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  locationItemLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: ui.tealDark,
    letterSpacing: 1.1,
  },
  locationItemValue: {
    fontSize: 13,
    fontWeight: '800',
    color: ui.navy,
    marginTop: 2,
  },
  locationItemSub: {
    fontSize: 11,
    color: ui.muted,
    marginTop: 2,
    lineHeight: 16,
  },
  pickupCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0F9FA',
    padding: 10,
    borderRadius: 12,
    marginTop: 12,
  },
  pickupCalloutText: {
    fontSize: 11,
    color: ui.tealDark,
    fontWeight: '700',
    flex: 1,
    lineHeight: 16,
  },

  // DESCRIPTION & PREP
  descriptionParagraph: {
    fontSize: 13,
    lineHeight: 20,
    color: ui.navy,
  },
  subHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.tealDark,
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  prepRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  prepBadge: {
    backgroundColor: '#EBF4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  prepBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: ui.navy,
  },

  // PREVIEW CALLOUT CARD
  previewCalloutCard: {
    backgroundColor: '#EAF7F8',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#CCEBEF',
    marginBottom: 14,
    gap: 10,
  },
  previewCalloutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  previewCalloutIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#D3F1F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewCalloutTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: ui.navy,
  },
  previewCalloutSub: {
    fontSize: 11,
    color: ui.muted,
    marginTop: 1,
  },
  openPreviewBtn: {
    backgroundColor: ui.surface,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ui.tealDark,
    alignItems: 'center',
  },
  openPreviewBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: ui.tealDark,
  },

  // 02. BUTTONS & NAVIGATION / ACTION BUTTONS
  actionButtonsContainer: {
    gap: 10,
    marginTop: 4,
    marginBottom: 20,
  },
  primaryEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: ui.tealDark,
    paddingVertical: 15,
    borderRadius: 18,
    shadowColor: ui.tealDark,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryEditBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 15,
  },
  markUnavailableActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF1F2',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FDA4AF',
  },
  markUnavailableActionText: {
    color: '#DC2626',
    fontWeight: '900',
    fontSize: 14,
  },
  markAvailableActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 16,
  },
  markAvailableActionText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
  backActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: ui.surface,
    paddingVertical: 13,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ui.border,
  },
  backActionBtnText: {
    color: ui.navy,
    fontWeight: '800',
    fontSize: 13,
  },

  // =======================================================
  // CUSTOMER PREVIEW STYLES
  // =======================================================
  customerPreviewContainer: {
    marginBottom: 20,
  },
  previewNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#E7FAF4',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#C4F1E5',
    marginBottom: 12,
  },
  previewNoticeIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#C5F3E7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewNoticeTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: ui.tealDark,
  },
  previewNoticeSub: {
    fontSize: 10,
    color: ui.muted,
    marginTop: 2,
  },
  customerCardShell: {
    backgroundColor: ui.surface,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: ui.border,
  },
  customerPhotoWrap: {
    width: '100%',
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#EBF4F6',
    position: 'relative',
  },
  customerPhoto: {
    width: '100%',
    height: '100%',
  },
  customerPhotoBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: '#E7FAF4',
  },
  customerPhotoBadgeText: {
    color: ui.tealDark,
    fontSize: 11,
    fontWeight: '800',
  },
  customerFavBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  customerHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 10,
  },
  customerCategoryText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: ui.tealDark,
  },
  customerHeadlineText: {
    fontSize: 22,
    color: ui.navy,
    fontWeight: '900',
    marginTop: 4,
    letterSpacing: -0.5,
  },
  customerRatingBadge: {
    backgroundColor: '#FFF5DE',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  customerRatingText: {
    color: '#996600',
    fontWeight: '900',
    fontSize: 12,
  },
  customerDescText: {
    fontSize: 12,
    lineHeight: 18,
    color: ui.muted,
    marginTop: 8,
  },
  customerTagsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginTop: 10,
  },
  customerTag: {
    backgroundColor: '#F0F9FA',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  customerTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: ui.tealDark,
  },
  customerPricePanel: {
    backgroundColor: '#E5F7F3',
    padding: 14,
    borderRadius: 18,
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 9,
  },
  customerPriceLabel: {
    fontSize: 9,
    color: ui.tealDark,
    letterSpacing: 1.2,
    fontWeight: '900',
  },
  customerPriceAmount: {
    fontSize: 22,
    color: ui.navy,
    fontWeight: '900',
    marginTop: 4,
  },
  customerPricePer: {
    fontSize: 12,
    color: ui.muted,
  },
  customerStockBadge: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  customerStockText: {
    fontSize: 11,
    color: ui.tealDark,
    fontWeight: '800',
    textAlign: 'center',
  },
  customerStatsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  customerStatCard: {
    flex: 1,
    backgroundColor: '#F8FCFD',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E3F1F4',
  },
  customerStatLabel: {
    fontSize: 9,
    color: ui.muted,
    fontWeight: '700',
  },
  customerStatValue: {
    fontSize: 12,
    fontWeight: '800',
    color: ui.navy,
    marginTop: 2,
  },
  customerQuantityCard: {
    backgroundColor: '#F8FCFD',
    padding: 12,
    borderRadius: 16,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E3F1F4',
  },
  customerQtyLabel: {
    fontSize: 9,
    color: ui.tealDark,
    fontWeight: '900',
    letterSpacing: 1,
  },
  customerQtyValue: {
    fontSize: 17,
    fontWeight: '900',
    color: ui.navy,
    marginTop: 2,
  },
  customerStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: ui.border,
    gap: 8,
  },
  customerStepBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EBF4F6',
  },
  customerStepDisabled: {
    opacity: 0.35,
  },
  customerStepNum: {
    fontSize: 14,
    fontWeight: '900',
    color: ui.navy,
    minWidth: 32,
    textAlign: 'center',
  },
  customerSubtotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: ui.border,
  },
  customerSubtotalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: ui.muted,
  },
  customerSubtotalAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: ui.tealDark,
  },
  customerSellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FCFD',
    padding: 12,
    borderRadius: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E3F1F4',
  },
  customerSellerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  customerSellerName: {
    fontSize: 13,
    fontWeight: '900',
    color: ui.navy,
  },
  customerSellerSub: {
    fontSize: 10,
    color: ui.muted,
    marginTop: 1,
  },
  customerRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  customerRatingStar: {
    fontSize: 10,
    fontWeight: '900',
    color: '#996600',
  },
  customerOrdersCount: {
    fontSize: 10,
    color: ui.muted,
  },
  customerActionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  customerAskBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: ui.tealDark,
    paddingVertical: 12,
    borderRadius: 14,
  },
  customerAskBtnText: {
    color: ui.tealDark,
    fontWeight: '800',
    fontSize: 13,
  },
  customerAddCartBtn: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: ui.tealDark,
    paddingVertical: 12,
    borderRadius: 14,
  },
  customerAddCartDisabled: {
    backgroundColor: ui.mutedLight,
  },
  customerAddCartBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  guaranteePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0F9FA',
    padding: 10,
    borderRadius: 12,
    marginTop: 12,
  },
  guaranteePillText: {
    fontSize: 10,
    color: ui.tealDark,
    fontWeight: '700',
    flex: 1,
  },

  // MODAL ZOOM
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 28, 36, 0.94)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCloseArea: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  modalCloseBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalImageCard: {
    width: '100%',
    maxHeight: '75%',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: 340,
    borderRadius: 20,
  },
  modalCaption: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 16,
    textAlign: 'center',
  },
});

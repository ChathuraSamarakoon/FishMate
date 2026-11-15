import { useState } from 'react';
import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { CustomerIcon } from '@/components/customer/Icon';
import { featuredListings, fishermen, nearbyListings } from '@/data/mockData';
import { FishCard, SellerCard } from '@/components/customer/atoms';
import { getSession } from '@/services/demoAuth';
import { useMarketplace } from '@/components/customer/MarketplaceContext';

const logo = require('../../../assets/fishmate/fishmate-icon.png');
const hero = require('../../../assets/customer/seafood-hero.png');
const categoryArtwork = require('../../../assets/customer/seafood-categories.png');
const categoryTiles = [
  { label: 'All', color: '#D2F3FF', category: 'all', query: '' },
  { label: 'Prawns', color: '#FFF0E7', category: 'all', query: 'prawns' },
  { label: 'Shellfish', color: '#EBE8FF', category: 'shellfish', query: '' },
  { label: 'Octopus', color: '#D5FAEF', category: 'all', query: 'octopus' },
  { label: 'Others', color: '#FFF6D8', category: 'all', query: 'mussels' },
];

export default function CustomerHome() {
  const session = getSession();
  const firstName = session?.role === 'customer' ? session.fullName.split(' ')[0] : 'Demo';
  const { cart } = useMarketplace();
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, 680) - 36;
  const categoryIconSize = Math.min(64, (contentWidth - 28) / 5 - 8);
  const [saved, setSaved] = useState<string[]>([]);
  const openSearch = () => router.push('/customer/search');

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View pointerEvents="none" style={styles.topGlow} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.page}>
        <View style={styles.header}>
          <Image
            source={logo}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="FishMate"
          />
          <View style={styles.greeting}>
            <Text style={styles.brand}>FISHMATE / CUSTOMER</Text>
            <Text accessibilityRole="header" style={styles.hello}>
              Hello, {firstName}!
            </Text>
            <View style={styles.greetingUnderline} />
            <Text style={styles.subtitle}>Your daily verified seafood marketplace</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open cart"
            onPress={() => router.push('/customer/cart')}
            style={styles.bag}
          >
            <CustomerIcon name="bag" size={25} color="#0B1531" />
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Explore local sellers by location"
          onPress={openSearch}
          style={styles.location}
        >
          <CustomerIcon name="pin" size={21} color="#007D82" />
          <Text style={styles.locationHint}>Explore local sellers</Text>
          <Text style={styles.chevron}>⌄</Text>
          <View style={styles.locationDivider} />
          <Text numberOfLines={1} style={styles.locationValue}>
            Negombo · Weligama
          </Text>
          <CustomerIcon name="chevron-right" size={18} color="#0B1531" />
        </Pressable>

        <View style={styles.shortcuts}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/customer/cart')}
            style={styles.shortcut}
          >
            <CustomerIcon name="bag" size={23} color="#009D96" />
            <Text style={styles.shortcutText}>Cart ({cart.length})</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/customer/orders')}
            style={[styles.shortcut, styles.orders]}
          >
            <CustomerIcon name="check" size={24} color="#00666C" />
            <Text style={styles.shortcutText}>My Orders</Text>
          </Pressable>
        </View>

        <ImageBackground
          source={hero}
          resizeMode="cover"
          style={styles.hero}
          imageStyle={styles.heroImage}
        >
          <View style={styles.heroShade} />
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>FRESHNESS, DIRECT FROM THE SEA</Text>
            <View style={styles.yellowLine} />
            <Text style={styles.headline}>
              Catch of the day,{'\n'}
              <Text style={styles.lime}>straight to you.</Text>
            </Text>
            <Text style={styles.heroDescription}>
              Discover quality seafood from local fishermen, without the middleman.
            </Text>
            <Pressable accessibilityRole="button" onPress={openSearch} style={styles.heroButton}>
              <Text style={styles.heroButtonText}>Explore collection</Text>
              <CustomerIcon name="chevron-right" size={18} color="#09243A" />
            </Pressable>
          </View>
        </ImageBackground>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Search seafood and filters"
          onPress={openSearch}
          style={styles.search}
        >
          <CustomerIcon name="search" size={26} color="#007D82" />
          <View style={styles.searchCopy}>
            <Text style={styles.searchTitle}>What fresh fish are you looking for?</Text>
            <Text style={styles.searchHint}>e.g., prawns, rohu, crabs or seer fish</Text>
          </View>
          <View style={styles.filter}>
            <CustomerIcon name="filter" size={23} color="#007D82" />
          </View>
        </Pressable>

        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            Browse categories
          </Text>
          <Text style={styles.sectionSubtitle}>Choose your kind of seafood</Text>
        </View>
        <View style={styles.categories}>
          {categoryTiles.map((item, index) => (
            <Pressable
              key={item.label}
              accessibilityRole="button"
              accessibilityLabel={`Browse ${item.label}`}
              onPress={() =>
                router.push({
                  pathname: '/customer/search',
                  params: { category: item.category, q: item.query },
                })
              }
              style={[styles.category, { backgroundColor: item.color }]}
            >
              <View
                style={{ width: categoryIconSize, height: categoryIconSize, overflow: 'hidden' }}
              >
                <Image
                  source={categoryArtwork}
                  accessibilityIgnoresInvertColors
                  resizeMode="stretch"
                  style={{
                    position: 'absolute',
                    left: -index * categoryIconSize,
                    top: -categoryIconSize / 3,
                    width: categoryIconSize * 5,
                    height: (categoryIconSize * 5) / 3,
                  }}
                />
              </View>
              <Text numberOfLines={1} style={styles.categoryLabel}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.picksHeading}>
          <View style={styles.picksCopy}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>
              <Text style={styles.leaf}>✦ </Text>Today’s fresh picks
            </Text>
            <Text style={styles.sectionSubtitle}>Handpicked listings for you, freshly sourced</Text>
          </View>
          <Pressable onPress={openSearch} accessibilityRole="button" style={styles.seeAll}>
            <Text style={styles.seeAllText}>See all</Text>
            <CustomerIcon name="chevron-right" size={16} color="#007D82" />
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.fishRail}
        >
          {featuredListings.map((item) => (
            <View key={item.id} style={[styles.fishCard, { width: contentWidth * 0.69 }]}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`View ${item.name}`}
                onPress={() => router.push(`/customer/listing/${item.id}` as never)}
              >
                <Image source={item.image} style={styles.fishImage} resizeMode="cover" />
                <View style={styles.freshBadge}>
                  <Text style={styles.freshText}>🌿 Fresh Catch</Text>
                </View>
                <View style={styles.fishCaption}>
                  <View style={styles.listingTitleRow}>
                    <Text style={styles.fishName}>{item.name}</Text>
                    <Text style={styles.listingRating}>? {item.rating.toFixed(1)}</Text>
                  </View>
                  <Text numberOfLines={2} style={styles.listingDescription}>
                    {item.shortDescription}
                  </Text>
                  <View style={styles.listingLocation}>
                    <CustomerIcon name="pin" size={13} color="#667D85" />
                    <Text style={styles.listingMeta}>{item.location} ? {item.stockLabel}</Text>
                  </View>
                  <Text style={styles.fishPrice}>Rs. {item.price.toLocaleString()}/kg</Text>
                </View>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${saved.includes(item.id) ? 'Unsave' : 'Save'} ${item.name}`}
                accessibilityState={{ selected: saved.includes(item.id) }}
                onPress={() =>
                  setSaved((previous) =>
                    previous.includes(item.id)
                      ? previous.filter((id) => id !== item.id)
                      : [...previous, item.id],
                  )
                }
                style={styles.favorite}
              >
                <CustomerIcon
                  name="heart"
                  size={22}
                  color={saved.includes(item.id) ? '#E05D76' : '#0B1531'}
                />
              </Pressable>
            </View>
          ))}
        </ScrollView>
        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            Meet your fishermen
          </Text>
          <Text style={styles.sectionSubtitle}>The people behind your fresh catches</Text>
        </View>
        {fishermen.map((seller) => (
          <SellerCard
            key={seller.id}
            seller={seller}
            onPress={() =>
              router.push({ pathname: '/customer/fisherman/[id]', params: { id: seller.id } })
            }
          />
        ))}
        <View style={styles.picksHeading}>
          <View style={styles.picksCopy}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>More fresh finds</Text>
            <Text style={styles.sectionSubtitle}>Discover more catches from nearby sellers</Text>
          </View>
          <Pressable onPress={openSearch} accessibilityRole="button" style={styles.seeAll}>
            <Text style={styles.seeAllText}>Search</Text>
            <CustomerIcon name="chevron-right" size={16} color="#007D82" />
          </Pressable>
        </View>
        {nearbyListings.map((item) => (
          <FishCard
            key={item.id}
            item={item}
            variant="row"
            onPress={() =>
              router.push({ pathname: '/customer/listing/[id]', params: { id: item.id } })
            }
          />
        ))}
        <View style={styles.demoDisclaimer}>
          <CustomerIcon name="sparkles" size={18} color="#007D82" />
          <Text style={styles.demoNote}>
            FishMate UI preview ? Prices, sellers, ratings and delivery times are demo data, not real offers.
          </Text>
        </View>
      </ScrollView>
      <View pointerEvents="none" style={styles.footerWaves}>
        <View style={styles.waveBack} />
        <View style={styles.waveFront} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  footerWaves: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 106,
    overflow: 'hidden',
  },
  waveBack: {
    position: 'absolute',
    width: '130%',
    height: 130,
    left: '-20%',
    top: 36,
    borderRadius: 180,
    backgroundColor: '#83DDE9',
    transform: [{ rotate: '7deg' }],
    opacity: 0.6,
  },
  waveFront: {
    position: 'absolute',
    width: '120%',
    height: 100,
    left: '12%',
    top: 48,
    borderRadius: 170,
    backgroundColor: '#33BCCF',
    transform: [{ rotate: '-6deg' }],
    opacity: 0.35,
  },
  safe: { flex: 1, backgroundColor: '#EFFCFD' },
  topGlow: {
    position: 'absolute',
    top: -100,
    right: -140,
    width: 360,
    height: 300,
    borderRadius: 180,
    backgroundColor: '#D5F6FB',
  },
  page: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 120,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 48, height: 48 },
  greeting: { flex: 1, minWidth: 0 },
  brand: { color: '#005D63', fontSize: 10, letterSpacing: 1.8, fontWeight: '800' },
  hello: { color: '#080F2C', fontSize: 29, fontWeight: '900', letterSpacing: -0.9, marginTop: 5 },
  greetingUnderline: {
    width: 66,
    height: 2,
    backgroundColor: '#07BEC5',
    marginLeft: 65,
    borderRadius: 3,
    transform: [{ rotate: '-2deg' }],
  },
  subtitle: { color: '#273048', fontSize: 11, lineHeight: 17, marginTop: 4 },
  bag: {
    width: 46,
    height: 49,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#39AEC1',
    shadowRadius: 12,
    shadowOpacity: 0.19,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 20,
    marginBottom: 17,
    minHeight: 32,
  },
  locationHint: { color: '#495366', fontSize: 10, flexShrink: 1 },
  chevron: { fontSize: 17, color: '#0B1531' },
  locationDivider: { height: 15, width: 1, backgroundColor: '#C2DEE1', marginHorizontal: 4 },
  locationValue: { flex: 1, textAlign: 'right', color: '#0B1531', fontSize: 10, fontWeight: '800' },
  shortcuts: { flexDirection: 'row', gap: 12, marginBottom: 17 },
  shortcut: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 51,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 19,
    shadowColor: '#1EAAB8',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  orders: { backgroundColor: '#DFF9F8' },
  shortcutText: { fontWeight: '800', color: '#0B1531', fontSize: 15 },
  hero: {
    minHeight: 224,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#006277',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
  },
  heroImage: { borderRadius: 27 },
  heroShade: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '62%',
    backgroundColor: 'rgba(0,59,72,0.28)',
  },
  heroCopy: { padding: 19, paddingVertical: 23 },
  eyebrow: { color: '#E9FFFF', fontSize: 9, letterSpacing: 1.7, fontWeight: '700' },
  yellowLine: {
    width: 62,
    height: 2,
    backgroundColor: '#E0FB55',
    marginTop: 6,
    marginBottom: 12,
    transform: [{ rotate: '-2deg' }],
  },
  headline: {
    color: '#FFFFFF',
    fontSize: 27,
    lineHeight: 30,
    letterSpacing: -0.7,
    fontWeight: '900',
    maxWidth: '85%',
  },
  lime: { color: '#E5FB70' },
  heroDescription: {
    color: '#E9FFFF',
    fontSize: 11,
    lineHeight: 16,
    maxWidth: '64%',
    marginTop: 9,
  },
  heroButton: {
    flexDirection: 'row',
    gap: 9,
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#E0F97A',
    borderWidth: 1,
    borderColor: '#F3FFC2',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 22,
    marginTop: 13,
  },
  heroButtonText: { color: '#09243A', fontSize: 12, fontWeight: '900' },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#AAE4EC',
    borderRadius: 23,
    marginTop: 17,
    shadowColor: '#1EAAB8',
    shadowOpacity: 0.13,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  searchCopy: { flex: 1 },
  searchTitle: { fontSize: 12, lineHeight: 17, fontWeight: '900', color: '#0B1531' },
  searchHint: { fontSize: 10, color: '#66717B', marginTop: 3 },
  filter: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#CCF6F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { marginTop: 23, marginBottom: 14 },
  sectionTitle: { fontSize: 22, letterSpacing: -0.7, fontWeight: '900', color: '#0B1531' },
  sectionSubtitle: { color: '#525A6B', fontSize: 12, marginTop: 4, lineHeight: 18 },
  categories: { flexDirection: 'row', gap: 7 },
  category: {
    flex: 1,
    minWidth: 0,
    height: 79,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    shadowColor: '#29A5B9',
    shadowOpacity: 0.18,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  categoryLabel: { fontSize: 10, fontWeight: '800', color: '#0B1531' },
  picksHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 14,
  },
  picksCopy: { flex: 1 },
  leaf: { color: '#04AA9C' },
  seeAll: { flexDirection: 'row', alignItems: 'center', minHeight: 44, gap: 3 },
  seeAllText: { fontSize: 12, color: '#007D82', fontWeight: '800' },
  fishRail: { gap: 11, paddingBottom: 10 },
  fishCard: {
    borderRadius: 21,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  fishImage: { width: '100%', height: 155 },
  freshBadge: {
    position: 'absolute',
    left: 10,
    top: 10,
    paddingVertical: 6,
    paddingHorizontal: 9,
    borderRadius: 20,
    backgroundColor: '#D9FFE9',
  },
  freshText: { fontSize: 11, fontWeight: '800', color: '#082F38' },
  favorite: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fishCaption: { padding: 12, gap: 4 },
  fishName: { flex: 1, fontSize: 14, fontWeight: '800', color: '#0B1531' },
  fishPrice: { color: '#007D82', fontSize: 12, fontWeight: '700' },
  listingTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  listingRating: { fontSize: 11, fontWeight: '800', color: '#A16E0B' },
  listingDescription: { fontSize: 11, lineHeight: 16, color: '#667D85' },
  listingLocation: { flexDirection: 'row', alignItems: 'center', gap: 4, marginVertical: 4 },
  listingMeta: { flex: 1, fontSize: 10, color: '#667D85' },
  demoDisclaimer: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, padding: 14, borderRadius: 17, backgroundColor: '#DFF5F3', marginTop: 17 },
  demoNote: { flex: 1, color: '#667D85', fontSize: 11, lineHeight: 17 },
});

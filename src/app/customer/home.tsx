import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { CustomerShell } from '@/components/customer/CustomerShell';
import { CategoryChip, FishCard, SectionHeader, SellerCard } from '@/components/customer/atoms';
import { CustomerIcon } from '@/components/customer/Icon';
import { customerUi as c } from '@/components/customer/theme';
import { categories, featuredListings, fishermen, nearbyListings } from '@/data/mockData';
import { getSession } from '@/services/demoAuth';
import { useMarketplace } from '@/components/customer/MarketplaceContext';

const logo = require('../../../assets/fishmate/fishmate-icon.png');

export default function CustomerHome() {
  const session = getSession();
  const firstName = session?.role === 'customer' ? session.fullName.split(' ')[0] : 'friend';
  const { cart } = useMarketplace();
  return <CustomerShell
    title={`Hello, ${firstName}!`}
    subtitle="Your daily seafood marketplace"
    rightIcon="bag"
    rightLabel="Demo cart"
    onRightPress={() => Alert.alert('Demo cart', `${cart.length} different item(s) in your demo cart. Full cart page C10 is planned next.`)}
  >
    <Pressable style={styles.locationBar} accessibilityRole="button" onPress={() => router.push('/customer/search')}>
      <CustomerIcon name="pin" color={c.tealDark} size={15}/>
      <Text style={styles.locationText}>Explore local sellers</Text>
      <Text style={styles.locationValue}>Negombo · Weligama</Text>
      <CustomerIcon name="chevron-right" color={c.muted} size={14}/>
    </Pressable>

    <View style={styles.hero}>
      <View style={styles.heroOrb1}/><View style={styles.heroOrb2}/>
      <View style={styles.heroCopy}>
        <Text style={styles.heroEyebrow}>FRESHNESS, DIRECT FROM THE SEA</Text>
        <Text style={styles.heroHeadline}>Catch of the day, straight to you.</Text>
        <Text style={styles.heroSmall}>Discover quality seafood from local fishermen, without the middlemen.</Text>
        <Pressable accessibilityRole="button" onPress={() => router.push('/customer/search')} style={styles.heroButton}>
          <Text style={styles.heroButtonLabel}>Explore catches</Text><CustomerIcon name="chevron-right" size={16} color={c.navy}/>
        </Pressable>
      </View>
      <View style={styles.brandGlow}><Image source={logo} style={styles.heroIcon} resizeMode="contain"/></View>
    </View>

    <Pressable accessibilityRole="search" onPress={() => router.push('/customer/search')} style={styles.searchPrompt}>
      <CustomerIcon name="search" size={20} color={c.tealDark}/>
      <View style={{flex:1}}><Text style={styles.searchText}>What fresh fish are you looking for?</Text><Text style={styles.searchHint}>Fish, prawns, crab, seller or location</Text></View>
      <View style={styles.searchFilter}><CustomerIcon name="filter" size={18} color={c.tealDark}/></View>
    </Pressable>

    <SectionHeader title="Browse categories" subtitle="Choose your kind of catch" />
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
      {categories.map(category => <CategoryChip key={category.id} icon={category.icon} label={category.label} onPress={() => router.push({pathname:'/customer/search',params:{category:category.id}})}/>)}
    </ScrollView>

    <SectionHeader title="Today's fresh picks" subtitle="Illustrative listings for UI testing" actionText="See all" onAction={() => router.push('/customer/search')}/>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
      {featuredListings.map(item => <FishCard key={item.id} item={item} onPress={() => router.push(`/customer/listing/${item.id}` as never)}/>)}
    </ScrollView>

    <SectionHeader title="Meet your fishermen" subtitle="People behind the fresh catches" />
    {fishermen.map(seller => <SellerCard key={seller.id} seller={seller} onPress={() => router.push(`/customer/fisherman/${seller.id}` as never)}/>)}

    <SectionHeader title="More fresh finds" actionText="Search" onAction={() => router.push('/customer/search')}/>
    {nearbyListings.map(item => <FishCard key={item.id} item={item} variant="row" onPress={() => router.push(`/customer/listing/${item.id}` as never)}/>)}

    <View style={styles.disclaimer}><CustomerIcon name="sparkles" size={18} color={c.tealDark}/><Text style={styles.disclaimerText}>FishMate UI preview · Prices, sellers, ratings and delivery times are demo data, not real offers.</Text></View>
  </CustomerShell>;
}

const styles=StyleSheet.create({
  locationBar: {flexDirection:'row',alignItems:'center',gap:6,marginBottom:14},
  locationText: {fontSize:11,color:c.muted,fontWeight:'700'},
  locationValue: {fontSize:11,color:c.navy,fontWeight:'900',marginLeft:'auto'},
  hero:{minHeight:195,borderRadius:27,backgroundColor:'#0A7582',overflow:'hidden',padding:22,flexDirection:'row',alignItems:'center'},
  heroOrb1:{position:'absolute',width:210,height:210,borderRadius:105,backgroundColor:'#229FA8',right:-83,top:-79},
  heroOrb2:{position:'absolute',width:145,height:145,borderRadius:75,backgroundColor:'#42B8B9',right:-64,bottom:-89},
  heroCopy:{flex:1,zIndex:1,paddingRight:2},
  heroEyebrow:{fontSize:9,letterSpacing:1.5,fontWeight:'900',color:'#C9FFF7'},
  heroHeadline:{fontSize:24,lineHeight:29,letterSpacing:-.7,color:'#FFFFFF',fontWeight:'900',marginTop:9},
  heroSmall:{fontSize:11,color:'#E2FAF7',lineHeight:17,marginTop:8,maxWidth:240},
  heroButton:{flexDirection:'row',alignItems:'center',gap:4,backgroundColor:'#E5FAF5',paddingHorizontal:14,paddingVertical:10,alignSelf:'flex-start',borderRadius:13,marginTop:14},
  heroButtonLabel:{fontWeight:'900',color:c.navy,fontSize:11},
  brandGlow:{width:76,height:76,borderRadius:26,backgroundColor:'rgba(255,255,255,.93)',alignItems:'center',justifyContent:'center',marginRight:-9},
  heroIcon:{width:69,height:69},
  searchPrompt:{backgroundColor:c.surface,borderRadius:20,padding:14,borderWidth:1,borderColor:c.border,marginTop:17,flexDirection:'row',alignItems:'center',gap:12},
  searchText:{fontSize:12,fontWeight:'800',color:c.navy},searchHint:{fontSize:10,color:c.muted,marginTop:3},
  searchFilter:{width:38,height:38,borderRadius:13,backgroundColor:c.soft,alignItems:'center',justifyContent:'center'},
  horizontalScroll:{paddingRight:20,paddingBottom:4},
  disclaimer:{flexDirection:'row',gap:9,backgroundColor:c.soft,borderRadius:17,padding:14,marginTop:17,alignItems:'flex-start'},
  disclaimerText:{flex:1,fontSize:11,color:c.muted,lineHeight:17},
});

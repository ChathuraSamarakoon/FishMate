import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { CustomerShell } from '@/components/customer/CustomerShell';
import { CustomerIcon } from '@/components/customer/Icon';
import { FishCard, SectionHeader, StatCard } from '@/components/customer/atoms';
import { customerUi as c } from '@/components/customer/theme';
import { getFishermanById, getListingsBySellerId } from '@/data/mockData';

export default function FishermanPublicProfile() {
  const { id } = useLocalSearchParams<{id?: string}>();
  const seller=getFishermanById(id);
  if(!seller) return <CustomerShell back title="Seller not found" hideNavPadding><Text style={styles.desc}>This demo seller could not be found.</Text><Pressable onPress={()=>router.replace('/customer/home')}><Text style={styles.link}>Back to marketplace</Text></Pressable></CustomerShell>;
  const listings=getListingsBySellerId(seller.id);
  return <CustomerShell back title="Fisherman profile" subtitle="Meet your local seafood seller" hideNavPadding>
    <View style={styles.profileCard}>
      <Image source={seller.avatar} style={styles.portrait} resizeMode="cover" />
      <Text style={styles.demoTag}>FISHMATE DEMO SELLER</Text>
      <Text style={styles.name}>{seller.name}</Text>
      <Text style={styles.role}>{seller.title}</Text>
      <View style={styles.locationRow}><CustomerIcon name="pin" color={c.tealDark} size={15}/><Text style={styles.location}>{seller.village}</Text></View>
      <Text style={styles.bio}>{seller.bio}</Text>
      <Pressable onPress={() => router.push({ pathname: '/customer/connect', params: { sellerId: seller.id } })} accessibilityRole="button" style={styles.contact}><CustomerIcon name="message" color="#FFFFFF" size={19}/><Text style={styles.contactLabel}>Connect with fisherman</Text></Pressable>
    </View>

    <View style={styles.stats}><StatCard label="Sample rating" value={`★ ${seller.rating.toFixed(1)}`}/><StatCard label="Sample orders" value={`${seller.completedOrders}+`} icon="bag"/></View>
    <View style={styles.stats}><StatCard label="Delivery area" value={seller.deliveryRadius} icon="pin"/><StatCard label="Response time" value={seller.responseTime} icon="clock"/></View>

    <SectionHeader title="Selling location" subtitle="Sample shop photo and village details"/>
    {seller.shopImages.map((photo,index)=><Image key={`${seller.id}-${index}`} source={photo} style={styles.shopPhoto} resizeMode="cover"/>)}
    <View style={styles.addressCard}><CustomerIcon name="pin" color={c.tealDark} size={20}/><View style={{flex:1}}><Text style={styles.addressTitle}>{seller.village}</Text><Text style={styles.addressDesc}>Delivery available within {seller.deliveryRadius}. Final arrangements are made directly with the seller.</Text></View></View>
    <View style={styles.addressCard}><CustomerIcon name="phone" color={c.tealDark} size={20}/><View style={{flex:1}}><Text style={styles.addressTitle}>Contact number</Text><Text style={styles.addressDesc}>{seller.contactNumber} · A real number will be shown when connected to the backend.</Text></View></View>

    <SectionHeader title="Specialties" subtitle="Fish types and services offered"/>
    <View style={styles.specialties}>{seller.specialties.map(item=><View style={styles.chip} key={item}><Text style={styles.chipText}>✓  {item}</Text></View>)}</View>

    <SectionHeader title="Available from this seller" subtitle={`${listings.length} sample listing(s)`}/>
    {listings.map(item=><FishCard key={item.id} item={item} variant="row" onPress={()=>router.push(`/customer/listing/${item.id}` as never)}/>)}
    <Text style={styles.disclaimer}>This is an interactive frontend prototype. Seller identities and photos are generated demo data.</Text>
  </CustomerShell>;
}
const styles=StyleSheet.create({
  profileCard:{borderRadius:28,backgroundColor:c.surface,borderWidth:1,borderColor:c.border,padding:19,alignItems:'center'},
  portrait:{width:115,height:115,borderRadius:35},demoTag:{fontSize:9,color:c.tealDark,fontWeight:'900',letterSpacing:1.6,marginTop:13},name:{fontSize:25,color:c.navy,fontWeight:'900',marginTop:6},role:{color:c.tealDark,fontSize:12,fontWeight:'800',marginTop:4},locationRow:{flexDirection:'row',alignItems:'center',gap:5,marginTop:10},location:{color:c.muted,fontSize:12,fontWeight:'700'},bio:{fontSize:13,lineHeight:20,color:c.muted,textAlign:'center',marginTop:13},
  contact:{backgroundColor:c.teal,width:'100%',height:51,borderRadius:16,alignItems:'center',justifyContent:'center',flexDirection:'row',gap:8,marginTop:19},contactLabel:{color:'#FFFFFF',fontSize:13,fontWeight:'900'},
  stats:{flexDirection:'row',gap:10,marginTop:11},shopPhoto:{height:210,width:'100%',borderRadius:22,marginTop:4},addressCard:{flexDirection:'row',alignItems:'flex-start',gap:11,marginTop:12,padding:15,borderRadius:19,backgroundColor:c.surface,borderWidth:1,borderColor:c.border},addressTitle:{color:c.navy,fontSize:13,fontWeight:'900'},addressDesc:{color:c.muted,fontSize:11,lineHeight:17,marginTop:5},
  specialties:{flexDirection:'row',gap:9,flexWrap:'wrap'},chip:{borderRadius:12,backgroundColor:c.soft,paddingHorizontal:12,paddingVertical:10},chipText:{color:c.tealDark,fontWeight:'800',fontSize:11},
  disclaimer:{fontSize:10,color:c.muted,marginTop:18,lineHeight:15,textAlign:'center'},desc:{fontSize:14,color:c.muted,marginTop:25},link:{color:c.tealDark,fontSize:13,fontWeight:'900',marginTop:20},
});

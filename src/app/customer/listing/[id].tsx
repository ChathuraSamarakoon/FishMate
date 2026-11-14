import { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { CustomerShell } from '@/components/customer/CustomerShell';
import { CustomerIcon } from '@/components/customer/Icon';
import { InquiryComposer } from '@/components/customer/InquiryComposer';
import { useMarketplace } from '@/components/customer/MarketplaceContext';
import { SellerCard, SectionHeader, StatCard, money } from '@/components/customer/atoms';
import { customerUi as c } from '@/components/customer/theme';
import { getFishermanById, getListingById } from '@/data/mockData';

export default function CustomerListingDetails() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const item = getListingById(id);
  const { addToCart, cart } = useMarketplace();
  const [quantity, setQuantity] = useState(0.5);
  const [liked, setLiked] = useState(false);
  const [compose, setCompose] = useState(false);
  const [added, setAdded] = useState(false);
  if (!item) return <CustomerShell back title="Listing unavailable" hideNavPadding><Text style={styles.errorText}>We could not find this demo listing.</Text><Pressable onPress={() => router.replace('/customer/search')}><Text style={styles.link}>Browse fish instead</Text></Pressable></CustomerShell>;
  const seller = getFishermanById(item.sellerId);
  const total = item.price * quantity;
  const step = (delta: number) => setQuantity(value => Math.min(item.availableKg, Math.max(.5, Number((value + delta).toFixed(1)))));
  const addItem = () => {
    const existing = cart.find(entry => entry.listingId === item.id)?.kg ?? 0;
    if (existing + quantity > item.availableKg) {
      Alert.alert('Quantity limit', `Your demo cart already contains ${existing} kg. This listing has ${item.availableKg} kg available.`);
      return;
    }
    addToCart(item.id, quantity);
    setAdded(true);
    Alert.alert('Added to demo cart', `${quantity.toFixed(1)} kg of ${item.name} has been added to the prototype cart. Checkout will be built in C10–C14.`);
  };
  return <CustomerShell back title="Catch details" subtitle="Fresh seafood, local sellers" hideNavPadding rightIcon="bag" rightLabel="Demo cart" onRightPress={() => Alert.alert('Demo cart', `${cart.length} distinct item(s) saved in the prototype. Full cart screen is coming later.`)}>
    <View style={styles.photoWrap}><Image source={item.image} resizeMode="cover" style={styles.photo}/><View style={styles.photoBadge}><CustomerIcon name="check" color={c.tealDark} size={14}/><Text style={styles.photoBadgeText}>Fresh catch</Text></View><Pressable onPress={()=>setLiked(v=>!v)} accessibilityRole="button" accessibilityLabel={liked?'Remove from saved':'Save to favorites'} style={styles.fav}><CustomerIcon name="heart" color={liked?'#D34E64':c.navy} size={20}/></Pressable></View>
    <View style={styles.headRow}><View style={{flex:1}}><Text style={styles.eyebrow}>{item.category.toUpperCase()}</Text><Text style={styles.headline}>{item.name}</Text></View><View style={styles.ratingPill}><Text style={styles.ratingText}>★ {item.rating.toFixed(1)}</Text></View></View>
    <Text style={styles.desc}>{item.description}</Text>
    <View style={styles.tags}>{item.tags.map(tag=><View key={tag} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>)}</View>
    <View style={styles.pricePanel}><View><Text style={styles.label}>PRICE PER KILOGRAM</Text><Text style={styles.price}>{money(item.price)} <Text style={styles.per}>/ kg</Text></Text></View><View style={styles.stockBadge}><Text style={styles.stockText}>{item.weightLabel}</Text></View></View>
    <View style={styles.stats}><StatCard label="Freshness" value={item.freshness} icon="clock"/><StatCard label="Location" value={item.location} icon="pin"/></View>
    <View style={styles.stats}><StatCard label="Delivery estimate" value={item.deliveryEta} icon="clock"/><StatCard label="Stock" value={item.stockLabel} icon="check"/></View>
    <SectionHeader title="Choose quantity" subtitle="0.5 kg increments, limited by available stock"/>
    <View style={styles.quantityCard}>
      <View><Text style={styles.quantityLabel}>YOUR QUANTITY</Text><Text style={styles.quantityValue}>{quantity.toFixed(1)} kg</Text></View>
      <View style={styles.stepper}><Pressable onPress={()=>step(-.5)} disabled={quantity<=.5} accessibilityRole="button" accessibilityLabel="Decrease quantity" style={[styles.stepButton, quantity<=.5&&styles.stepDisabled]}><CustomerIcon name="minus" color={c.navy} size={17}/></Pressable><Text style={styles.stepNum}>{quantity.toFixed(1)}</Text><Pressable onPress={()=>step(.5)} disabled={quantity>=item.availableKg} accessibilityRole="button" accessibilityLabel="Increase quantity" style={[styles.stepButton, quantity>=item.availableKg&&styles.stepDisabled]}><CustomerIcon name="plus" color={c.navy} size={17}/></Pressable></View>
    </View>
    <View style={styles.subtotal}><Text style={styles.subtotalText}>Estimated subtotal</Text><Text style={styles.subtotalAmount}>{money(total)}</Text></View>
    {seller ? <><SectionHeader title="Meet the fisherman" subtitle="See seller details and selling location"/><SellerCard seller={seller} onPress={()=>router.push(`/customer/fisherman/${seller.id}` as never)}/></> : null}
    <View style={styles.actions}><Pressable style={styles.outlineButton} onPress={()=>setCompose(true)}><CustomerIcon name="message" color={c.tealDark} size={19}/><Text style={styles.outlineText}>Ask seller</Text></Pressable><Pressable style={styles.primaryButton} onPress={addItem}><CustomerIcon name="bag" color="#FFFFFF" size={19}/><Text style={styles.primaryText}>{added?'Add more':'Add to demo cart'}</Text></Pressable></View>
    <Text style={styles.disclaimer}>Demo listing only · No real order, payment, or inquiry is sent.</Text>
    <InquiryComposer visible={compose} onClose={()=>setCompose(false)} sellerId={item.sellerId} listingId={item.id}/>
  </CustomerShell>;
}

const styles=StyleSheet.create({
  errorText:{marginTop:30,fontSize:15,color:c.muted},link:{marginTop:18,color:c.tealDark,fontWeight:'800'},
  photoWrap:{width:'100%',height:270,borderRadius:26,overflow:'hidden',backgroundColor:c.soft},photo:{width:'100%',height:'100%'},
  photoBadge:{position:'absolute',top:14,left:14,flexDirection:'row',gap:5,alignItems:'center',paddingVertical:8,paddingHorizontal:11,borderRadius:20,backgroundColor:'#E7FAF4'},photoBadgeText:{color:c.tealDark,fontSize:11,fontWeight:'800'},
  fav:{position:'absolute',top:13,right:13,width:42,height:42,borderRadius:16,alignItems:'center',justifyContent:'center',backgroundColor:'#FFFFFF'},
  headRow:{flexDirection:'row',alignItems:'center',marginTop:21,gap:10},eyebrow:{fontSize:10,fontWeight:'900',letterSpacing:1.4,color:c.tealDark},headline:{fontSize:27,color:c.navy,fontWeight:'900',marginTop:7,letterSpacing:-.7},
  ratingPill:{backgroundColor:'#FFF5DE',borderRadius:12,paddingHorizontal:10,paddingVertical:8},ratingText:{color:'#996600',fontWeight:'900',fontSize:12},
  desc:{fontSize:13,lineHeight:21,color:c.muted,marginTop:11},tags:{flexDirection:'row',gap:7,flexWrap:'wrap',marginTop:13},tag:{backgroundColor:c.soft,paddingHorizontal:10,paddingVertical:7,borderRadius:10},tagText:{fontSize:10,fontWeight:'700',color:c.tealDark},
  pricePanel:{backgroundColor:'#E5F7F3',padding:17,borderRadius:21,marginTop:24,flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:9},label:{fontSize:9,color:c.tealDark,letterSpacing:1.4,fontWeight:'900'},price:{fontSize:24,color:c.navy,fontWeight:'900',marginTop:8},per:{fontSize:12,color:c.muted},stockBadge:{backgroundColor:'#FFFFFF',paddingVertical:8,paddingHorizontal:9,borderRadius:13,maxWidth:125},stockText:{fontSize:10,color:c.tealDark,fontWeight:'800',textAlign:'center'},
  stats:{flexDirection:'row',gap:10,marginTop:11},
  quantityCard:{backgroundColor:c.surface,borderWidth:1,borderColor:c.border,borderRadius:20,padding:15,flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:8},quantityLabel:{fontSize:9,color:c.muted,fontWeight:'900',letterSpacing:1},quantityValue:{fontSize:17,color:c.navy,fontWeight:'900',marginTop:7},
  stepper:{flexDirection:'row',alignItems:'center',gap:13},stepButton:{width:35,height:35,backgroundColor:c.soft,borderRadius:11,alignItems:'center',justifyContent:'center'},stepDisabled:{opacity:.35},stepNum:{fontSize:14,fontWeight:'900',color:c.navy,minWidth:22,textAlign:'center'},
  subtotal:{marginTop:13,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},subtotalText:{color:c.muted,fontSize:12},subtotalAmount:{fontSize:19,color:c.navy,fontWeight:'900'},
  actions:{flexDirection:'row',gap:10,marginTop:23},outlineButton:{flex:1,borderRadius:16,height:54,borderWidth:1,borderColor:c.teal,alignItems:'center',justifyContent:'center',flexDirection:'row',gap:6},outlineText:{fontSize:12,color:c.tealDark,fontWeight:'900'},primaryButton:{flex:1.6,borderRadius:16,height:54,backgroundColor:c.teal,alignItems:'center',justifyContent:'center',flexDirection:'row',gap:7},primaryText:{fontSize:12,color:'#FFFFFF',fontWeight:'900'},
  disclaimer:{fontSize:10,color:c.muted,textAlign:'center',marginTop:16},
});

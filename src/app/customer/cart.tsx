import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { CustomerShell } from '@/components/customer/CustomerShell';
import { useMarketplace } from '@/components/customer/MarketplaceContext';
import { CostSummary, DemoNotice, ShopHeading, ShopPrimaryButton } from '@/components/customer/ShopUI';
import { CustomerIcon } from '@/components/customer/Icon';
import { customerUi as c } from '@/components/customer/theme';
import { getFishermanById, getListingById } from '@/data/mockData';
import { calculateCartTotals, formatMoney, toHalfKg, validateCart } from '@/utils/orderUtils';

export default function ShoppingCart() {
  const {cart,orders,remainingStock,updateCartQuantity,removeFromCart,clearCart}=useMarketplace();
  const totals=calculateCartTotals(cart);
  const first=getListingById(cart[0]?.listingId);
  const seller=first?getFishermanById(first.sellerId):null;
  const change=(id:string,kg:number)=>{
    if(kg<0.5){removeFromCart(id);return;}
    const result=updateCartQuantity(id,toHalfKg(kg));
    if(!result.ok) Alert.alert('Quantity limit',result.error);
  };
  const goCheckout=()=>{
    const err=validateCart(cart,orders.filter(v=>!v.isSample));
    if(err) return Alert.alert('Review cart',err);
    router.push('/customer/checkout');
  };
  return <CustomerShell back title="Shopping cart" subtitle="C10 · Review your fresh picks" hideNavPadding>
    <DemoNotice>Frontend demo · This cart does not send any purchase to a fisherman.</DemoNotice>
    {cart.length===0?<View style={s.empty}><CustomerIcon name="bag" size={46} color={c.tealDark}/><Text style={s.emptyTitle}>Your cart is waiting for fresh fish</Text><Text style={s.emptyBody}>Browse today's catches and add a fish to start a demo checkout.</Text><ShopPrimaryButton label="Explore fresh seafood" onPress={()=>router.replace('/customer/search')}/></View>:
    <>
      <ShopHeading title={`Your basket (${cart.length})`} caption="One fisherman per checkout · quantities in 0.5 kg increments" />
      {seller?<View style={s.seller}><Image source={seller.avatar} style={s.sellerImage}/><View style={{flex:1}}><Text style={s.sellerName}>{seller.name}</Text><Text style={s.sellerMeta}>{seller.village} · seller of this order</Text></View></View>:null}
      {cart.map(entry=>{
        const item=getListingById(entry.listingId);
        if(!item)return null;
        return <View key={entry.listingId} style={s.itemCard}>
          <Image source={item.image} style={s.itemImage}/><View style={{flex:1,minWidth:0}}>
            <Text style={s.itemTitle} numberOfLines={1}>{item.name}</Text><Text style={s.itemMeta}>{formatMoney(item.price)} /kg</Text>
            <Text style={s.itemStock}>Available: {remainingStock(item.id)} kg</Text>
            <View style={s.stepper}>
              <Pressable accessibilityLabel={`Reduce ${item.name} quantity`} onPress={()=>change(item.id,entry.kg-0.5)} style={s.step}><Text style={s.stepText}>−</Text></Pressable>
              <Text style={s.qty}>{entry.kg.toFixed(1)} kg</Text>
              <Pressable accessibilityLabel={`Increase ${item.name} quantity`} onPress={()=>change(item.id,entry.kg+0.5)} disabled={entry.kg>=remainingStock(item.id)} style={s.step}><Text style={s.stepText}>+</Text></Pressable>
            </View>
          </View>
          <View style={s.right}><Pressable accessibilityLabel={`Remove ${item.name}`} onPress={()=>removeFromCart(item.id)}><Text style={s.remove}>✕</Text></Pressable><Text style={s.linePrice}>{formatMoney(item.price*entry.kg)}</Text></View>
        </View>;
      })}
      <Pressable style={s.clear} onPress={()=>Alert.alert('Clear cart?','Remove every item from this demo basket?', [{text:'Keep items',style:'cancel'},{text:'Clear cart',style:'destructive',onPress:clearCart}])}><Text style={s.clearText}>Clear basket</Text></Pressable>
      <CostSummary {...totals}/>
      <ShopPrimaryButton label="Proceed to checkout" onPress={goCheckout}/>
      <ShopPrimaryButton alternate label="Continue shopping" onPress={()=>router.push('/customer/search')}/>
    </>}
  </CustomerShell>;
}
const s=StyleSheet.create({
  empty:{marginTop:24,backgroundColor:c.surface,borderRadius:25,borderWidth:1,borderColor:c.border,padding:26,alignItems:'center'},emptyTitle:{color:c.navy,fontSize:20,fontWeight:'900',marginTop:16,textAlign:'center'},emptyBody:{textAlign:'center',fontSize:12,color:c.muted,lineHeight:20,marginTop:9},
  seller:{flexDirection:'row',gap:11,alignItems:'center',padding:12,backgroundColor:c.soft,borderRadius:18,marginBottom:10},sellerImage:{width:42,height:42,borderRadius:12},sellerName:{fontWeight:'900',color:c.navy,fontSize:13},sellerMeta:{fontSize:10,color:c.muted,marginTop:3},
  itemCard:{flexDirection:'row',gap:10,backgroundColor:c.surface,borderRadius:21,padding:11,borderWidth:1,borderColor:c.border,marginBottom:11},itemImage:{height:105,width:96,borderRadius:15},itemTitle:{fontSize:13,color:c.navy,fontWeight:'900'},itemMeta:{fontSize:11,color:c.muted,marginTop:6},itemStock:{color:c.tealDark,fontSize:10,marginTop:4,fontWeight:'700'},
  stepper:{flexDirection:'row',alignItems:'center',gap:7,marginTop:10},step:{width:28,height:28,borderRadius:9,alignItems:'center',justifyContent:'center',backgroundColor:c.soft},stepText:{fontSize:18,color:c.tealDark,fontWeight:'900'},qty:{fontWeight:'800',fontSize:11,color:c.navy},
  right:{justifyContent:'space-between',alignItems:'flex-end',paddingLeft:2},remove:{color:c.muted,fontSize:17,padding:4},linePrice:{fontSize:11,fontWeight:'900',color:c.navy},clear:{alignSelf:'flex-end',padding:8},clearText:{color:c.muted,fontSize:11,fontWeight:'800'},
});

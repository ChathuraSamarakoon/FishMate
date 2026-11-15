import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { CustomerShell } from '@/components/customer/CustomerShell';
import { useMarketplace } from '@/components/customer/MarketplaceContext';
import { CostSummary, DemoNotice, OrderStatusPill, ShopHeading, ShopPrimaryButton } from '@/components/customer/ShopUI';
import { customerUi as c } from '@/components/customer/theme';
import { getFishermanById, getListingById } from '@/data/mockData';
import { formatMoney, formatOrderDate, paymentStatusLabel } from '@/utils/orderUtils';

export default function OrderDetails(){
  const {id}=useLocalSearchParams<{id?:string}>();
  const {orders}=useMarketplace();
  const order=orders.find(v=>v.id===id);
  if(!order)return <CustomerShell back title="Order details" hideNavPadding><DemoNotice>That order was not found in this demo session.</DemoNotice><ShopPrimaryButton label="My Orders" onPress={()=>router.replace('/customer/orders')}/></CustomerShell>;
  const seller=getFishermanById(order.sellerId);
  return <CustomerShell back title="Order details" subtitle="C16 · Your order summary" hideNavPadding>
    <DemoNotice>{order.isSample?'Sample order created for UI preview. This does not represent a real purchase.':'Demo order · No real seafood delivery or payment has been arranged.'}</DemoNotice>
    <View style={s.hero}><Text style={s.overline}>ORDER REFERENCE</Text><Text style={s.orderId}>{order.id}</Text><Text style={s.date}>Placed {formatOrderDate(order.createdAt)}</Text><View style={{alignSelf:'flex-start',marginTop:14}}><OrderStatusPill status={order.status}/></View></View>
    <ShopHeading title="Ordered seafood"/>
    <View style={s.card}>{order.items.map(item=>{
      const listing=getListingById(item.listingId);
      return <View key={item.listingId} style={s.productRow}>{listing?<Image source={listing.image} style={s.image}/>:null}<View style={{flex:1}}><Text style={s.productTitle}>{item.name}</Text><Text style={s.productMeta}>{item.kg.toFixed(1)} kg × {formatMoney(item.unitPrice)}</Text></View><Text style={s.price}>{formatMoney(item.lineTotal)}</Text></View>;
    })}</View>
    <ShopHeading title="Fisherman"/>
    <Pressable accessibilityRole="button" style={s.sellerCard} onPress={()=>seller&&router.push(`/customer/fisherman/${seller.id}` as never)}>{seller?<Image source={seller.avatar} style={s.avatar}/>:null}<View style={{flex:1}}><Text style={s.sellerName}>{seller?.name??'Fish seller'}</Text><Text style={s.productMeta}>{seller?.village??''}</Text></View><Text style={s.arrow}>›</Text></Pressable>
    <ShopHeading title="Delivery information"/>
    <View style={s.card}><Text style={s.addressName}>{order.customer.fullName} · {order.customer.phone}</Text><Text style={s.address}>{order.customer.address}, {order.customer.city}</Text>{order.customer.notes?<Text style={s.note}>Note: {order.customer.notes}</Text>:null}</View>
    <ShopHeading title="Payment"/>
    <View style={s.card}><View style={s.detailRow}><Text style={s.detailLabel}>Method</Text><Text style={s.detailValue}>{order.paymentMethod==='cod'?'Cash on Delivery':'Online (demo)'}</Text></View><View style={s.detailRow}><Text style={s.detailLabel}>Status</Text><Text style={s.detailValue}>{paymentStatusLabel[order.paymentStatus]}</Text></View></View>
    <CostSummary subtotal={order.subtotal} fee={order.deliveryFee} total={order.total}/>
    {order.status==='awaiting_payment' && order.paymentMethod==='online'?<ShopPrimaryButton label="Retry simulated payment" onPress={()=>router.push({pathname:'/customer/payment-gateway',params:{id:order.id}})}/>:<ShopPrimaryButton label="View delivery progress" onPress={()=>router.push({pathname:'/customer/tracking/[id]',params:{id:order.id}})}/>}
    {seller?<ShopPrimaryButton alternate label="View fisherman profile" onPress={()=>router.push(`/customer/fisherman/${seller.id}` as never)}/>:null}
    <ShopPrimaryButton alternate label="Back to My Orders" onPress={()=>router.replace('/customer/orders')}/>
  </CustomerShell>;
}
const s=StyleSheet.create({
  hero:{backgroundColor:'#064B5D',borderRadius:25,padding:19,marginTop:17},overline:{color:'#A7E9E5',fontSize:10,fontWeight:'900',letterSpacing:1.3},orderId:{fontSize:23,color:'#FFFFFF',fontWeight:'900',marginTop:9},date:{color:'#C5E9E7',fontSize:11,marginTop:7},
  card:{backgroundColor:c.surface,borderRadius:21,borderWidth:1,borderColor:c.border,padding:16,gap:12},productRow:{flexDirection:'row',alignItems:'center',gap:12},image:{width:63,height:60,borderRadius:12},productTitle:{color:c.navy,fontSize:13,fontWeight:'900'},productMeta:{color:c.muted,fontSize:11,marginTop:5},price:{color:c.tealDark,fontSize:12,fontWeight:'900'},
  sellerCard:{flexDirection:'row',gap:12,padding:13,alignItems:'center',backgroundColor:c.surface,borderRadius:20,borderWidth:1,borderColor:c.border},avatar:{width:55,height:55,borderRadius:16},sellerName:{fontSize:14,fontWeight:'900',color:c.navy},arrow:{fontSize:30,color:c.tealDark},
  addressName:{color:c.navy,fontSize:12,fontWeight:'900'},address:{color:c.muted,fontSize:12,lineHeight:20},note:{color:c.tealDark,fontSize:11,lineHeight:19},detailRow:{flexDirection:'row',justifyContent:'space-between',gap:12},detailLabel:{color:c.muted,fontSize:12},detailValue:{color:c.navy,fontSize:12,fontWeight:'800',flexShrink:1,textAlign:'right'},
});

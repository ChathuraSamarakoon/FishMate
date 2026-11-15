import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { CustomerShell } from '@/components/customer/CustomerShell';
import { useMarketplace } from '@/components/customer/MarketplaceContext';
import { DemoNotice, ShopPrimaryButton } from '@/components/customer/ShopUI';
import { customerUi as c } from '@/components/customer/theme';
import { formatMoney } from '@/utils/orderUtils';

export default function PaymentResult(){
  const {id}=useLocalSearchParams<{id?:string}>();
  const {orders}=useMarketplace();
  const order=orders.find(v=>v.id===id);
  if(!order)return <CustomerShell back title="Payment result" hideNavPadding><DemoNotice>No matching demo order was found.</DemoNotice><ShopPrimaryButton label="View My Orders" onPress={()=>router.replace('/customer/orders')}/></CustomerShell>;
  const failed=order.paymentStatus==='failed';
  const cod=order.paymentMethod==='cod';
  const pending=order.paymentStatus==='pending';
  return <CustomerShell back title="Payment result" subtitle="C14 · Order status" hideNavPadding>
    <DemoNotice>All payment and order results displayed here are simulated. No real transaction occurred.</DemoNotice>
    <View style={s.card}>
      <View style={[s.circle,failed?s.failed:pending?s.pending:s.success]}><Text style={s.symbol}>{failed?'✕':pending?'…':'✓'}</Text></View>
      <Text style={s.title}>{failed?'Payment not completed':pending?'Awaiting demo payment':cod?'Demo order placed':'Demo payment successful!'}</Text>
      <Text style={s.subtitle}>{failed?'Your demo order is saved. You can retry without creating another order.':pending?'Choose a simulated result on the gateway screen.':cod?'Payment is marked as cash due on delivery; no money has been collected.':'Your demo online payment has been marked successful. No real money was charged.'}</Text>
      <View style={s.divider}/>
      <View style={s.row}><Text style={s.label}>Order ID</Text><Text style={s.value}>{order.id}</Text></View>
      <View style={s.row}><Text style={s.label}>Amount</Text><Text style={s.value}>{formatMoney(order.total)}</Text></View>
      <View style={s.row}><Text style={s.label}>Method</Text><Text style={s.value}>{cod?'Cash on Delivery':'Online (demo)'}</Text></View>
      <View style={s.row}><Text style={s.label}>Payment</Text><Text style={s.value}>{failed?'Failed':pending?'Pending':cod?'Due on delivery':'Demo paid'}</Text></View>
    </View>
    {failed||pending?<ShopPrimaryButton label="Retry simulated payment" onPress={()=>router.replace({pathname:'/customer/payment-gateway',params:{id:order.id}})}/>:null}
    <ShopPrimaryButton alternate={failed||pending} label="View order details" onPress={()=>router.replace({pathname:'/customer/order/[id]',params:{id:order.id}})}/>
    <ShopPrimaryButton alternate label="My Orders" onPress={()=>router.replace('/customer/orders')}/>
    <Pressable style={s.homeLink} onPress={()=>router.replace('/customer/home')}><Text style={s.homeText}>Return to home</Text></Pressable>
  </CustomerShell>;
}
const s=StyleSheet.create({
  card:{backgroundColor:c.surface,borderColor:c.border,borderWidth:1,borderRadius:28,padding:22,alignItems:'center',marginTop:22},circle:{width:82,height:82,borderRadius:41,alignItems:'center',justifyContent:'center',marginTop:5},success:{backgroundColor:'#1CB79C'},failed:{backgroundColor:'#D95F64'},pending:{backgroundColor:'#D5A14A'},symbol:{fontSize:39,fontWeight:'900',color:'#FFFFFF'},title:{color:c.navy,fontSize:23,fontWeight:'900',marginTop:18,textAlign:'center'},subtitle:{color:c.muted,fontSize:12,lineHeight:20,marginTop:10,textAlign:'center'},divider:{height:1,backgroundColor:c.border,width:'100%',marginTop:22,marginBottom:17},row:{width:'100%',flexDirection:'row',justifyContent:'space-between',gap:10,marginBottom:11},label:{fontSize:11,color:c.muted},value:{fontSize:11,fontWeight:'900',color:c.navy,flexShrink:1,textAlign:'right'},homeLink:{padding:16,alignItems:'center'},homeText:{color:c.tealDark,fontWeight:'800',fontSize:12},
});

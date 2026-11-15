import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { CustomerShell } from '@/components/customer/CustomerShell';
import { useMarketplace } from '@/components/customer/MarketplaceContext';
import { DemoNotice, ShopPrimaryButton } from '@/components/customer/ShopUI';
import { customerUi as c } from '@/components/customer/theme';
import { formatMoney } from '@/utils/orderUtils';

export default function PaymentGatewayScreen(){
  const {id}=useLocalSearchParams<{id?:string}>();
  const {orders,completeDemoPayment}=useMarketplace();
  const order=orders.find(entry=>entry.id===id);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const simulate=(success:boolean)=>{
    if(!order || busy)return;
    setBusy(true);
    const result=completeDemoPayment(order.id,success);
    if(!result.ok){setError(result.error);setBusy(false);return;}
    router.replace({pathname:'/customer/payment-result',params:{id:order.id}});
  };
  if(!order || order.paymentMethod!=='online')return <CustomerShell back title="Demo payment" hideNavPadding><DemoNotice>That online payment order was not found.</DemoNotice><ShopPrimaryButton label="Go to My Orders" onPress={()=>router.replace('/customer/orders')}/></CustomerShell>;
  return <CustomerShell back title="Secure checkout preview" subtitle="C13 · Simulated payment gateway" hideNavPadding>
    <DemoNotice>SIMULATION ONLY: No external gateway, card numbers, bank accounts, charges or refunds are involved.</DemoNotice>
    <View style={s.panel}>
      <View style={s.lock}><Text style={s.lockText}>▣</Text></View>
      <Text style={s.brand}>FISHMATE PAY</Text>
      <Text style={s.demo}>DEMONSTRATION MODE</Text>
      <Text style={s.amount}>{formatMoney(order.total)}</Text>
      <Text style={s.orderId}>Order {order.id}</Text>
      <View style={s.line}/>
      <Text style={s.copy}>Choose a simulated result to preview the payment experience. Your payment information is never requested.</Text>
    </View>
    <View style={s.options}>
      <ShopPrimaryButton label="Simulate successful payment" disabled={busy} onPress={()=>simulate(true)}/>
      {order.paymentStatus!=='paid'?<ShopPrimaryButton label="Simulate failed payment" alternate disabled={busy} onPress={()=>simulate(false)}/>:null}
    </View>
    {!!error?<Text accessibilityRole="alert" style={s.error}>{error}</Text>:null}
    <Text style={s.help}>The same order ID is reused on retry. Payment success only changes demo status.</Text>
  </CustomerShell>;
}
const s=StyleSheet.create({
  panel:{marginTop:24,backgroundColor:'#064B5D',borderRadius:29,padding:25,alignItems:'center',overflow:'hidden'},lock:{height:60,width:60,borderRadius:21,backgroundColor:'#0C7582',alignItems:'center',justifyContent:'center',marginBottom:12,borderWidth:1,borderColor:'#3AE3CF'},lockText:{fontSize:32,color:'#FFFFFF'},brand:{color:'#D1FFF9',fontSize:12,fontWeight:'900',letterSpacing:2},demo:{color:'#9BE8E4',fontSize:9,fontWeight:'900',letterSpacing:1.7,marginTop:8},amount:{color:'#FFFFFF',fontSize:32,fontWeight:'900',marginTop:22},orderId:{color:'#B6E7E6',fontSize:11,marginTop:9},line:{height:1,backgroundColor:'#2F7782',width:'100%',marginTop:25,marginBottom:17},copy:{color:'#CAEEF0',fontSize:12,lineHeight:19,textAlign:'center'},options:{marginTop:16},error:{color:c.danger,fontSize:12,fontWeight:'800',marginTop:13},help:{fontSize:11,lineHeight:18,color:c.muted,textAlign:'center',marginTop:19},
});

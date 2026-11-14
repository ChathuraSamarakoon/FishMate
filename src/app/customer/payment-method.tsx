import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { CustomerShell } from '@/components/customer/CustomerShell';
import { useMarketplace } from '@/components/customer/MarketplaceContext';
import { CostSummary, DemoNotice, ShopHeading, ShopPrimaryButton } from '@/components/customer/ShopUI';
import { customerUi as c } from '@/components/customer/theme';
import { calculateCartTotals, type PaymentMethod } from '@/utils/orderUtils';

export default function PaymentMethodScreen(){
  const {cart,checkoutDraft,placeDemoOrder}=useMarketplace();
  const [method,setMethod]=useState<PaymentMethod>('cod');
  const [error,setError]=useState('');
  const totals=calculateCartTotals(cart);
  const submit=()=>{
    setError('');
    const result=placeDemoOrder(method);
    if(!result.ok)return setError(result.error);
    if(method==='cod') router.replace({pathname:'/customer/payment-result',params:{id:result.id??''}});
    else router.replace({pathname:'/customer/payment-gateway',params:{id:result.id??''}});
  };
  if(!cart.length||!checkoutDraft)return <CustomerShell back title="Payment method" hideNavPadding><DemoNotice>Your checkout session is incomplete. Restart from your cart.</DemoNotice><ShopPrimaryButton label="Back to cart" onPress={()=>router.replace('/customer/cart')}/></CustomerShell>;
  return <CustomerShell back title="Payment method" subtitle="C12 · Choose how to pay" hideNavPadding>
    <DemoNotice>Payment selection is simulated; no money will be charged.</DemoNotice>
    <ShopHeading title="Choose a payment option" caption="Pay later with cash or try a simulated online payment"/>
    {([{id:'cod',icon:'💵',name:'Cash on delivery',desc:'Pay the fisherman when your demo delivery arrives.'},
      {id:'online',icon:'▣',name:'Online payment (demo)',desc:'Simulate success/failure without entering any card details.'},
    ] as const).map(item=><Pressable key={item.id} accessibilityRole="radio" accessibilityState={{checked:method===item.id}} style={[s.choice,method===item.id&&s.selected]} onPress={()=>setMethod(item.id)}>
      <View style={s.methodIcon}><Text style={s.icon}>{item.icon}</Text></View>
      <View style={{flex:1}}><Text style={s.methodTitle}>{item.name}</Text><Text style={s.desc}>{item.desc}</Text></View>
      <View style={[s.radio,method===item.id&&s.radioOn]}>{method===item.id?<View style={s.radioDot}/>:null}</View>
    </Pressable>)}
    <View style={s.address}><Text style={s.overline}>DELIVERY TO</Text><Text style={s.addressText}>{checkoutDraft.fullName} · {checkoutDraft.phone}</Text><Text style={s.addressSub}>{checkoutDraft.address}, {checkoutDraft.city}</Text></View>
    <CostSummary {...totals}/>
    {!!error?<Text accessibilityRole="alert" style={s.error}>{error}</Text>:null}
    <ShopPrimaryButton label={method==='cod'?'Place demo COD order':'Continue to demo payment'} onPress={submit}/>
  </CustomerShell>;
}
const s=StyleSheet.create({
  choice:{backgroundColor:c.surface,flexDirection:'row',alignItems:'center',gap:12,padding:16,borderWidth:1.5,borderColor:c.border,borderRadius:20,marginBottom:12},selected:{borderColor:c.teal,backgroundColor:'#F0FAF8'},methodIcon:{width:46,height:46,borderRadius:14,backgroundColor:c.soft,alignItems:'center',justifyContent:'center'},icon:{fontSize:22,color:c.tealDark},methodTitle:{fontSize:14,color:c.navy,fontWeight:'900'},desc:{fontSize:11,color:c.muted,lineHeight:17,marginTop:5},radio:{height:22,width:22,borderWidth:2,borderColor:'#B7CCCE',borderRadius:12,alignItems:'center',justifyContent:'center'},radioOn:{borderColor:c.teal},radioDot:{width:12,height:12,borderRadius:7,backgroundColor:c.teal},
  address:{backgroundColor:c.surface,borderRadius:20,padding:17,marginTop:13,borderWidth:1,borderColor:c.border},overline:{color:c.tealDark,fontSize:10,fontWeight:'900',letterSpacing:1.1},addressText:{color:c.navy,fontSize:13,fontWeight:'900',marginTop:10},addressSub:{color:c.muted,fontSize:12,lineHeight:19,marginTop:5},error:{marginTop:13,color:'#BD4851',fontWeight:'800',fontSize:12},
});

import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { CustomerShell } from '@/components/customer/CustomerShell';
import { useMarketplace } from '@/components/customer/MarketplaceContext';
import { useCustomerProfile } from '@/components/customer/CustomerProfileContext';
import { CostSummary, DemoNotice, ShopHeading, ShopPrimaryButton } from '@/components/customer/ShopUI';
import { customerUi as c } from '@/components/customer/theme';
import { calculateCartTotals, validateCart, validateCheckout, type CheckoutDraft } from '@/utils/orderUtils';
import { getFishermanById, getListingById } from '@/data/mockData';

type TextFieldKey=keyof CheckoutDraft;
const blank:CheckoutDraft={fullName:'',phone:'',city:'',address:'',notes:''};
export default function Checkout() {
  const {cart,orders,checkoutDraft,setCheckoutDraft}=useMarketplace();
  const {profile}=useCustomerProfile();
  const [draft,setDraft]=useState<CheckoutDraft>(()=>checkoutDraft ?? {
    ...blank,fullName:profile?.fullName??'',phone:profile?.phone??'',city:profile?.city??'',address:profile?.address??'',
  });
  const [error,setError]=useState('');
  const totals=calculateCartTotals(cart);
  const first=getListingById(cart[0]?.listingId);
  const seller=first?getFishermanById(first.sellerId):null;
  const update=(key:TextFieldKey,value:string)=>{setError('');setDraft(old=>({...old,[key]:value}));};
  const proceed=()=>{
    const err=validateCart(cart,orders.filter(o=>!o.isSample)) ?? validateCheckout(draft);
    if(err)return setError(err);
    setCheckoutDraft({...draft,fullName:draft.fullName.trim(),phone:draft.phone.trim(),city:draft.city.trim(),address:draft.address.trim(),notes:draft.notes.trim()});
    router.push('/customer/payment-method');
  };
  if(!cart.length)return <CustomerShell back title="Checkout" hideNavPadding><DemoNotice>Your basket is empty.</DemoNotice><ShopPrimaryButton label="Go to shopping cart" onPress={()=>router.replace('/customer/cart')}/></CustomerShell>;
  return <CustomerShell back title="Delivery & checkout" subtitle="C11 · Tell us where to bring your catch" hideNavPadding>
    <DemoNotice>Demo checkout only · Address and phone will stay in this app session. No delivery will be arranged.</DemoNotice>
    <ShopHeading title="Delivery details" caption="Required fields are marked *"/>
    {([{key:'fullName',label:'Full name *',hint:'Your full name',keyboard:'default'},
      {key:'phone',label:'Mobile number *',hint:'07X XXX XXXX',keyboard:'phone-pad'},
      {key:'city',label:'City or village *',hint:'e.g. Negombo',keyboard:'default'},
      {key:'address',label:'Delivery address *',hint:'House no., street and area',keyboard:'default'},
      {key:'notes',label:'Delivery instructions (optional)',hint:'Gate, landmarks, preferred time',keyboard:'default'},
    ] as {key:TextFieldKey;label:string;hint:string;keyboard:'default'|'phone-pad'}[]).map(field=><View key={field.key} style={s.field}>
      <Text style={s.label}>{field.label}</Text><TextInput accessibilityLabel={field.label} keyboardType={field.keyboard} multiline={field.key==='address'||field.key==='notes'} numberOfLines={field.key==='address'||field.key==='notes'?2:1} maxLength={field.key==='notes'?220:field.key==='phone'?13:180} value={draft[field.key]} placeholder={field.hint} placeholderTextColor="#9AAFB2" onChangeText={value=>update(field.key,value)} style={[s.input,(field.key==='address'||field.key==='notes')&&s.multiline]}/>
    </View>)}
    <ShopHeading title="Order overview" caption={`From ${seller?.name??'selected fisherman'}`}/>
    <View style={s.overview}>{cart.map(entry=>{const item=getListingById(entry.listingId);return item?<View key={entry.listingId} style={s.row}><Text style={s.item}>{item.name} · {entry.kg.toFixed(1)} kg</Text><Text style={s.price}>Rs. {(item.price*entry.kg).toLocaleString()}</Text></View>:null;})}</View>
    <CostSummary {...totals}/>
    {!!error?<Text accessibilityRole="alert" style={s.error}>{error}</Text>:null}
    <ShopPrimaryButton label="Continue to payment" onPress={proceed}/>
  </CustomerShell>;
}
const s=StyleSheet.create({
  field:{marginBottom:13},label:{color:c.navy,fontSize:12,fontWeight:'800',marginBottom:7},input:{backgroundColor:c.surface,borderColor:c.border,borderWidth:1,borderRadius:16,paddingHorizontal:15,paddingVertical:13,minHeight:52,color:c.navy,fontSize:13},multiline:{minHeight:78,textAlignVertical:'top'},
  overview:{backgroundColor:c.surface,borderWidth:1,borderColor:c.border,borderRadius:19,padding:16,gap:13},row:{flexDirection:'row',justifyContent:'space-between',gap:15},item:{flex:1,color:c.navy,fontSize:12,fontWeight:'700'},price:{color:c.tealDark,fontSize:12,fontWeight:'900'},error:{marginTop:14,color:'#BD4851',fontWeight:'700',fontSize:12},
});

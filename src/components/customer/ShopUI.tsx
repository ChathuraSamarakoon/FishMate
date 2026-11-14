import type { ReactNode } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ShopOrder } from '@/utils/orderUtils';
import { formatMoney, formatOrderDate, orderStatusLabel, paymentStatusLabel } from '@/utils/orderUtils';
import { getFishermanById, getListingById } from '@/data/mockData';
import { CustomerIcon } from './Icon';
import { customerUi as c } from './theme';

export function DemoNotice({ children }: { children?: ReactNode }) {
  return <View style={s.notice}><CustomerIcon name="sparkles" size={17} color={c.tealDark}/><Text style={s.noticeText}>{children ?? 'FRONTEND DEMO · No real orders, payments or deliveries are processed.'}</Text></View>;
}
export function ShopPrimaryButton({ label, onPress, disabled, alternate }: { label:string; onPress:()=>void; disabled?:boolean; alternate?:boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{disabled:!!disabled}} disabled={disabled} onPress={onPress} style={({pressed})=>[s.button,alternate?s.altButton:null,disabled && {opacity:.42},pressed && {opacity:.8}]}><Text style={[s.buttonText,alternate && {color:c.tealDark}]}>{label}</Text><CustomerIcon name="chevron-right" color={alternate?c.tealDark:'#FFFFFF'} size={17}/></Pressable>;
}
export function ShopHeading({ title, caption }: { title:string; caption?:string }) {
  return <View style={s.heading}><Text style={s.headingTitle}>{title}</Text>{caption?<Text style={s.headingCaption}>{caption}</Text>:null}</View>;
}
export function CostSummary({ subtotal, fee, total }: {subtotal:number; fee:number; total:number}) {
  return <View style={s.costCard}><View style={s.costRow}><Text style={s.costLabel}>Seafood subtotal</Text><Text style={s.costValue}>{formatMoney(subtotal)}</Text></View><View style={s.costRow}><Text style={s.costLabel}>Demo delivery fee</Text><Text style={s.costValue}>{formatMoney(fee)}</Text></View><View style={s.divider}/><View style={s.costRow}><Text style={s.totalLabel}>Total</Text><Text style={s.totalValue}>{formatMoney(total)}</Text></View></View>;
}
export function OrderStatusPill({ status }: {status:ShopOrder['status']}) {
  const completed=status==='delivered'; const waiting=status==='awaiting_payment';
  return <View style={[s.statusPill,{backgroundColor:completed?'#E4F8EE':waiting?'#FFF2E5':'#E4F7F4'}]}><View style={[s.statusDot,{backgroundColor:completed?'#23A56F':waiting?'#D7893B':c.tealDark}]}/><Text style={[s.statusText,{color:completed?'#168153':waiting?'#A55B18':c.tealDark}]}>{orderStatusLabel[status]}</Text></View>;
}
export function OrderMiniCard({order,onPress}:{order:ShopOrder;onPress:()=>void}) {
  const first=order.items[0]; const item=getListingById(first?.listingId);
  const seller=getFishermanById(order.sellerId);
  return <Pressable onPress={onPress} accessibilityRole="button" style={s.orderCard}>
    <View style={s.orderTop}><View style={{flex:1}}><Text style={s.orderId}>{order.id}</Text><Text style={s.orderMeta}>{formatOrderDate(order.createdAt)} • {seller?.name??'Seller'}</Text></View><OrderStatusPill status={order.status}/></View>
    <View style={s.orderBody}>{item?<Image source={item.image} style={s.orderImage}/>:null}<View style={{flex:1}}><Text style={s.orderItem} numberOfLines={1}>{first?.name ?? 'Seafood'}{order.items.length>1?` + ${order.items.length-1} more`:''}</Text><Text style={s.orderMeta}>{order.items.reduce((sum,v)=>sum+v.kg,0)} kg • {paymentStatusLabel[order.paymentStatus]}</Text></View><Text style={s.orderAmount}>{formatMoney(order.total)}</Text></View>
    {order.isSample?<Text style={s.sampleTag}>SAMPLE ORDER · for UI preview</Text>:null}
  </Pressable>;
}
const s=StyleSheet.create({
  notice:{marginTop:13,backgroundColor:'#E9F7F5',borderColor:'#CBECE5',borderWidth:1,borderRadius:17,padding:13,flexDirection:'row',gap:9,alignItems:'flex-start'},
  noticeText:{fontSize:11,color:c.tealDark,flex:1,lineHeight:18,fontWeight:'600'},
  button:{backgroundColor:c.teal,borderRadius:18,minHeight:55,paddingHorizontal:19,marginTop:17,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:10},
  altButton:{backgroundColor:c.soft,borderColor:c.border,borderWidth:1},buttonText:{fontSize:14,fontWeight:'900',color:'#FFFFFF'},
  heading:{marginTop:24,marginBottom:12},headingTitle:{fontSize:18,color:c.navy,fontWeight:'900'},headingCaption:{fontSize:11,color:c.muted,marginTop:5},
  costCard:{padding:18,borderRadius:22,backgroundColor:c.surface,borderWidth:1,borderColor:c.border,marginTop:18,gap:13},
  costRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:12},costLabel:{color:c.muted,fontSize:12},costValue:{color:c.navy,fontSize:13,fontWeight:'800'},
  divider:{height:1,backgroundColor:c.border},totalLabel:{color:c.navy,fontSize:15,fontWeight:'900'},totalValue:{color:c.tealDark,fontSize:20,fontWeight:'900'},
  statusPill:{flexDirection:'row',alignItems:'center',borderRadius:15,paddingHorizontal:9,paddingVertical:7,gap:5},statusDot:{width:6,height:6,borderRadius:3},statusText:{fontSize:10,fontWeight:'900'},
  orderCard:{backgroundColor:c.surface,borderRadius:22,borderColor:c.border,borderWidth:1,padding:15,marginBottom:12},orderTop:{flexDirection:'row',alignItems:'center',gap:10},
  orderId:{fontSize:13,fontWeight:'900',color:c.navy},orderMeta:{fontSize:10,color:c.muted,marginTop:5,lineHeight:16},orderBody:{flexDirection:'row',gap:11,alignItems:'center',marginTop:14,borderTopWidth:1,borderColor:c.border,paddingTop:14},
  orderImage:{width:58,height:58,borderRadius:13},orderItem:{fontSize:12,color:c.navy,fontWeight:'900'},orderAmount:{fontSize:13,color:c.tealDark,fontWeight:'900'},sampleTag:{fontSize:10,color:c.muted,marginTop:12,fontWeight:'700'},
});

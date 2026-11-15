import { StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { CustomerShell } from '@/components/customer/CustomerShell';
import { useMarketplace } from '@/components/customer/MarketplaceContext';
import { DemoNotice, ShopPrimaryButton } from '@/components/customer/ShopUI';
import { customerUi as c } from '@/components/customer/theme';
import { ORDER_STAGES, orderStatusLabel } from '@/utils/orderUtils';
import { getFishermanById } from '@/data/mockData';

export default function DeliveryTracking(){
  const {id}=useLocalSearchParams<{id?:string}>();
  const {orders,simulateNextDeliveryStatus}=useMarketplace();
  const order=orders.find(item=>item.id===id);
  if(!order)return <CustomerShell back title="Delivery tracking" hideNavPadding><DemoNotice>Order not found.</DemoNotice><ShopPrimaryButton label="My Orders" onPress={()=>router.replace('/customer/orders')}/></CustomerShell>;
  const current=ORDER_STAGES.indexOf(order.status as typeof ORDER_STAGES[number]);
  const seller=getFishermanById(order.sellerId);
  const canAdvance=current>=0 && current<ORDER_STAGES.length-1;
  return <CustomerShell back title="Delivery tracking" subtitle="C17 · Demo status timeline" hideNavPadding>
    <DemoNotice>Status-based simulation only. There is no live GPS, driver tracking, or actual delivery.</DemoNotice>
    <View style={s.hero}><Text style={s.eyebrow}>ORDER IN TRANSIT / DEMO</Text><Text style={s.title}>{order.status==='delivered'?'Demo delivered':order.status==='awaiting_payment'?'Demo payment needed':orderStatusLabel[order.status]}</Text><Text style={s.subtitle}>{order.id} · {seller?.name??'FishMate seller'}</Text></View>
    {current<0?<View style={s.warning}><Text style={s.warningTitle}>Delivery timeline not started</Text><Text style={s.warningBody}>Complete the simulated payment for this order before status-based delivery steps appear.</Text><ShopPrimaryButton label="Return to order details" onPress={()=>router.replace({pathname:'/customer/order/[id]',params:{id:order.id}})}/></View>:
    <>
      <View style={s.timeline}><Text style={s.sectionTitle}>Delivery progress</Text><Text style={s.sectionSub}>Each stage is illustrative and not updated by a real fisherman.</Text>
        {ORDER_STAGES.map((step,index)=>{
          const done=index<current;const active=index===current;const future=index>current;
          return <View key={step} style={s.stepRow}><View style={s.markerWrap}><View style={[s.marker,done&&s.done,active&&s.active,future&&s.future]}><Text style={[s.markerText,future&&{color:c.muted}]}>{done?'✓':index+1}</Text></View>{index<ORDER_STAGES.length-1?<View style={[s.connector,done&&s.connectorDone]}/>:null}</View>
            <View style={s.stepCopy}><Text style={[s.stepTitle,future&&{color:c.muted}]}>{orderStatusLabel[step]}</Text><Text style={s.stepBody}>{active?'Current demo status':done?'Completed in demo timeline':'Not started yet'}</Text></View>
            {active?<Text style={s.now}>NOW</Text>:null}
          </View>;
        })}
      </View>
      <View style={s.address}><Text style={s.addressHeading}>Delivery address</Text><Text style={s.addressText}>{order.customer.address}, {order.customer.city}</Text><Text style={s.addressText}>For: {order.customer.fullName}</Text></View>
      {canAdvance?<ShopPrimaryButton label="Simulate next delivery stage" onPress={()=>simulateNextDeliveryStatus(order.id)}/>:<View style={s.completed}><Text style={s.completedText}>✓ Demo timeline complete</Text></View>}
      <Text style={s.footer}>The simulation button is for UI testing only. In production, delivery stages must come from authorized seller or delivery updates.</Text>
    </>}
    <ShopPrimaryButton alternate label="View order details" onPress={()=>router.replace({pathname:'/customer/order/[id]',params:{id:order.id}})}/>
  </CustomerShell>;
}
const s=StyleSheet.create({
  hero:{marginTop:18,backgroundColor:'#064B5D',borderRadius:25,padding:22},eyebrow:{fontSize:10,fontWeight:'900',color:'#BDF2EC',letterSpacing:1.2},title:{color:'#FFFFFF',fontSize:23,fontWeight:'900',marginTop:12},subtitle:{fontSize:11,color:'#C4E6E5',marginTop:9},
  timeline:{backgroundColor:c.surface,borderRadius:25,borderWidth:1,borderColor:c.border,marginTop:20,padding:20},sectionTitle:{color:c.navy,fontWeight:'900',fontSize:18},sectionSub:{color:c.muted,fontSize:11,lineHeight:18,marginTop:7,marginBottom:22},
  stepRow:{flexDirection:'row',gap:13,minHeight:80},markerWrap:{width:38,alignItems:'center'},marker:{width:36,height:36,borderRadius:18,backgroundColor:'#DFF2EE',alignItems:'center',justifyContent:'center',borderWidth:2,borderColor:c.teal},done:{backgroundColor:c.teal},active:{backgroundColor:'#087C8A',borderColor:'#1AC4B5'},future:{backgroundColor:'#F5FAF9',borderColor:'#D6E6E4'},markerText:{color:'#FFFFFF',fontSize:13,fontWeight:'900'},connector:{position:'absolute',top:37,bottom:0,width:3,backgroundColor:'#E0E9EA',borderRadius:2},connectorDone:{backgroundColor:c.teal},stepCopy:{flex:1,paddingTop:3},stepTitle:{fontSize:13,fontWeight:'900',color:c.navy},stepBody:{fontSize:11,color:c.muted,marginTop:5},now:{color:c.tealDark,fontSize:10,fontWeight:'900',paddingTop:8},
  address:{backgroundColor:c.surface,borderRadius:22,borderWidth:1,borderColor:c.border,padding:18,marginTop:18},addressHeading:{color:c.navy,fontWeight:'900',fontSize:14},addressText:{color:c.muted,fontSize:12,lineHeight:20,marginTop:7},completed:{borderRadius:18,backgroundColor:'#E2F7F0',padding:17,alignItems:'center',marginTop:17},completedText:{color:'#158F6D',fontSize:13,fontWeight:'900'},footer:{fontSize:11,color:c.muted,lineHeight:18,marginTop:13,textAlign:'center'},warning:{borderRadius:22,borderWidth:1,borderColor:c.border,backgroundColor:c.surface,padding:19,marginTop:20},warningTitle:{fontSize:16,fontWeight:'900',color:c.navy},warningBody:{fontSize:12,color:c.muted,marginTop:8,lineHeight:19},
});

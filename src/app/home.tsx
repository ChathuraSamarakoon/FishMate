import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getSession, logout } from '@/services/demoAuth';
import { ui } from '@/components/auth/AuthUI';
const logo=require('../../assets/fishmate/fishmate-complete.png');
export default function HomeScreen() {
  const account=getSession();
  return <SafeAreaView style={styles.page} edges={['top','bottom']}>
    <View style={styles.body}>
      <Image source={logo} style={styles.logo} resizeMode="contain" />
      <Text style={styles.badge}>SIGNED IN · DEMO SESSION</Text>
      <Text style={styles.title}>{account?`Welcome, ${account.fullName.split(' ')[0]}!`:'Welcome to FishMate'}</Text>
      <Text style={styles.text}>{account?(account.role==='customer'?'Customer marketplace':'Fisherman dashboard'):'You are not currently signed in.'}</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{account?'Your account is ready':'Frontend preview'}</Text>
        <Text style={styles.cardText}>{account?`Role: ${account.role==='customer'?'Customer':'Fisherman'}\nPhone: ${account.phone}`:'Log in to see your demo account.'}</Text>
        <Text style={styles.muted}>The full marketplace and trip-management screens will be built in the next stages.</Text>
      </View>
      <Pressable accessibilityRole="button" style={styles.button} onPress={()=>{logout();router.replace('/login');}}><Text style={styles.buttonLabel}>{account?'Log out':'Go to Login'}</Text></Pressable>
    </View>
  </SafeAreaView>;
}
const styles=StyleSheet.create({
 page:{flex:1,backgroundColor:ui.bg},body:{flex:1,padding:26,justifyContent:'center',maxWidth:470,width:'100%',alignSelf:'center'},
 logo:{height:115,width:170,alignSelf:'center',marginBottom:24},badge:{color:ui.teal,textAlign:'center',fontSize:10,fontWeight:'800',letterSpacing:1.7},
 title:{color:ui.navy,fontSize:27,fontWeight:'800',textAlign:'center',marginTop:12},text:{color:ui.gray,textAlign:'center',marginTop:8},
 card:{backgroundColor:'#FFFFFF',padding:24,borderRadius:22,marginTop:30,borderColor:ui.border,borderWidth:1},
 cardTitle:{color:ui.navy,fontWeight:'800',fontSize:17},cardText:{color:ui.navy,fontSize:14,lineHeight:24,marginTop:12},muted:{color:ui.gray,fontSize:12,lineHeight:20,marginTop:17},
 button:{backgroundColor:ui.teal,padding:17,borderRadius:15,alignItems:'center',marginTop:22},buttonLabel:{color:'#FFFFFF',fontWeight:'800'},
});

import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AuthField, AuthShell, InlineAlert, PrimaryButton, TextLink, ui } from '@/components/auth/AuthUI';
import { login, normalizePhone } from '@/services/demoAuth';

export default function LoginScreen() {
  const { registered, reset } = useLocalSearchParams<{registered?:string;reset?:string}>();
  const [phone,setPhone] = useState('');
  const [password,setPassword] = useState('');
  const [error,setError] = useState('');
  const signIn=()=>{
    setError('');
    const account=login(normalizePhone(phone),password);
    if(!account) return setError('Invalid demo phone number or password. Please try again.');
    router.replace(account.role === 'customer' ? '/customer/home' : '/fisherman/dashboard');
  };
  const useDemo=()=>{setPhone('0771234567');setPassword('FishMate123');setError('');};
  const useFishermanDemo=()=>{setPhone('0712345678');setPassword('FishMate123');setError('');};
  return <AuthShell eyebrow="Welcome back" title="Log in to FishMate" subtitle="Your marketplace, your fishing community. Let's get you connected." backTo="/welcome">
    {registered==='1'&&<InlineAlert kind="success" message="Account verified successfully! You can now log in."/>}
    {reset==='1'&&<InlineAlert kind="success" message="Password updated successfully. Sign in with your new password."/>}
    <AuthField label="Mobile number" value={phone} onChangeText={setPhone} placeholder="07X XXX XXXX" keyboardType="phone-pad" autoComplete="tel" maxLength={13}/>
    <AuthField label="Password" value={password} onChangeText={setPassword} placeholder="Enter your password" isPassword autoComplete="current-password"/>
    <Pressable onPress={()=>router.push('/forgot-password')} style={styles.forgot} accessibilityRole="link"><Text style={styles.forgotText}>Forgot password?</Text></Pressable>
    {!!error&&<InlineAlert message={error}/>}
    <PrimaryButton title="Log in" onPress={signIn}/>
    <TextLink prefix="New to FishMate?" text="Create an account" onPress={()=>router.push('/role-select')}/>
    <View style={styles.demoBox}>
      <Text style={styles.demoHeading}>FRONTEND DEMO ACCOUNT</Text>
      <Text style={styles.demoCopy}>Customer: 0771234567  •  FishMate123</Text>
      <Text style={styles.demoCopy}>Fisherman: 0712345678  •  FishMate123</Text>
      <View style={styles.demoButtonsRow}>
        <Pressable accessibilityRole="button" onPress={useDemo} style={styles.demoButton}><Text style={styles.demoButtonText}>Fill customer →</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={useFishermanDemo} style={styles.demoButton}><Text style={styles.demoButtonText}>Fill fisherman →</Text></Pressable>
      </View>
    </View>
  </AuthShell>;
}
const styles=StyleSheet.create({
  forgot:{alignSelf:'flex-end',marginTop:-4,marginBottom:22,paddingVertical:5},forgotText:{fontSize:12,color:ui.teal,fontWeight:'800'},
  demoBox:{marginTop:22,padding:15,backgroundColor:'#F1F8F7',borderRadius:15,borderWidth:1,borderColor:'#DFEEEB'},
  demoHeading:{fontSize:9,letterSpacing:1.5,fontWeight:'800',color:ui.teal,marginBottom:8},
  demoCopy:{fontSize:11,color:ui.navy,lineHeight:19},
  demoButtonsRow:{flexDirection:'row',gap:12,marginTop:10},
  demoButton:{paddingVertical:4},
  demoButtonText:{fontSize:12,fontWeight:'800',color:ui.teal},
});

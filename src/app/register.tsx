import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { AuthField, AuthShell, InlineAlert, PrimaryButton, TextLink, ui } from '@/components/auth/AuthUI';
import { beginRegistration, getAccount, normalizePhone, validPhone, type UserRole } from '@/services/demoAuth';

export default function RegisterScreen() {
  const { role: roleParam } = useLocalSearchParams<{ role?:string }>();
  const [role,setRole] = useState<UserRole>(roleParam==='fisherman'?'fisherman':'customer');
  const [fullName,setFullName] = useState('');
  const [phone,setPhone] = useState('');
  const [password,setPassword] = useState('');
  const [confirm,setConfirm] = useState('');
  const [accepted,setAccepted] = useState(false);
  const [error,setError] = useState('');
  const submit=()=>{
    setError('');
    if(fullName.trim().length<2) return setError('Please enter your full name (at least 2 characters).');
    if(!validPhone(phone)) return setError('Enter a Sri Lankan mobile number (e.g. 0771234567).');
    if(getAccount(phone)) return setError('This number already has a demo account. Please log in.');
    if(password.length<8) return setError('Password must be at least 8 characters long.');
    if(password!==confirm) return setError('Passwords do not match.');
    if(!accepted) return setError('Please confirm the demo terms to continue.');
    const mobile=normalizePhone(phone);
    beginRegistration({fullName:fullName.trim(),phone:mobile,role,password});
    router.push({pathname:'/otp-verification',params:{phone:mobile,mode:'register'}});
  };
  return <AuthShell eyebrow="Join the FishMate community" title="Create your account" subtitle="Fresh catches, trusted connections. Start with a few details." backTo="/role-select">
    <Text style={styles.label}>I'M JOINING AS</Text>
    <View style={styles.roles}>
      {(['customer','fisherman'] as const).map(v=><Pressable key={v} accessibilityRole="button" accessibilityState={{selected:role===v}} onPress={()=>setRole(v)} style={[styles.role,role===v&&styles.active]}>
        <Text style={styles.roleIcon}>{v==='customer'?'🛒':'⚓'}</Text>
        <Text style={[styles.roleText,role===v&&{color:ui.teal}]}>{v==='customer'?'Customer':'Fisherman'}</Text>
      </Pressable>)}
    </View>
    <AuthField label="Full name" value={fullName} onChangeText={setFullName} placeholder="Your full name" autoCapitalize="words" autoComplete="name" />
    <AuthField label="Mobile number" value={phone} onChangeText={setPhone} placeholder="07X XXX XXXX" keyboardType="phone-pad" autoComplete="tel" maxLength={13} />
    <AuthField label="Password" value={password} onChangeText={setPassword} placeholder="At least 8 characters" autoComplete="new-password" isPassword />
    <AuthField label="Confirm password" value={confirm} onChangeText={setConfirm} placeholder="Repeat your password" isPassword />
    <Pressable onPress={()=>setAccepted(v=>!v)} style={styles.accept} accessibilityRole="checkbox" accessibilityState={{checked:accepted}}>
      <View style={[styles.checkbox,accepted&&styles.checkboxChecked]}><Text style={{fontSize:12,color:'#FFFFFF',fontWeight:'900'}}>{accepted?'✓':''}</Text></View>
      <Text style={styles.disclaimer}>I understand this is a frontend demo. No real SMS is sent or data stored on a server.</Text>
    </Pressable>
    {!!error&&<InlineAlert message={error}/>}
    <PrimaryButton title="Continue to verification" onPress={submit}/>
    <TextLink prefix="Already have an account?" text="Log in" onPress={()=>router.push('/login')}/>
  </AuthShell>;
}
const styles=StyleSheet.create({
  label:{color:ui.navy,fontSize:10,fontWeight:'800',letterSpacing:1.2,marginBottom:10},
  roles:{flexDirection:'row',gap:10,marginBottom:20},
  role:{flex:1,height:54,borderWidth:1,borderColor:ui.border,borderRadius:15,flexDirection:'row',alignItems:'center',justifyContent:'center',backgroundColor:'#FAFCFC',gap:8},
  active:{borderColor:ui.teal,backgroundColor:'#EBFAF6'},
  roleIcon:{fontSize:18},roleText:{fontSize:13,fontWeight:'800',color:ui.navy},
  accept:{flexDirection:'row',alignItems:'flex-start',gap:9,marginBottom:14},
  checkbox:{width:18,height:18,borderRadius:5,borderWidth:1,borderColor:'#AAC2C4',alignItems:'center',justifyContent:'center',marginTop:1},
  checkboxChecked:{backgroundColor:ui.teal,borderColor:ui.teal},disclaimer:{flex:1,fontSize:11,lineHeight:17,color:ui.gray},
});

import { useState } from 'react';
import { router } from 'expo-router';
import { AuthField, AuthShell, InlineAlert, PrimaryButton, TextLink } from '@/components/auth/AuthUI';
import { beginPasswordRecovery, normalizePhone, validPhone } from '@/services/demoAuth';

export default function ForgotPasswordScreen() {
  const [phone,setPhone]=useState('');
  const [error,setError]=useState('');
  const next=()=>{
    setError('');
    if(!validPhone(phone)) return setError('Enter a valid Sri Lankan mobile number (07XXXXXXXX).');
    if(!beginPasswordRecovery(phone)) return setError('No demo account with this number. Create an account or use a sample login.');
    router.push({pathname:'/otp-verification',params:{mode:'reset',phone:normalizePhone(phone)}});
  };
  return <AuthShell eyebrow="Account recovery" title="Forgot password?" subtitle="Enter the mobile number linked to your FishMate account. We'll guide you through verification." backTo="/login">
    <AuthField label="Registered mobile number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="07X XXX XXXX" autoComplete="tel" maxLength={13}/>
    <InlineAlert kind="info" message="Demo mode: no SMS will be sent. On the next screen, use the displayed test OTP."/>
    {!!error&&<InlineAlert message={error}/>}
    <PrimaryButton title="Continue to verification" onPress={next}/>
    <TextLink text="Back to login" onPress={()=>router.replace('/login')}/>
  </AuthShell>;
}

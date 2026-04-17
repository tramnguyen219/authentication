import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { router } from 'expo-router'
import { supabase } from '../../lib/supabase'

// Zod schema for form validation
const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type SignInForm = z.infer<typeof signInSchema>

export default function SignInScreen() {
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const { control, handleSubmit, formState: { errors } } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
  })

  const onSubmit = async (data: SignInForm) => {
    setLoading(true)
    setAuthError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    setLoading(false)

    if (error) {
      if (error.message.includes('Invalid login')) {
        setAuthError('Incorrect email or password.')
      } else if (error.status === 0) {
        setAuthError('Network error. Please check your connection.')
      } else {
        setAuthError(error.message)
      }
      return
    }

    router.replace('/(app)/home')
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Welcome Back</Text>

      {/* Email */}
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

      {/* Password */}
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, errors.password && styles.inputError]}
            placeholder="Password"
            secureTextEntry
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

      {/* Auth Error */}
      {authError && <Text style={styles.errorText}>{authError}</Text>}

      {/* Submit Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Sign In</Text>
        }
      </TouchableOpacity>

      {/* Link to Sign Up */}
      <TouchableOpacity onPress={() => router.replace('/(auth)/sign-up')}>
        <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    justifyContent: 'center',
    paddingHorizontal: 24, 
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28, 
    fontWeight: 'bold',
    marginBottom: 32, 
    textAlign: 'center',
  },
  input: {
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 8,
    padding: 12, 
    marginBottom: 4,
    fontSize: 16,
  },
  inputError: { 
    borderColor: '#e53e3e' },
  errorText: { 
    color: '#e53e3e', 
    fontSize: 13, 
    marginBottom: 8 },
 button: {
  backgroundColor: 'blue',
  borderRadius: 6,          
  paddingVertical: 16,       
  paddingHorizontal: 32,    
  alignItems: 'center',
  marginTop: 16,
  alignSelf: 'center',
  minWidth: 100,            
},
buttonText: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 13,             
},
  linkText: { 
    color: 'blue', 
    textAlign: 'center', 
    marginTop: 16 },
})
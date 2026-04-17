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

// Zod schema for form validation with required field messages
const signUpSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type SignUpForm = z.infer<typeof signUpSchema>

export default function SignUpScreen() {
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const { control, handleSubmit, formState: { errors } } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    }
  })

  const onSubmit = async (data: SignUpForm) => {
    setLoading(true)
    setAuthError(null)

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    })

    setLoading(false)

    if (error) {
      if (error.message.includes('you already have an account')) {
        setAuthError('Email is already in use.')
      } else if (error.message.includes('weak')) {
        setAuthError('Password is too weak. Use at least 8 characters.')
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
      <Text style={styles.title}>Create Account</Text>

      {/* Email */}
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value, onBlur } }) => (
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={onChange}
            onBlur={onBlur}
            value={value}
          />
        )}
      />
      {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

      {/* Password */}
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value, onBlur } }) => (
          <TextInput
            style={[styles.input, errors.password && styles.inputError]}
            placeholder="Password"
            secureTextEntry
            onChangeText={onChange}
            onBlur={onBlur}
            value={value}
          />
        )}
      />
      {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

      {/* Confirm Password */}
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, value, onBlur } }) => (
          <TextInput
            style={[styles.input, errors.confirmPassword && styles.inputError]}
            placeholder="Confirm Password"
            secureTextEntry
            onChangeText={onChange}
            onBlur={onBlur}
            value={value}
          />
        )}
      />
      {errors.confirmPassword && (
        <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>
      )}

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
          : <Text style={styles.buttonText}>Sign Up</Text>
        }
      </TouchableOpacity>

      {/* Link to Sign In */}
      <TouchableOpacity onPress={() => router.replace('/(auth)/sign-in')}>
        <Text style={styles.linkText}>Already have an account? Sign In</Text>
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
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { supabase } from '../../lib/supabase'

export default function HomeScreen() {
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.replace('/(auth)/sign-in')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Home!</Text>
      <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  signOutButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
  },
  signOutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
})
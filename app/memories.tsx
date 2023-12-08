import { View, TouchableOpacity, ScrollView } from 'react-native'
import { Link, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import NLWLogo from '../assets/nlw-spacetime-logo.svg'
import Icon from '@expo/vector-icons/Feather'
import * as SecureStore from 'expo-secure-store'

export default function NewMemory() {
  const { bottom, top } = useSafeAreaInsets()
  const router = useRouter()

  async function signOut() {
    await SecureStore.deleteItemAsync('token')

    router.push('/')
  }

  return (
    <ScrollView
      className="flex-1 px-8"
      contentContainerStyle={{ paddingBottom: bottom, paddingTop: top }}
    >
      <View className="mt-7 flex-row items-center justify-between">
        <NLWLogo />

        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={signOut}
            className="h-10 w-10 items-center justify-center rounded-full bg-red-500"
          >
            <Icon name="log-out" size={16} color="#000" />
          </TouchableOpacity>

          <Link href="/new" asChild>
            <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-green-500">
              <Icon name="plus" size={16} color="#000" />
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </ScrollView>
  )
}

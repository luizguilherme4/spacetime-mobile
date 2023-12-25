import { ScrollView, View, TouchableOpacity, Text, Image } from 'react-native'
import { Link, useSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useEffect, useState } from 'react'
import { api } from '../src/lib/api'
import * as SecureStore from 'expo-secure-store'
import dayjs from 'dayjs'
import ptBr from 'dayjs/locale/pt-br'
import NLWLogo from '../assets/nlw-spacetime-logo.svg'
import Icon from '@expo/vector-icons/Feather'

dayjs.locale(ptBr)

interface UniqueMemory {
  content: string
  coverUrl: string
  createAt: string
  id: string
  isPublic: boolean
  userId: string
}

export default function Details() {
  const { bottom, top } = useSafeAreaInsets()
  const { id } = useSearchParams()
  const [memory, setMemory] = useState<UniqueMemory>()

  async function loadMemory() {
    const token = await SecureStore.getItemAsync('token')

    await api
      .get(`/memories/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => setMemory(response.data))
      .catch((error) => console.log(error))
  }

  useEffect(() => {
    loadMemory()
  }, [])

  return (
    <ScrollView
      className="flex-1 px-8"
      contentContainerStyle={{ paddingBottom: bottom, paddingTop: top }}
    >
      <View className="mt-4 flex-row items-center justify-between">
        <NLWLogo />

        <View className="flex-row gap-2">
          <Link href="/memories" asChild>
            <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-purple-500">
              <Icon name="arrow-left" size={16} color="#FFF" />
            </TouchableOpacity>
          </Link>

          <Link href="/new" asChild>
            <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-green-500">
              <Icon name="plus" size={16} color="#000" />
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      <View className="mt-6 space-y-10">
        <View className="space-y-4">
          <View className="flex-row items-center gap-2">
            <View className="h-px w-5 bg-gray-50" />
            <Text className="font-body text-xs text-gray-100">
              {dayjs(memory?.createAt).format('D[ de ]MMMM[, ]YYYY')}
            </Text>
          </View>
          <View className="space-y-4">
            {memory?.coverUrl && (
              <Image
                source={{
                  uri: memory?.coverUrl,
                }}
                className="aspect-square w-full rounded-lg"
                alt=""
              />
            )}
            <Text className="font-body text-base leading-relaxed text-gray-100">
              {memory?.content}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

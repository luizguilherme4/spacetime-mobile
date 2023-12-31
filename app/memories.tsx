import { View, TouchableOpacity, ScrollView, Image, Text } from 'react-native'
import { Link, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import NLWLogo from '../assets/nlw-spacetime-logo.svg'
import Icon from '@expo/vector-icons/Feather'
import * as SecureStore from 'expo-secure-store'
import { api } from '../src/lib/api'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import ptBr from 'dayjs/locale/pt-br'

dayjs.locale(ptBr)

interface Memory {
  coverUrl: string
  excerpt: string
  id: string
  createAt: string
}

export default function NewMemory() {
  const { bottom, top } = useSafeAreaInsets()
  const router = useRouter()
  const [memories, setMemories] = useState<Memory[]>([])

  async function signOut() {
    await SecureStore.deleteItemAsync('token')

    router.push('/')
  }

  async function loadMemories() {
    const token = await SecureStore.getItemAsync('token')

    const response = await api.get('/memories', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    setMemories(response.data)
  }

  async function deleteMemory(id: string) {
    const token = await SecureStore.getItemAsync('token')

    await api
      .delete(`/memories/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        router.push('/memories')
        router.replace('/memories')
      })
      .catch((error) => console.log(error))
  }

  useEffect(() => {
    loadMemories()
  }, [])

  return (
    <ScrollView
      className="flex-1 px-8"
      contentContainerStyle={{ paddingBottom: bottom, paddingTop: top }}
    >
      <View className="mt-4 flex-row items-center justify-between">
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

      <View className="mt-6 space-y-10">
        {memories.map((memory) => {
          return (
            <View className="space-y-4" key={memory.id}>
              <View className="flex-row items-center gap-2">
                <View className="h-px w-5 bg-gray-50" />
                <Text className="font-body text-xs text-gray-100">
                  {dayjs(memory.createAt).format('D[ de ]MMMM[, ]YYYY')}
                </Text>
              </View>
              <View className="space-y-4">
                {memory.coverUrl && (
                  <Image
                    source={{
                      uri: memory.coverUrl,
                    }}
                    className="aspect-video w-full rounded-lg"
                    alt=""
                  />
                )}
                <Text className="font-body text-base leading-relaxed text-gray-100">
                  {memory.excerpt}
                </Text>

                <View className="flex-row justify-between">
                  <Link
                    href={{ pathname: '/details', params: { id: memory.id } }}
                    asChild
                  >
                    <TouchableOpacity className="flex-row items-center gap-2">
                      <Text className="font-body text-sm text-gray-200">
                        Ler mais
                      </Text>
                      <Icon name="arrow-right" size={16} color="#9e9ea0" />
                    </TouchableOpacity>
                  </Link>

                  <Link
                    href={{ pathname: '/edit', params: { id: memory.id } }}
                    asChild
                  >
                    <TouchableOpacity className="flex-row items-center gap-2">
                      <Text className="font-body text-sm text-gray-200">
                        Editar
                      </Text>
                      <Icon name="edit" size={16} color="#9e9ea0" />
                    </TouchableOpacity>
                  </Link>

                  <TouchableOpacity
                    className="flex-row items-center gap-2"
                    onPress={() => deleteMemory(memory.id)}
                  >
                    <Text className="font-body text-sm text-gray-200">
                      Excluir
                    </Text>
                    <Icon name="trash" size={16} color="#9e9ea0" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )
        })}
      </View>
    </ScrollView>
  )
}

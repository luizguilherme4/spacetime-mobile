/* eslint-disable react-hooks/exhaustive-deps */
import {
  ScrollView,
  View,
  TouchableOpacity,
  Text,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Switch,
} from 'react-native'
import { Link, useRouter, useSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useEffect, useState } from 'react'
import { api } from '../src/lib/api'
import * as ImagePicker from 'expo-image-picker'
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

export default function Edit() {
  const router = useRouter()
  const { bottom, top } = useSafeAreaInsets()
  const { id } = useSearchParams()
  const [memory, setMemory] = useState<UniqueMemory>()
  const [content, setContent] = useState<string>('')
  const [preview, setPreview] = useState<string | null>(null)
  const [isPublic, setIsPublic] = useState<boolean>(false)

  async function loadMemory() {
    const token = await SecureStore.getItemAsync('token')

    await api
      .get(`/memories/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setMemory(response.data)
        setContent(response.data?.content)
        setPreview(response.data?.coverUrl)
        setIsPublic(response.data?.isPublic)
      })
      .catch((error) => console.log(error))
  }

  async function openImagePicker() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      })

      if (result.assets[0]) {
        setPreview(result.assets[0].uri)
      }
    } catch (err) {
      console.error(err)
    }
  }

  async function handleEditMemory() {
    const token = await SecureStore.getItemAsync('token')

    const fileToUpload = memory?.coverUrl

    let newCoverUrl = ''

    if (fileToUpload !== preview) {
      const uploadFormData = new FormData()

      uploadFormData.append('file', {
        uri: preview,
        name: 'image.jpg',
        type: 'image/jpeg',
      } as any)

      const uploadResponse = await api.post('/upload', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      newCoverUrl = uploadResponse.data.fileUrl
    } else {
      newCoverUrl = fileToUpload
    }

    await api.put(
      `/memories/${id}`,
      {
        content,
        isPublic,
        coverUrl: newCoverUrl,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    router.push('/memories')
    router.replace('/memories')
  }

  useEffect(() => {
    loadMemory()
  }, [])

  return (
    <ScrollView
      className="flex-1 px-8"
      contentContainerStyle={{ paddingBottom: bottom, paddingTop: top }}
    >
      <KeyboardAvoidingView behavior="position">
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

            <View className="flex-row items-center gap-2">
              <Switch
                value={isPublic}
                onValueChange={setIsPublic}
                trackColor={{ false: '#767577', true: '#372560' }}
                thumbColor={isPublic ? '#9b79ea' : '#9e9ea0'}
              />
              <Text className="font-body text-base text-gray-200">
                Tornar memória pública
              </Text>
            </View>

            <TouchableOpacity
              className="flex-row items-center gap-2"
              onPress={openImagePicker}
            >
              <Text className="font-body text-sm text-gray-200">
                Altera mídia
              </Text>
              <Icon name="camera" size={16} color="#9e9ea0" />
            </TouchableOpacity>

            <View className="space-y-4">
              <TouchableOpacity onPress={openImagePicker} activeOpacity={0.7}>
                {preview ? (
                  <Image
                    alt="preview"
                    source={{ uri: preview }}
                    className="aspect-square w-full rounded-lg"
                  />
                ) : (
                  <View className="flex-row items-center gap-2">
                    <Icon name="image" color="#FFF" />
                    <Text className="font-body text-sm text-gray-200">
                      Adicionar foto ou vídeo de capa
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              <TextInput
                multiline
                value={content}
                onChangeText={setContent}
                textAlignVertical="top"
                className="p-0 font-body text-lg text-gray-200"
                placeholderTextColor="#56565a"
                placeholder="Fique livre para adicionar fotos, vídeos e relatos sobre essa experiência que você quer lembrar para sempre."
              />
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            className="mb-4 items-center self-end rounded-full bg-green-500 px-5 py-2"
            onPress={handleEditMemory}
          >
            <Text className="font-alt text-sm uppercase text-black">
              Salvar
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScrollView>
  )
}

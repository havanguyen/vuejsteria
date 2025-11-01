import { privateApi } from '@/config/axios'

export const getMyProfile = async () => {
  try {
    const response = await privateApi.get('/profiles/my-profile')
    return response.data.result
  } catch (error) {
    throw error.response?.data || error
  }
}

// The 'updateAvatar' function has been removed
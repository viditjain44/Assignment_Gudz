const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

interface ApiOptions {
  method?: string
  body?: unknown
}

async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { method = 'GET', body } = options

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  }

  if (body) {
    config.body = JSON.stringify(body)
  }

  // 🔥 Route auth separately
  const isAuthRoute = endpoint.startsWith('/auth')

  const url = isAuthRoute
    ? `${API_URL}${endpoint}`       // → /auth/*
    : `${API_URL}/api${endpoint}`   // → /api/*

  const response = await fetch(url, config)

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: 'An error occurred' }))

    throw new Error(error.message || 'An error occurred')
  }

  return response.json()
}

/* =======================
   TYPES
======================= */

export interface Technician {
  _id: string
  name: string
  skill: string
  rating: number
  email: string
  availability: string[]
  bio?: string
  hourlyRate?: number
  createdAt: string
  updatedAt: string
}

export interface Booking {
  _id: string
  userId: string
  technician: Technician
  slot: string
  status: 'confirmed' | 'cancelled' | 'completed'
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  name: string
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

/* =======================
   TECHNICIAN API
======================= */

export const technicianApi = {
  getAll: (params?: { skill?: string; rating?: number; search?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.skill && params.skill !== 'all')
      searchParams.append('skill', params.skill)
    if (params?.rating)
      searchParams.append('rating', params.rating.toString())
    if (params?.search)
      searchParams.append('search', params.search)

    const query = searchParams.toString()

    return apiRequest<Technician[]>(
      `/technicians${query ? `?${query}` : ''}`
    )
  },

  getById: (id: string) =>
    apiRequest<Technician>(`/technicians/${id}`),

  create: (data: Omit<Technician, '_id' | 'createdAt' | 'updatedAt'>) =>
    apiRequest<Technician>('/technicians', {
      method: 'POST',
      body: data,
    }),

  register: (data: {
    name: string
    email: string
    phone?: string
    skill: string
    bio?: string
    hourlyRate?: number
  }) =>
    apiRequest<Technician>('/technicians', {
      method: 'POST',
      body: data,
    }),
}

/* =======================
   BOOKING API
======================= */

export const bookingApi = {
  getUserBookings: (status?: string) => {
    const query =
      status && status !== 'all' ? `?status=${status}` : ''

    return apiRequest<Booking[]>(`/bookings/user${query}`)
  },

  getUpcoming: () =>
    apiRequest<Booking[]>('/bookings/upcoming'),

  create: (data: {
    technicianId: string
    slot: string
    notes?: string
  }) =>
    apiRequest<Booking>('/bookings', {
      method: 'POST',
      body: data,
    }),

  cancel: (id: string) =>
    apiRequest<Booking>(`/bookings/${id}`, {
      method: 'DELETE',
    }),

  reschedule: (id: string, newSlot: string) =>
    apiRequest<Booking>(`/bookings/${id}/reschedule`, {
      method: 'PUT',
      body: { newSlot },
    }),
}

/* =======================
   USER API
======================= */

export const userApi = {
  getProfile: () =>
    apiRequest<User>('/users/profile'),

  updateProfile: (data: { name: string }) =>
    apiRequest<{ message: string; user: User }>(
      '/users/profile',
      {
        method: 'PUT',
        body: data,
      }
    ),
}

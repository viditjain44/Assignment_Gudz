import React, { createContext, useContext, useEffect, useState } from 'react'
import { useSession, signIn, signUp, signOut } from './auth-client'

interface User {
  id: string
  email: string
  name: string
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
}

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  user: User | null
  login: (email: string, password: string) => Promise<{ error?: string }>
  register: (email: string, password: string, name: string) => Promise<{ error?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isPending) {
      setIsLoading(false)
    }
  }, [isPending])

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      const result = await signIn.email({
        email,
        password,
      })
      
      if (result.error) {
        return { error: result.error.message || 'Login failed' }
      }
      
      return {}
    } catch (error) {
      console.error('Login error:', error)
      return { error: 'An unexpected error occurred' }
    }
  }

  const register = async (email: string, password: string, name: string): Promise<{ error?: string }> => {
    try {
      const result = await signUp.email({
        email,
        password,
        name,
      })
      
      if (result.error) {
        return { error: result.error.message || 'Registration failed' }
      }
      
      return {}
    } catch (error) {
      console.error('Register error:', error)
      return { error: 'An unexpected error occurred' }
    }
  }

  const logout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const value: AuthState = {
    isAuthenticated: !!session?.user,
    isLoading,
    user: session?.user ? {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      emailVerified: session.user.emailVerified,
      createdAt: new Date(session.user.createdAt),
      updatedAt: new Date(session.user.updatedAt),
    } : null,
    login,
    register,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export type { AuthState, User }

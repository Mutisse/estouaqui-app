import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'
import { LocalStorage } from 'quasar'

interface User {
  id?: string
  nome?: string
  telefone?: string
  tipo?: 'cliente' | 'prestador' | 'admin'
}

interface AuthData {
  user: User
  token: string
}

interface StorageData {
  user: User
  token: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
    isAuthenticated: false
  }),

  getters: {
    isCliente: (state) => state.user?.tipo === 'cliente',
    isPrestador: (state) => state.user?.tipo === 'prestador',
    isAdmin: (state) => state.user?.tipo === 'admin'
  },

  actions: {
    async login(telefone: string, password: string) {
      try {
        const response = await api.post<AuthData>('/auth/login', {
          telefone,
          password
        })

        this.user = response.data.user
        this.token = response.data.token
        this.isAuthenticated = true

        LocalStorage.set('auth', {
          user: this.user,
          token: this.token
        })

        api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`

        return true
      } catch (error) {
        console.error('Erro no login:', error)
        throw error
      }
    },

    async register(userData: Record<string, unknown>) {
      try {
        await api.post('/auth/register', userData)
        return true
      } catch (error) {
        console.error('Erro no registo:', error)
        throw error
      }
    },

    checkAuth() {
      const auth = LocalStorage.getItem<StorageData>('auth')
      if (auth && typeof auth === 'object' && 'user' in auth && 'token' in auth) {
        this.user = auth.user
        this.token = auth.token
        this.isAuthenticated = true
        api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
      }
    },

    logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      LocalStorage.remove('auth')
      delete api.defaults.headers.common['Authorization']
    }
  }
})

interface User {
  id: number
  nome: string
  email: string
  role: "ADMIN" | "USER"
}

interface AuthResponse {
  token: string
  user: User
}

const API_BASE_URL = "https://api-brigadeiros.onrender.com"

export class AuthService {
  private static TOKEN_KEY = "brigadeiro_token"
  private static USER_KEY = "brigadeiro_user"

  static async login(email: string, senha: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, senha }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Erro ao fazer login")
    }

    const data: AuthResponse = await response.json()

    // Store token and user info
    localStorage.setItem(this.TOKEN_KEY, data.token)
    localStorage.setItem(this.USER_KEY, JSON.stringify(data.user))

    return data
  }

  static logout(): void {
    localStorage.removeItem(this.TOKEN_KEY)
    localStorage.removeItem(this.USER_KEY)
  }

  static getToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(this.TOKEN_KEY)
  }

  static getUser(): User | null {
    if (typeof window === "undefined") return null
    const userStr = localStorage.getItem(this.USER_KEY)
    return userStr ? JSON.parse(userStr) : null
  }

  static isAuthenticated(): boolean {
    return !!this.getToken()
  }

  static isAdmin(): boolean {
    const user = this.getUser()
    return user?.role === "ADMIN"
  }

  static getAuthHeaders(): Record<string, string> {
    const token = this.getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }
}

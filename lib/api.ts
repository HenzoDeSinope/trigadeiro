import { AuthService } from "./auth"

const API_BASE_URL = "https://api-brigadeiros.onrender.com"

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const headers = {
    "Content-Type": "application/json",
    ...AuthService.getAuthHeaders(),
    ...options.headers,
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Erro desconhecido" }))
      throw new ApiError(error.error || `HTTP ${response.status}`, response.status)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError("Erro de conexão com o servidor", 0)
  }
}

// Types
export interface Item {
  id: number
  nome: string
  preco: number
  custo: number
}

export interface Vendedor {
  id: number
  nome: string
  vendasCount: number
  metMeta: boolean
}

export interface Venda {
  id: number
  vendedorId: number
  itemId: number
  compradorNome: string
  quantidade: number
  valorPago: number
  horario: string
  item: Item
  vendedor: Vendedor
}

export interface VendaSummary {
  totalReceita: number
  totalLucro: number
  totalVendas: number
}

export interface VendaFilters {
  vendedorId?: number
  itemId?: number
  startDate?: string
  endDate?: string
  dia?: string
  sort?: "asc" | "desc"
}

// API functions
export const api = {
  // Items
  getItems: () => apiRequest<Item[]>("/api/itens"),
  createItem: (data: Omit<Item, "id">) =>
    apiRequest<Item>("/api/itens", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteItem: (id: number) =>
    apiRequest<{ message: string }>(`/api/itens/${id}`, {
      method: "DELETE",
    }),

  // Vendedores
  getVendedores: () => apiRequest<Vendedor[]>("/api/vendedores"),
  createVendedor: (data: { nome: string }) =>
    apiRequest<Vendedor>("/api/vendedores", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteVendedor: (id: number) =>
    apiRequest<{ message: string }>(`/api/vendedores/${id}`, {
      method: "DELETE",
    }),

  // Vendas
  getVendas: (filters?: VendaFilters) => {
    const params = new URLSearchParams()
    if (filters?.vendedorId) params.append("vendedorId", filters.vendedorId.toString())
    if (filters?.itemId) params.append("itemId", filters.itemId.toString())
    if (filters?.startDate) params.append("startDate", filters.startDate)
    if (filters?.endDate) params.append("endDate", filters.endDate)
    if (filters?.dia) params.append("dia", filters.dia)
    if (filters?.sort) params.append("sort", filters.sort)

    const queryString = params.toString()
    return apiRequest<Venda[]>(`/api/vendas${queryString ? `?${queryString}` : ""}`)
  },

  createVenda: (data: {
    vendedorId: number
    itemId: number
    compradorNome: string
    quantidade: number
    valorPago: number
    horario?: string
  }) =>
    apiRequest<{ venda: Venda; vendedor: Vendedor }>("/api/vendas", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  deleteVenda: (id: number) =>
    apiRequest<{ message: string }>(`/api/vendas/${id}`, {
      method: "DELETE",
    }),

  getVendasSummary: (filters?: VendaFilters) => {
    const params = new URLSearchParams()
    if (filters?.vendedorId) params.append("vendedorId", filters.vendedorId.toString())
    if (filters?.itemId) params.append("itemId", filters.itemId.toString())
    if (filters?.startDate) params.append("startDate", filters.startDate)
    if (filters?.endDate) params.append("endDate", filters.endDate)
    if (filters?.dia) params.append("dia", filters.dia)

    const queryString = params.toString()
    return apiRequest<VendaSummary>(`/api/vendas/summary${queryString ? `?${queryString}` : ""}`)
  },
}

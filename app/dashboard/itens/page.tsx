"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ItemsTable } from "@/components/items-table"
import { CreateItemForm } from "@/components/create-item-form"
import { MetricCard } from "@/components/metric-card"
import { api, type Item } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { AuthService } from "@/lib/auth"
import { Loader2, Package, DollarSign, TrendingUp } from "lucide-react"

export default function ItensPage() {
  const [items, setItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const isAdmin = AuthService.isAdmin()

  const fetchItems = async () => {
    try {
      setIsLoading(true)
      const data = await api.getItems()
      setItems(data)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar itens",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const precoMedio = items.length > 0 ? items.reduce((acc, item) => acc + item.preco, 0) / items.length : 0
  const margemMedia =
    items.length > 0
      ? items.reduce((acc, item) => acc + ((item.preco - item.custo) / item.preco) * 100, 0) / items.length
      : 0

  if (isLoading) {
    return (
      <AuthGuard>
        <DashboardLayout currentPage="Itens">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <DashboardLayout currentPage="Itens">
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              title="Total de Itens"
              value={items.length}
              description="Produtos cadastrados"
              icon={<Package className="h-4 w-4" />}
            />
            <MetricCard
              title="Preço Médio"
              value={new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(precoMedio)}
              description="Preço médio dos produtos"
              icon={<DollarSign className="h-4 w-4" />}
            />
            <MetricCard
              title="Margem Média"
              value={`${margemMedia.toFixed(1)}%`}
              description="Margem de lucro média"
              icon={<TrendingUp className="h-4 w-4" />}
            />
          </div>

          {/* Actions */}
          {isAdmin && (
            <div className="flex items-center justify-between">
              <CreateItemForm onItemCreated={fetchItems} />
            </div>
          )}

          {/* Items Table */}
          <ItemsTable items={items} onItemDeleted={fetchItems} />

          {!isAdmin && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Apenas administradores podem gerenciar itens.</p>
            </div>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}

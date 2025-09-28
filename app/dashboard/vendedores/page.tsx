"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { VendedoresTable } from "@/components/vendedores-table"
import { CreateVendedorForm } from "@/components/create-vendedor-form"
import { MetricCard } from "@/components/metric-card"
import { api, type Vendedor } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { AuthService } from "@/lib/auth"
import { Loader2, Users, Trophy, Target } from "lucide-react"

export default function VendedoresPage() {
  const [vendedores, setVendedores] = useState<Vendedor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const isAdmin = AuthService.isAdmin()

  const fetchVendedores = async () => {
    try {
      setIsLoading(true)
      const data = await api.getVendedores()
      setVendedores(data)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar vendedores",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVendedores()
  }, [])

  const vendedoresComMeta = vendedores.filter((v) => v.metMeta).length
  const totalVendas = vendedores.reduce((acc, v) => acc + v.vendasCount, 0)
  const mediaVendasPorVendedor = vendedores.length > 0 ? totalVendas / vendedores.length : 0

  if (isLoading) {
    return (
      <AuthGuard>
        <DashboardLayout currentPage="Vendedores">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <DashboardLayout currentPage="Vendedores">
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              title="Total de Vendedores"
              value={vendedores.length}
              description="Vendedores cadastrados"
              icon={<Users className="h-4 w-4" />}
            />
            <MetricCard
              title="Vendedores na Meta"
              value={`${vendedoresComMeta}/${vendedores.length}`}
              description="25+ vendas realizadas"
              icon={<Trophy className="h-4 w-4" />}
            />
            <MetricCard
              title="Média de Vendas"
              value={mediaVendasPorVendedor.toFixed(1)}
              description="Vendas por vendedor"
              icon={<Target className="h-4 w-4" />}
            />
          </div>

          {/* Actions */}
          {isAdmin && (
            <div className="flex items-center justify-between">
              <CreateVendedorForm onVendedorCreated={fetchVendedores} />
            </div>
          )}

          {/* Vendedores Table */}
          <VendedoresTable vendedores={vendedores} onVendedorDeleted={fetchVendedores} />

          {!isAdmin && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Apenas administradores podem gerenciar vendedores.</p>
            </div>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}

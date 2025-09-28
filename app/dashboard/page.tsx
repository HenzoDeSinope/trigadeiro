"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { MetricCard } from "@/components/metric-card"
import { SalesChart } from "@/components/sales-chart"
import { TopPerformers } from "@/components/top-performers"
import { api, type VendaSummary, type Vendedor, type Item, type Venda } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Loader2, DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react"

export default function DashboardPage() {
  const [summary, setSummary] = useState<VendaSummary | null>(null)
  const [vendedores, setVendedores] = useState<Vendedor[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [vendas, setVendas] = useState<Venda[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [summaryData, vendedoresData, itemsData, vendasData] = await Promise.all([
          api.getVendasSummary(),
          api.getVendedores(),
          api.getItems(),
          api.getVendas({ sort: "desc" }),
        ])

        setSummary(summaryData)
        setVendedores(vendedoresData)
        setItems(itemsData)
        setVendas(vendasData)
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao carregar dados do dashboard",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

  // Process sales data for chart
  const chartData = (() => {
    if (!vendas.length) return []

    const salesByDate = vendas.reduce(
      (acc, venda) => {
        const date = new Date(venda.horario).toISOString().split("T")[0]
        if (!acc[date]) {
          acc[date] = { vendas: 0, receita: 0 }
        }
        acc[date].vendas += 1
        acc[date].receita += venda.valorPago
        return acc
      },
      {} as Record<string, { vendas: number; receita: number }>,
    )

    return Object.entries(salesByDate)
      .map(([date, data]) => ({
        date,
        ...data,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7) // Last 7 days
  })()

  const vendedoresComMeta = vendedores.filter((v) => v.metMeta).length

  if (isLoading) {
    return (
      <AuthGuard>
        <DashboardLayout currentPage="Overview">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <DashboardLayout currentPage="Overview">
        <div className="space-y-6">
          {/* Metrics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total de Vendas"
              value={summary?.totalVendas || 0}
              description="Vendas realizadas"
              icon={<ShoppingCart className="h-4 w-4" />}
            />
            <MetricCard
              title="Receita Total"
              value={
                summary?.totalReceita
                  ? new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(summary.totalReceita)
                  : "R$ 0,00"
              }
              description="Valor total arrecadado"
              icon={<DollarSign className="h-4 w-4" />}
            />
            <MetricCard
              title="Lucro Total"
              value={
                summary?.totalLucro
                  ? new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(summary.totalLucro)
                  : "R$ 0,00"
              }
              description="Lucro líquido"
              icon={<TrendingUp className="h-4 w-4" />}
            />
            <MetricCard
              title="Vendedores na Meta"
              value={`${vendedoresComMeta}/${vendedores.length}`}
              description="25+ vendas realizadas"
              icon={<Users className="h-4 w-4" />}
            />
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <SalesChart data={chartData} type="line" />
            <SalesChart data={chartData} type="bar" />
          </div>

          {/* Top Performers */}
          <TopPerformers vendedores={vendedores} items={items} />
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}

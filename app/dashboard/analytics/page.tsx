"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AnalyticsCharts } from "@/components/analytics-charts"
import { AnalyticsInsights } from "@/components/analytics-insights"
import { SalesFilters } from "@/components/sales-filters"
import { MetricCard } from "@/components/metric-card"
import { api, type Venda, type Vendedor, type Item, type VendaFilters, type VendaSummary } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Loader2, BarChart3, TrendingUp, Users, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AnalyticsPage() {
  const [vendas, setVendas] = useState<Venda[]>([])
  const [vendedores, setVendedores] = useState<Vendedor[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [summary, setSummary] = useState<VendaSummary | null>(null)
  const [filters, setFilters] = useState<VendaFilters>({})
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"charts" | "insights">("charts")
  const { toast } = useToast()

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [vendasData, vendedoresData, itemsData, summaryData] = await Promise.all([
        api.getVendas(filters),
        api.getVendedores(),
        api.getItems(),
        api.getVendasSummary(filters),
      ])
      setVendas(vendasData)
      setVendedores(vendedoresData)
      setItems(itemsData)
      setSummary(summaryData)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar dados de analytics",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [filters])

  const handleFiltersChange = (newFilters: VendaFilters) => {
    setFilters(newFilters)
  }

  const generateReport = () => {
    if (vendas.length === 0) {
      toast({
        title: "Aviso",
        description: "Não há dados para gerar relatório",
        variant: "destructive",
      })
      return
    }

    // Generate comprehensive report
    const reportData = {
      periodo: filters.startDate && filters.endDate ? `${filters.startDate} a ${filters.endDate}` : "Todos os períodos",
      resumo: summary,
      vendedores: vendedores.length,
      vendedoresComMeta: vendedores.filter((v) => v.metMeta).length,
      items: items.length,
      ticketMedio: summary ? summary.totalReceita / summary.totalVendas : 0,
      margemLucro: summary && summary.totalReceita > 0 ? (summary.totalLucro / summary.totalReceita) * 100 : 0,
    }

    const reportText = `
RELATÓRIO DE VENDAS - BRIGADEIRO DASHBOARD
=========================================

Período: ${reportData.periodo}
Data de geração: ${new Date().toLocaleString("pt-BR")}

RESUMO EXECUTIVO
----------------
• Total de vendas: ${summary?.totalVendas || 0}
• Receita total: ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(summary?.totalReceita || 0)}
• Lucro total: ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(summary?.totalLucro || 0)}
• Ticket médio: ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(reportData.ticketMedio)}
• Margem de lucro: ${reportData.margemLucro.toFixed(1)}%

VENDEDORES
----------
• Total de vendedores: ${reportData.vendedores}
• Vendedores que atingiram a meta: ${reportData.vendedoresComMeta}
• Taxa de sucesso na meta: ${reportData.vendedores > 0 ? ((reportData.vendedoresComMeta / reportData.vendedores) * 100).toFixed(1) : 0}%

PRODUTOS
--------
• Total de itens cadastrados: ${reportData.items}

TOP 5 VENDEDORES
----------------
${vendedores
  .sort((a, b) => b.vendasCount - a.vendasCount)
  .slice(0, 5)
  .map((v, i) => `${i + 1}. ${v.nome} - ${v.vendasCount} vendas ${v.metMeta ? "(Meta atingida)" : ""}`)
  .join("\n")}

TOP 5 ITENS POR RECEITA
-----------------------
${items
  .map((item) => {
    const itemSales = vendas.filter((v) => v.itemId === item.id)
    const receita = itemSales.reduce((acc, v) => acc + v.valorPago, 0)
    return { ...item, receita }
  })
  .sort((a, b) => b.receita - a.receita)
  .slice(0, 5)
  .map(
    (item, i) =>
      `${i + 1}. ${item.nome} - ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.receita)}`,
  )
  .join("\n")}

Relatório gerado automaticamente pelo Brigadeiro Dashboard
    `.trim()

    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `relatorio_vendas_${new Date().toISOString().split("T")[0]}.txt`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Sucesso",
      description: "Relatório gerado com sucesso!",
    })
  }

  if (isLoading) {
    return (
      <AuthGuard>
        <DashboardLayout currentPage="Analytics">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <DashboardLayout currentPage="Analytics">
        <div className="space-y-6">
          {/* Summary Cards */}
          {summary && (
            <div className="grid gap-4 md:grid-cols-4">
              <MetricCard
                title="Total de Vendas"
                value={summary.totalVendas}
                description="No período filtrado"
                icon={<BarChart3 className="h-4 w-4" />}
              />
              <MetricCard
                title="Receita Total"
                value={new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(summary.totalReceita)}
                description="Valor arrecadado"
                icon={<TrendingUp className="h-4 w-4" />}
              />
              <MetricCard
                title="Vendedores Ativos"
                value={vendedores.length}
                description={`${vendedores.filter((v) => v.metMeta).length} na meta`}
                icon={<Users className="h-4 w-4" />}
              />
              <MetricCard
                title="Produtos"
                value={items.length}
                description="Itens cadastrados"
                icon={<Package className="h-4 w-4" />}
              />
            </div>
          )}

          {/* Filters */}
          <SalesFilters onFiltersChange={handleFiltersChange} currentFilters={filters} />

          {/* Tab Navigation */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Análise Detalhada</CardTitle>
                  <CardDescription>Gráficos e insights sobre as vendas</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={activeTab === "charts" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab("charts")}
                  >
                    Gráficos
                  </Button>
                  <Button
                    variant={activeTab === "insights" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab("insights")}
                  >
                    Insights
                  </Button>
                  <Button variant="outline" size="sm" onClick={generateReport}>
                    Gerar Relatório
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {activeTab === "charts" ? (
                <AnalyticsCharts vendas={vendas} vendedores={vendedores} items={items} />
              ) : (
                <AnalyticsInsights vendas={vendas} vendedores={vendedores} items={items} />
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}

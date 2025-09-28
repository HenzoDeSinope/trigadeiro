"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { SalesTable } from "@/components/sales-table"
import { SalesFilters } from "@/components/sales-filters"
import { CreateSaleForm } from "@/components/create-sale-form"
import { MetricCard } from "@/components/metric-card"
import { api, type Venda, type VendaFilters, type VendaSummary } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Download, ShoppingCart, DollarSign, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function VendasPage() {
  const [vendas, setVendas] = useState<Venda[]>([])
  const [summary, setSummary] = useState<VendaSummary | null>(null)
  const [filters, setFilters] = useState<VendaFilters>({})
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [vendasData, summaryData] = await Promise.all([api.getVendas(filters), api.getVendasSummary(filters)])
      setVendas(vendasData)
      setSummary(summaryData)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar vendas",
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

  const handleExportCSV = () => {
    if (vendas.length === 0) {
      toast({
        title: "Aviso",
        description: "Não há dados para exportar",
        variant: "destructive",
      })
      return
    }

    const csvHeaders = ["ID", "Vendedor", "Item", "Comprador", "Quantidade", "Valor Pago", "Lucro", "Data/Hora"]

    const csvData = vendas.map((venda) => {
      const profit = (venda.item.preco - venda.item.custo) * venda.quantidade
      return [
        venda.id,
        venda.vendedor.nome,
        venda.item.nome,
        venda.compradorNome,
        venda.quantidade,
        venda.valorPago.toFixed(2),
        profit.toFixed(2),
        new Date(venda.horario).toLocaleString("pt-BR"),
      ]
    })

    const csvContent = [csvHeaders, ...csvData].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `vendas_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Sucesso",
      description: "Dados exportados com sucesso!",
    })
  }

  if (isLoading) {
    return (
      <AuthGuard>
        <DashboardLayout currentPage="Vendas">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <DashboardLayout currentPage="Vendas">
        <div className="space-y-6">
          {/* Summary Cards */}
          {summary && (
            <div className="grid gap-4 md:grid-cols-3">
              <MetricCard
                title="Total de Vendas"
                value={summary.totalVendas}
                description="Vendas no período filtrado"
                icon={<ShoppingCart className="h-4 w-4" />}
              />
              <MetricCard
                title="Receita Total"
                value={new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(summary.totalReceita)}
                description="Valor total arrecadado"
                icon={<DollarSign className="h-4 w-4" />}
              />
              <MetricCard
                title="Lucro Total"
                value={new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(summary.totalLucro)}
                description="Lucro líquido"
                icon={<TrendingUp className="h-4 w-4" />}
              />
            </div>
          )}

          {/* Filters */}
          <SalesFilters onFiltersChange={handleFiltersChange} currentFilters={filters} />

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CreateSaleForm onSaleCreated={fetchData} />
            </div>
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>

          {/* Sales Table */}
          <SalesTable vendas={vendas} onVendaDeleted={fetchData} />
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}

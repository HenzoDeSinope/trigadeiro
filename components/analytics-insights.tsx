"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { Venda, Vendedor, Item } from "@/lib/api"
import { TrendingUp, TrendingDown, Award, AlertTriangle, Target, Clock } from "lucide-react"

interface AnalyticsInsightsProps {
  vendas: Venda[]
  vendedores: Vendedor[]
  items: Item[]
}

export function AnalyticsInsights({ vendas, vendedores, items }: AnalyticsInsightsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  // Calculate insights
  const totalReceita = vendas.reduce((acc, v) => acc + v.valorPago, 0)
  const totalLucro = vendas.reduce((acc, v) => {
    const profit = (v.item.preco - v.item.custo) * v.quantidade
    return acc + profit
  }, 0)

  // Best performing seller
  const bestSeller = vendedores.reduce(
    (best, current) => (current.vendasCount > best.vendasCount ? current : best),
    vendedores[0],
  )

  // Best performing item
  const itemSales = items.map((item) => {
    const sales = vendas.filter((v) => v.itemId === item.id)
    const receita = sales.reduce((acc, v) => acc + v.valorPago, 0)
    const quantidade = sales.reduce((acc, v) => acc + v.quantidade, 0)
    return { ...item, receita, quantidade, vendas: sales.length }
  })
  const bestItem = itemSales.reduce((best, current) => (current.receita > best.receita ? current : best), itemSales[0])

  // Average sale value
  const avgSaleValue = vendas.length > 0 ? totalReceita / vendas.length : 0

  // Sales this week vs last week
  const now = new Date()
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
  const lastWeekStart = new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000)

  const thisWeekSales = vendas.filter((v) => new Date(v.horario) >= weekStart)
  const lastWeekSales = vendas.filter((v) => {
    const date = new Date(v.horario)
    return date >= lastWeekStart && date < weekStart
  })

  const thisWeekReceita = thisWeekSales.reduce((acc, v) => acc + v.valorPago, 0)
  const lastWeekReceita = lastWeekSales.reduce((acc, v) => acc + v.valorPago, 0)
  const weeklyGrowth = lastWeekReceita > 0 ? ((thisWeekReceita - lastWeekReceita) / lastWeekReceita) * 100 : 0

  // Peak sales hour
  const hourlyStats = Array.from({ length: 24 }, (_, hour) => {
    const hourSales = vendas.filter((v) => new Date(v.horario).getHours() === hour)
    return { hour, count: hourSales.length }
  })
  const peakHour = hourlyStats.reduce((peak, current) => (current.count > peak.count ? current : peak), hourlyStats[0])

  // Sellers progress to meta
  const sellersProgress = vendedores
    .map((v) => ({
      ...v,
      progress: Math.min((v.vendasCount / 25) * 100, 100),
    }))
    .sort((a, b) => b.progress - a.progress)

  return (
    <div className="grid gap-6">
      {/* Key Insights */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crescimento Semanal</CardTitle>
            {weeklyGrowth >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {weeklyGrowth >= 0 ? "+" : ""}
              {weeklyGrowth.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">{formatCurrency(thisWeekReceita)} esta semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(avgSaleValue)}</div>
            <p className="text-xs text-muted-foreground">Por venda realizada</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horário de Pico</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{peakHour.hour.toString().padStart(2, "0")}:00</div>
            <p className="text-xs text-muted-foreground">{peakHour.count} vendas neste horário</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margem de Lucro</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalReceita > 0 ? ((totalLucro / totalReceita) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">{formatCurrency(totalLucro)} de lucro</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Destaques</span>
            </CardTitle>
            <CardDescription>Melhores performances</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Melhor Vendedor</p>
                <p className="text-sm text-muted-foreground">{bestSeller?.nome}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{bestSeller?.vendasCount} vendas</p>
                {bestSeller?.metMeta && (
                  <Badge variant="default" className="bg-green-600">
                    Meta atingida
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Item Mais Vendido</p>
                <p className="text-sm text-muted-foreground">{bestItem?.nome}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{formatCurrency(bestItem?.receita || 0)}</p>
                <p className="text-xs text-muted-foreground">{bestItem?.quantidade} unidades</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sellers Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Progresso da Meta</span>
            </CardTitle>
            <CardDescription>Vendedores próximos da meta (25 vendas)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sellersProgress.slice(0, 5).map((vendedor) => (
              <div key={vendedor.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{vendedor.nome}</span>
                  <span className="text-sm text-muted-foreground">{vendedor.vendasCount}/25</span>
                </div>
                <Progress value={vendedor.progress} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Recomendações</span>
          </CardTitle>
          <CardDescription>Insights para melhorar as vendas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {weeklyGrowth < 0 && (
            <div className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
              <TrendingDown className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-800 dark:text-red-200">Queda nas vendas</p>
                <p className="text-sm text-red-600 dark:text-red-300">
                  As vendas desta semana estão {Math.abs(weeklyGrowth).toFixed(1)}% abaixo da semana passada. Considere
                  estratégias de promoção.
                </p>
              </div>
            </div>
          )}

          {vendedores.filter((v) => !v.metMeta && v.vendasCount >= 20).length > 0 && (
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
              <Target className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-200">Vendedores próximos da meta</p>
                <p className="text-sm text-yellow-600 dark:text-yellow-300">
                  {vendedores.filter((v) => !v.metMeta && v.vendasCount >= 20).length} vendedores estão próximos de
                  atingir a meta. Incentive-os para alcançar 25 vendas.
                </p>
              </div>
            </div>
          )}

          {avgSaleValue < 10 && (
            <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800 dark:text-blue-200">Oportunidade de upsell</p>
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  O ticket médio está baixo ({formatCurrency(avgSaleValue)}). Considere ofertas de combos ou produtos
                  premium.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

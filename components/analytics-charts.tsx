"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts"
import type { Venda, Vendedor, Item } from "@/lib/api"

interface AnalyticsChartsProps {
  vendas: Venda[]
  vendedores: Vendedor[]
  items: Item[]
}

export function AnalyticsCharts({ vendas, vendedores, items }: AnalyticsChartsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  // Sales by seller
  const salesByVendedor = vendedores
    .map((vendedor) => {
      const vendedorSales = vendas.filter((v) => v.vendedorId === vendedor.id)
      const receita = vendedorSales.reduce((acc, v) => acc + v.valorPago, 0)
      return {
        nome: vendedor.nome,
        vendas: vendedor.vendasCount,
        receita,
        metMeta: vendedor.metMeta,
      }
    })
    .sort((a, b) => b.vendas - a.vendas)

  // Sales by item
  const salesByItem = items
    .map((item) => {
      const itemSales = vendas.filter((v) => v.itemId === item.id)
      const quantidade = itemSales.reduce((acc, v) => acc + v.quantidade, 0)
      const receita = itemSales.reduce((acc, v) => acc + v.valorPago, 0)
      const lucro = itemSales.reduce((acc, v) => acc + (item.preco - item.custo) * v.quantidade, 0)
      return {
        nome: item.nome,
        vendas: itemSales.length,
        quantidade,
        receita,
        lucro,
        preco: item.preco,
      }
    })
    .sort((a, b) => b.receita - a.receita)

  // Daily sales trend (last 30 days)
  const dailySales = (() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      return date.toISOString().split("T")[0]
    })

    return last30Days.map((date) => {
      const daySales = vendas.filter((v) => v.horario.startsWith(date))
      const receita = daySales.reduce((acc, v) => acc + v.valorPago, 0)
      const lucro = daySales.reduce((acc, v) => {
        const profit = (v.item.preco - v.item.custo) * v.quantidade
        return acc + profit
      }, 0)
      return {
        date,
        vendas: daySales.length,
        receita,
        lucro,
        day: new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      }
    })
  })()

  // Hourly distribution
  const hourlyDistribution = Array.from({ length: 24 }, (_, hour) => {
    const hourSales = vendas.filter((v) => {
      const saleHour = new Date(v.horario).getHours()
      return saleHour === hour
    })
    return {
      hour: `${hour.toString().padStart(2, "0")}:00`,
      vendas: hourSales.length,
      receita: hourSales.reduce((acc, v) => acc + v.valorPago, 0),
    }
  }).filter((h) => h.vendas > 0)

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ]

  return (
    <div className="grid gap-6">
      {/* Sales Trend */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Tendência de Vendas (Últimos 30 dias)</CardTitle>
          <CardDescription>Evolução diária das vendas, receita e lucro</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailySales}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-xs fill-muted-foreground" />
                <YAxis className="text-xs fill-muted-foreground" />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    name === "receita" || name === "lucro" ? formatCurrency(value) : value,
                    name === "receita" ? "Receita" : name === "lucro" ? "Lucro" : "Vendas",
                  ]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="receita"
                  stackId="1"
                  stroke="hsl(var(--chart-1))"
                  fill="hsl(var(--chart-1))"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="lucro"
                  stackId="2"
                  stroke="hsl(var(--chart-2))"
                  fill="hsl(var(--chart-2))"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Sellers */}
        <Card>
          <CardHeader>
            <CardTitle>Performance dos Vendedores</CardTitle>
            <CardDescription>Vendas por vendedor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesByVendedor.slice(0, 8)} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs fill-muted-foreground" />
                  <YAxis dataKey="nome" type="category" width={80} className="text-xs fill-muted-foreground" />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      name === "receita" ? formatCurrency(value) : value,
                      name === "receita" ? "Receita" : "Vendas",
                    ]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="vendas" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Item Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Receita por Item</CardTitle>
            <CardDescription>Distribuição da receita por produto</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesByItem.slice(0, 5)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ nome, percent }) => `${nome} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="receita"
                  >
                    {salesByItem.slice(0, 5).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), "Receita"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Distribution */}
      {hourlyDistribution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Horário</CardTitle>
            <CardDescription>Vendas ao longo do dia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyDistribution}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="hour" className="text-xs fill-muted-foreground" />
                  <YAxis className="text-xs fill-muted-foreground" />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      name === "receita" ? formatCurrency(value) : value,
                      name === "receita" ? "Receita" : "Vendas",
                    ]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="vendas"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

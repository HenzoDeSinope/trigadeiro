"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Vendedor, Item } from "@/lib/api"

interface TopPerformersProps {
  vendedores: Vendedor[]
  items: Item[]
}

export function TopPerformers({ vendedores, items }: TopPerformersProps) {
  const topVendedores = vendedores.sort((a, b) => b.vendasCount - a.vendasCount).slice(0, 5)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Top Vendedores */}
      <Card>
        <CardHeader>
          <CardTitle>Top Vendedores</CardTitle>
          <CardDescription>Vendedores com mais vendas realizadas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {topVendedores.map((vendedor, index) => (
            <div key={vendedor.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-muted-foreground w-4">#{index + 1}</span>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">{getInitials(vendedor.nome)}</AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <p className="text-sm font-medium">{vendedor.nome}</p>
                  <p className="text-xs text-muted-foreground">{vendedor.vendasCount} vendas</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {vendedor.metMeta && (
                  <Badge variant="secondary" className="text-xs">
                    Meta atingida
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Top Items */}
      <Card>
        <CardHeader>
          <CardTitle>Itens Cadastrados</CardTitle>
          <CardDescription>Produtos disponíveis para venda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.slice(0, 5).map((item, index) => {
            const margem = ((item.preco - item.custo) / item.preco) * 100
            return (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-muted-foreground w-4">#{index + 1}</span>
                  <div>
                    <p className="text-sm font-medium">{item.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(item.preco)} • Margem: {margem.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatCurrency(item.preco)}</p>
                  <p className="text-xs text-muted-foreground">Custo: {formatCurrency(item.custo)}</p>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}

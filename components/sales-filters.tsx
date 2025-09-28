"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { api, type VendaFilters, type Vendedor, type Item } from "@/lib/api"
import { Filter, X } from "lucide-react"

interface SalesFiltersProps {
  onFiltersChange: (filters: VendaFilters) => void
  currentFilters: VendaFilters
}

export function SalesFilters({ onFiltersChange, currentFilters }: SalesFiltersProps) {
  const [vendedores, setVendedores] = useState<Vendedor[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vendedoresData, itemsData] = await Promise.all([api.getVendedores(), api.getItems()])
        setVendedores(vendedoresData)
        setItems(itemsData)
      } catch (error) {
        console.error("Error fetching filter data:", error)
      }
    }

    fetchData()
  }, [])

  const handleFilterChange = (key: keyof VendaFilters, value: string | undefined) => {
    const newFilters = { ...currentFilters }
    if (value === undefined || value === "") {
      delete newFilters[key]
    } else {
      if (key === "vendedorId" || key === "itemId") {
        newFilters[key] = Number.parseInt(value)
      } else {
        newFilters[key] = value as any
      }
    }
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  const hasActiveFilters = Object.keys(currentFilters).length > 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filtros</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? "Ocultar" : "Mostrar"}
            </Button>
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Vendedor Filter */}
            <div className="space-y-2">
              <Label>Vendedor</Label>
              <Select
                value={currentFilters.vendedorId?.toString() || "all"}
                onValueChange={(value) => handleFilterChange("vendedorId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os vendedores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os vendedores</SelectItem>
                  {vendedores.map((vendedor) => (
                    <SelectItem key={vendedor.id} value={vendedor.id.toString()}>
                      {vendedor.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Item Filter */}
            <div className="space-y-2">
              <Label>Item</Label>
              <Select
                value={currentFilters.itemId?.toString() || "all"}
                onValueChange={(value) => handleFilterChange("itemId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os itens" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os itens</SelectItem>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label>Data Início</Label>
              <Input
                type="date"
                value={currentFilters.startDate || ""}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Data Fim</Label>
              <Input
                type="date"
                value={currentFilters.endDate || ""}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Single Day Filter */}
            <div className="space-y-2">
              <Label>Dia Específico</Label>
              <Input
                type="date"
                value={currentFilters.dia || ""}
                onChange={(e) => handleFilterChange("dia", e.target.value)}
                placeholder="Filtrar por um dia específico"
              />
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
              <Label>Ordenação</Label>
              <Select
                value={currentFilters.sort || "desc"}
                onValueChange={(value) => handleFilterChange("sort", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Mais recentes primeiro</SelectItem>
                  <SelectItem value="asc">Mais antigas primeiro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

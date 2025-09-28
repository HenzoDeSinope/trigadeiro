"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { api, type Vendedor, type Item } from "@/lib/api"
import { AuthService } from "@/lib/auth"
import { Plus, Loader2 } from "lucide-react"

interface CreateSaleFormProps {
  onSaleCreated: () => void
}

export function CreateSaleForm({ onSaleCreated }: CreateSaleFormProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [vendedores, setVendedores] = useState<Vendedor[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [formData, setFormData] = useState({
    vendedorId: "",
    itemId: "",
    compradorNome: "",
    quantidade: "",
    valorPago: "",
    horario: "",
  })
  const { toast } = useToast()
  const isAdmin = AuthService.isAdmin()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vendedoresData, itemsData] = await Promise.all([api.getVendedores(), api.getItems()])
        setVendedores(vendedoresData)
        setItems(itemsData)
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    if (open) {
      fetchData()
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !formData.vendedorId ||
      !formData.itemId ||
      !formData.compradorNome ||
      !formData.quantidade ||
      !formData.valorPago
    ) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const saleData = {
        vendedorId: Number.parseInt(formData.vendedorId),
        itemId: Number.parseInt(formData.itemId),
        compradorNome: formData.compradorNome.trim(),
        quantidade: Number.parseInt(formData.quantidade),
        valorPago: Number.parseFloat(formData.valorPago),
        ...(formData.horario && { horario: new Date(formData.horario).toISOString() }),
      }

      await api.createVenda(saleData)

      toast({
        title: "Sucesso",
        description: "Venda criada com sucesso!",
      })

      setFormData({
        vendedorId: "",
        itemId: "",
        compradorNome: "",
        quantidade: "",
        valorPago: "",
        horario: "",
      })
      setOpen(false)
      onSaleCreated()
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao criar venda",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const selectedItem = items.find((item) => item.id === Number.parseInt(formData.itemId))
  const suggestedValue =
    selectedItem && formData.quantidade ? (selectedItem.preco * Number.parseInt(formData.quantidade)).toFixed(2) : ""

  if (!isAdmin) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Venda
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Nova Venda</DialogTitle>
          <DialogDescription>Registre uma nova venda de brigadeiro no sistema.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="vendedorId">Vendedor *</Label>
              <Select
                value={formData.vendedorId}
                onValueChange={(value) => setFormData({ ...formData, vendedorId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o vendedor" />
                </SelectTrigger>
                <SelectContent>
                  {vendedores.map((vendedor) => (
                    <SelectItem key={vendedor.id} value={vendedor.id.toString()}>
                      {vendedor.nome} ({vendedor.vendasCount} vendas)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="itemId">Item *</Label>
              <Select value={formData.itemId} onValueChange={(value) => setFormData({ ...formData, itemId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o item" />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.nome} - R$ {item.preco.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="compradorNome">Nome do Comprador *</Label>
            <Input
              id="compradorNome"
              value={formData.compradorNome}
              onChange={(e) => setFormData({ ...formData, compradorNome: e.target.value })}
              placeholder="Nome completo do comprador"
              maxLength={100}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade *</Label>
              <Input
                id="quantidade"
                type="number"
                min="1"
                value={formData.quantidade}
                onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                placeholder="Quantidade vendida"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valorPago">Valor Pago (R$) *</Label>
              <Input
                id="valorPago"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.valorPago}
                onChange={(e) => setFormData({ ...formData, valorPago: e.target.value })}
                placeholder={suggestedValue ? `Sugerido: ${suggestedValue}` : "0.00"}
              />
              {suggestedValue && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFormData({ ...formData, valorPago: suggestedValue })}
                >
                  Usar valor sugerido (R$ {suggestedValue})
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="horario">Data/Hora (opcional)</Label>
            <Input
              id="horario"
              type="datetime-local"
              value={formData.horario}
              onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">Se não informado, será usado o horário atual</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Venda"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { api } from "@/lib/api"
import { Plus, Loader2 } from "lucide-react"

interface CreateItemFormProps {
  onItemCreated: () => void
}

export function CreateItemForm({ onItemCreated }: CreateItemFormProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: "",
    preco: "",
    custo: "",
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nome.trim() || !formData.preco || !formData.custo) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      })
      return
    }

    const preco = Number.parseFloat(formData.preco)
    const custo = Number.parseFloat(formData.custo)

    if (preco <= 0 || custo <= 0) {
      toast({
        title: "Erro",
        description: "Preço e custo devem ser maiores que zero.",
        variant: "destructive",
      })
      return
    }

    if (custo >= preco) {
      toast({
        title: "Aviso",
        description: "O custo é maior ou igual ao preço de venda. Verifique os valores.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await api.createItem({
        nome: formData.nome.trim(),
        preco,
        custo,
      })

      toast({
        title: "Sucesso",
        description: "Item criado com sucesso!",
      })

      setFormData({ nome: "", preco: "", custo: "" })
      setOpen(false)
      onItemCreated()
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao criar item",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const preco = Number.parseFloat(formData.preco) || 0
  const custo = Number.parseFloat(formData.custo) || 0
  const lucro = preco - custo
  const margem = preco > 0 ? (lucro / preco) * 100 : 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Item</DialogTitle>
          <DialogDescription>Adicione um novo produto de brigadeiro ao catálogo.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Item *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Ex: Brigadeiro Tradicional"
              maxLength={100}
              autoFocus
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="preco">Preço de Venda (R$) *</Label>
              <Input
                id="preco"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.preco}
                onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="custo">Custo (R$) *</Label>
              <Input
                id="custo"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.custo}
                onChange={(e) => setFormData({ ...formData, custo: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Preview calculations */}
          {preco > 0 && custo > 0 && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <h4 className="font-medium">Prévia dos Cálculos:</h4>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span>Lucro por unidade:</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(lucro)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Margem de lucro:</span>
                  <span
                    className={`font-medium ${margem >= 50 ? "text-green-600" : margem >= 30 ? "text-yellow-600" : "text-red-600"}`}
                  >
                    {margem.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}

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
                "Criar Item"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

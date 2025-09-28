"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { api, type Item } from "@/lib/api"
import { Trash2 } from "lucide-react"

interface ItemsTableProps {
  items: Item[]
  onItemDeleted: () => void
}

export function ItemsTable({ items, onItemDeleted }: ItemsTableProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const { toast } = useToast()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const calculateMargin = (preco: number, custo: number) => {
    return ((preco - custo) / preco) * 100
  }

  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id)
      await api.deleteItem(id)
      toast({
        title: "Sucesso",
        description: "Item removido com sucesso",
      })
      onItemDeleted()
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao remover item",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhum item cadastrado</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Preço de Venda</TableHead>
            <TableHead>Custo</TableHead>
            <TableHead>Lucro por Unidade</TableHead>
            <TableHead>Margem</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const lucroUnidade = item.preco - item.custo
            const margem = calculateMargin(item.preco, item.custo)
            const margemColor = margem >= 50 ? "bg-green-600" : margem >= 30 ? "bg-yellow-600" : "bg-red-600"

            return (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-sm">#{item.id}</TableCell>
                <TableCell className="font-medium">{item.nome}</TableCell>
                <TableCell className="font-medium text-green-600">{formatCurrency(item.preco)}</TableCell>
                <TableCell className="text-red-600">{formatCurrency(item.custo)}</TableCell>
                <TableCell className="font-medium">{formatCurrency(lucroUnidade)}</TableCell>
                <TableCell>
                  <Badge className={margemColor}>{margem.toFixed(1)}%</Badge>
                </TableCell>
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" disabled={deletingId === item.id}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja remover o item "{item.nome}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(item.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

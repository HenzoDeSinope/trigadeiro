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
import { api, type Venda } from "@/lib/api"
import { AuthService } from "@/lib/auth"
import { Trash2 } from "lucide-react"

interface SalesTableProps {
  vendas: Venda[]
  onVendaDeleted: () => void
}

export function SalesTable({ vendas, onVendaDeleted }: SalesTableProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const { toast } = useToast()
  const isAdmin = AuthService.isAdmin()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const calculateProfit = (venda: Venda) => {
    if (!venda.item) return 0
    const profitPerUnit = venda.item.preco - venda.item.custo
    return profitPerUnit * venda.quantidade
  }

  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id)
      await api.deleteVenda(id)
      toast({
        title: "Sucesso",
        description: "Venda removida com sucesso",
      })
      onVendaDeleted()
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao remover venda",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  if (vendas.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhuma venda encontrada</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Vendedor</TableHead>
            <TableHead>Item</TableHead>
            <TableHead>Comprador</TableHead>
            <TableHead>Qtd</TableHead>
            <TableHead>Valor Pago</TableHead>
            <TableHead>Lucro</TableHead>
            <TableHead>Data/Hora</TableHead>
            {isAdmin && <TableHead>Ações</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {vendas.map((venda) => (
            <TableRow key={venda.id}>
              <TableCell className="font-mono text-sm">#{venda.id}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <span>{venda.vendedor.nome}</span>
                  {venda.vendedor.metMeta && (
                    <Badge variant="secondary" className="text-xs">
                      Meta
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{venda.item.nome}</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(venda.item.preco)}</p>
                </div>
              </TableCell>
              <TableCell>{venda.compradorNome}</TableCell>
              <TableCell>{venda.quantidade}</TableCell>
              <TableCell className="font-medium">{formatCurrency(venda.valorPago)}</TableCell>
              <TableCell className="font-medium text-green-600">{formatCurrency(calculateProfit(venda))}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{formatDateTime(venda.horario)}</TableCell>
              {isAdmin && (
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" disabled={deletingId === venda.id}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja remover esta venda? Esta ação não pode ser desfeita e irá atualizar
                            as estatísticas do vendedor.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(venda.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

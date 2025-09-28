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
import { api, type Vendedor } from "@/lib/api"
import { Trash2, Trophy } from "lucide-react"

interface VendedoresTableProps {
  vendedores: Vendedor[]
  onVendedorDeleted: () => void
}

export function VendedoresTable({ vendedores, onVendedorDeleted }: VendedoresTableProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const { toast } = useToast()

  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id)
      await api.deleteVendedor(id)
      toast({
        title: "Sucesso",
        description: "Vendedor removido com sucesso",
      })
      onVendedorDeleted()
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao remover vendedor",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  if (vendedores.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhum vendedor cadastrado</p>
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
            <TableHead>Vendas Realizadas</TableHead>
            <TableHead>Status da Meta</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vendedores.map((vendedor) => (
            <TableRow key={vendedor.id}>
              <TableCell className="font-mono text-sm">#{vendedor.id}</TableCell>
              <TableCell className="font-medium">{vendedor.nome}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold">{vendedor.vendasCount}</span>
                  <span className="text-sm text-muted-foreground">vendas</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  {vendedor.metMeta ? (
                    <Badge variant="default" className="bg-green-600">
                      <Trophy className="w-3 h-3 mr-1" />
                      Meta Atingida
                    </Badge>
                  ) : (
                    <Badge variant="secondary">{25 - vendedor.vendasCount} para a meta</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" disabled={deletingId === vendedor.id}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja remover o vendedor "{vendedor.nome}"?
                        {vendedor.vendasCount > 0 && (
                          <span className="block mt-2 text-destructive font-medium">
                            Atenção: Este vendedor possui {vendedor.vendasCount} vendas associadas. Não será possível
                            removê-lo enquanto houver vendas registradas.
                          </span>
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(vendedor.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={vendedor.vendasCount > 0}
                      >
                        Remover
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

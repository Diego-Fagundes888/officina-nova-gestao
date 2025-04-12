
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { formatCurrency } from "@/utils/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Package, PlusCircle, Search } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
} from "@/components/ui/alert-dialog";

export default function Inventory() {
  const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  
  const [newItem, setNewItem] = useState({
    name: "",
    purchasePrice: "",
    stock: "",
  });
  
  const [editItem, setEditItem] = useState({
    name: "",
    purchasePrice: "",
    stock: "",
  });
  
  const filteredItems = inventory.filter((item) => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleSubmitNewItem = () => {
    if (newItem.name && newItem.purchasePrice && newItem.stock) {
      addInventoryItem({
        name: newItem.name,
        purchasePrice: Number(newItem.purchasePrice),
        stock: Number(newItem.stock),
      });
      
      setNewItem({
        name: "",
        purchasePrice: "",
        stock: "",
      });
      
      setIsDialogOpen(false);
    }
  };
  
  const handleEditItem = (id: string) => {
    const item = inventory.find((item) => item.id === id);
    if (item) {
      setSelectedItem(id);
      setEditItem({
        name: item.name,
        purchasePrice: String(item.purchasePrice),
        stock: String(item.stock),
      });
      setIsEditDialogOpen(true);
    }
  };
  
  const handleSubmitEditItem = () => {
    if (selectedItem && editItem.name && editItem.purchasePrice && editItem.stock) {
      updateInventoryItem(selectedItem, {
        name: editItem.name,
        purchasePrice: Number(editItem.purchasePrice),
        stock: Number(editItem.stock),
      });
      
      setIsEditDialogOpen(false);
      setSelectedItem(null);
    }
  };
  
  const getStockStatus = (quantity: number) => {
    if (quantity === 0) {
      return { label: "Sem Estoque", variant: "destructive" as const };
    } else if (quantity < 5) {
      return { label: "Estoque Baixo", variant: "warning" as const };
    } else {
      return { label: "Em Estoque", variant: "success" as const };
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Peças & Estoque</h1>
          <p className="text-muted-foreground">
            Gerencie o estoque de peças da sua oficina
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Nova Peça
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Peça</DialogTitle>
              <DialogDescription>
                Preencha os dados da peça para adicioná-la ao estoque.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Peça</Label>
                <Input
                  id="name"
                  placeholder="Ex: Óleo 5W30"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Preço de Compra (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="Ex: 25.00"
                  value={newItem.purchasePrice}
                  onChange={(e) =>
                    setNewItem({ ...newItem, purchasePrice: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Quantidade em Estoque</Label>
                <Input
                  id="stock"
                  type="number"
                  placeholder="Ex: 10"
                  value={newItem.stock}
                  onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmitNewItem}>Adicionar ao Estoque</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar peças..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Inventário de Peças
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Peça</TableHead>
                  <TableHead>Preço de Compra</TableHead>
                  <TableHead className="text-center">Estoque</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      {searchQuery
                        ? "Nenhuma peça encontrada para sua busca."
                        : "Nenhuma peça cadastrada no estoque."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => {
                    const status = getStockStatus(item.stock);
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{formatCurrency(item.purchasePrice)}</TableCell>
                        <TableCell className="text-center">{item.stock}</TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditItem(item.id)}
                            >
                              Editar
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">Excluir</Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta ação não pode ser desfeita. Esta peça será excluída permanentemente do estoque.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteInventoryItem(item.id)}
                                    className="bg-destructive text-destructive-foreground"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Peça</DialogTitle>
            <DialogDescription>
              Atualize os dados da peça selecionada.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome da Peça</Label>
              <Input
                id="edit-name"
                value={editItem.name}
                onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Preço de Compra (R$)</Label>
              <Input
                id="edit-price"
                type="number"
                value={editItem.purchasePrice}
                onChange={(e) =>
                  setEditItem({ ...editItem, purchasePrice: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-stock">Quantidade em Estoque</Label>
              <Input
                id="edit-stock"
                type="number"
                value={editItem.stock}
                onChange={(e) =>
                  setEditItem({ ...editItem, stock: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmitEditItem}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

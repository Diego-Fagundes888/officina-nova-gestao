
import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { formatCurrency } from "@/utils/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Package, PlusCircle, Search, AlertTriangle } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { InventoryItem } from "@/types";
import { toast } from "sonner";

export default function Inventory() {
  const { inventory, setInventory } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [newItem, setNewItem] = useState({
    name: "",
    purchase_price: "",
    selling_price: "",
    stock: "",
    min_stock: "5",
  });
  
  const [editItem, setEditItem] = useState({
    name: "",
    purchase_price: "",
    selling_price: "",
    stock: "",
    min_stock: "",
  });
  
  useEffect(() => {
    async function fetchInventory() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('inventory_items')
          .select('*')
          .order('name');
        
        if (error) throw error;
        
        if (data) {
          setInventory(data);
        }
      } catch (error: any) {
        toast.error(`Erro ao carregar inventário: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchInventory();
  }, [setInventory]);
  
  const filteredItems = inventory.filter((item) => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleSubmitNewItem = async () => {
    if (newItem.name && newItem.purchase_price && newItem.selling_price && newItem.stock) {
      try {
        const itemData = {
          name: newItem.name,
          purchase_price: Number(newItem.purchase_price),
          selling_price: Number(newItem.selling_price),
          stock: Number(newItem.stock),
          min_stock: Number(newItem.min_stock || 5)
        };
        
        const { data, error } = await supabase
          .from('inventory_items')
          .insert(itemData)
          .select('*')
          .single();
        
        if (error) throw error;
        
        setInventory([...inventory, data]);
        toast.success("Peça adicionada com sucesso");
        
        setNewItem({
          name: "",
          purchase_price: "",
          selling_price: "",
          stock: "",
          min_stock: "5",
        });
        
        setIsDialogOpen(false);
      } catch (error: any) {
        toast.error(`Erro ao adicionar peça: ${error.message}`);
      }
    }
  };
  
  const handleEditItem = (id: string) => {
    const item = inventory.find((item) => item.id === id);
    if (item) {
      setSelectedItem(id);
      setEditItem({
        name: item.name,
        purchase_price: String(item.purchase_price),
        selling_price: String(item.selling_price),
        stock: String(item.stock),
        min_stock: String(item.min_stock),
      });
      setIsEditDialogOpen(true);
    }
  };
  
  const handleSubmitEditItem = async () => {
    if (selectedItem && editItem.name && editItem.purchase_price && editItem.selling_price && editItem.stock) {
      try {
        const itemData = {
          name: editItem.name,
          purchase_price: Number(editItem.purchase_price),
          selling_price: Number(editItem.selling_price),
          stock: Number(editItem.stock),
          min_stock: Number(editItem.min_stock)
        };
        
        const { error } = await supabase
          .from('inventory_items')
          .update(itemData)
          .eq('id', selectedItem);
        
        if (error) throw error;
        
        setInventory(inventory.map(item => 
          item.id === selectedItem ? { ...item, ...itemData } : item
        ));
        
        toast.success("Peça atualizada com sucesso");
        setIsEditDialogOpen(false);
        setSelectedItem(null);
      } catch (error: any) {
        toast.error(`Erro ao atualizar peça: ${error.message}`);
      }
    }
  };
  
  const handleDeleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setInventory(inventory.filter(item => item.id !== id));
      toast.success("Peça excluída com sucesso");
    } catch (error: any) {
      toast.error(`Erro ao excluir peça: ${error.message}`);
    }
  };
  
  const getStockStatus = (item: InventoryItem) => {
    if (item.stock === 0) {
      return { label: "Sem Estoque", variant: "destructive" as const };
    } else if (item.stock < item.min_stock) {
      return { label: "Estoque Baixo", variant: "warning" as const };
    } else {
      return { label: "Em Estoque", variant: "success" as const };
    }
  };
  
  const calculateProfitMargin = (item: InventoryItem) => {
    if (item.purchase_price <= 0) return 0;
    const profit = item.selling_price - item.purchase_price;
    const margin = (profit / item.purchase_price) * 100;
    return Math.round(margin * 10) / 10; // Arredonda para 1 casa decimal
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
                <Label htmlFor="purchase_price">Preço de Compra (R$)</Label>
                <Input
                  id="purchase_price"
                  type="number"
                  placeholder="Ex: 25.00"
                  value={newItem.purchase_price}
                  onChange={(e) =>
                    setNewItem({ ...newItem, purchase_price: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="selling_price">Preço de Venda (R$)</Label>
                <Input
                  id="selling_price"
                  type="number"
                  placeholder="Ex: 40.00"
                  value={newItem.selling_price}
                  onChange={(e) =>
                    setNewItem({ ...newItem, selling_price: e.target.value })
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
              <div className="space-y-2">
                <Label htmlFor="min_stock">Estoque Mínimo</Label>
                <Input
                  id="min_stock"
                  type="number"
                  placeholder="Ex: 5"
                  value={newItem.min_stock}
                  onChange={(e) => setNewItem({ ...newItem, min_stock: e.target.value })}
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
          {isLoading ? (
            <div className="text-center py-6">Carregando...</div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Peça</TableHead>
                    <TableHead>Preço de Compra</TableHead>
                    <TableHead>Preço de Venda</TableHead>
                    <TableHead>Margem</TableHead>
                    <TableHead className="text-center">Estoque</TableHead>
                    <TableHead>Estoque Mín.</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                        {searchQuery
                          ? "Nenhuma peça encontrada para sua busca."
                          : "Nenhuma peça cadastrada no estoque."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item) => {
                      const status = getStockStatus(item);
                      const profitMargin = calculateProfitMargin(item);
                      
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{formatCurrency(item.purchase_price)}</TableCell>
                          <TableCell>{formatCurrency(item.selling_price)}</TableCell>
                          <TableCell>
                            <span className={profitMargin < 20 ? "text-yellow-500" : "text-green-500"}>
                              {profitMargin}%
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            {item.stock === 0 || item.stock < item.min_stock ? (
                              <div className="flex items-center justify-center">
                                <span>{item.stock}</span>
                                {item.stock === 0 ? (
                                  <AlertTriangle className="h-4 w-4 ml-1 text-destructive" />
                                ) : item.stock < item.min_stock ? (
                                  <AlertTriangle className="h-4 w-4 ml-1 text-yellow-500" />
                                ) : null}
                              </div>
                            ) : (
                              item.stock
                            )}
                          </TableCell>
                          <TableCell>{item.min_stock}</TableCell>
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
                                      onClick={() => handleDeleteItem(item.id)}
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
          )}
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
              <Label htmlFor="edit-purchase-price">Preço de Compra (R$)</Label>
              <Input
                id="edit-purchase-price"
                type="number"
                value={editItem.purchase_price}
                onChange={(e) =>
                  setEditItem({ ...editItem, purchase_price: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-selling-price">Preço de Venda (R$)</Label>
              <Input
                id="edit-selling-price"
                type="number"
                value={editItem.selling_price}
                onChange={(e) =>
                  setEditItem({ ...editItem, selling_price: e.target.value })
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
            <div className="space-y-2">
              <Label htmlFor="edit-min-stock">Estoque Mínimo</Label>
              <Input
                id="edit-min-stock"
                type="number"
                value={editItem.min_stock}
                onChange={(e) =>
                  setEditItem({ ...editItem, min_stock: e.target.value })
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

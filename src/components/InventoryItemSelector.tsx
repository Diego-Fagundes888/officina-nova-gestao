
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Plus } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { formatCurrency } from "@/utils/mockData";
import { InventoryItem, Part } from "@/types";

interface InventoryItemSelectorProps {
  onAddPart: (part: Omit<Part, "id">) => void;
}

export default function InventoryItemSelector({ onAddPart }: InventoryItemSelectorProps) {
  const { inventory } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState<Record<string, number>>({});
  
  // Inicializar as quantidades
  useEffect(() => {
    const quantities: Record<string, number> = {};
    inventory.forEach(item => {
      quantities[item.id] = 1;
    });
    setSelectedQuantity(quantities);
  }, [inventory]);
  
  const filteredItems = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleSelectItem = (item: InventoryItem) => {
    onAddPart({
      name: item.name,
      price: item.selling_price,
      quantity: selectedQuantity[item.id] || 1,
      inventory_item_id: item.id
    });
    setIsOpen(false);
  };
  
  const handleQuantityChange = (id: string, value: string) => {
    const quantity = parseInt(value);
    if (!isNaN(quantity) && quantity > 0) {
      setSelectedQuantity(prev => ({
        ...prev,
        [id]: quantity
      }));
    }
  };
  
  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="h-4 w-4 mr-2" />
        Selecionar Peça do Inventário
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Selecionar Peça do Inventário</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar peças..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <div className="border rounded-md divide-y max-h-[300px] overflow-y-auto">
              {filteredItems.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  Nenhuma peça encontrada.
                </div>
              ) : (
                filteredItems.map(item => (
                  <div key={item.id} className="p-3 hover:bg-accent transition-colors">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Preço: {formatCurrency(item.selling_price)} | Estoque: {item.stock}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-20">
                          <Label htmlFor={`qty-${item.id}`} className="sr-only">Quantidade</Label>
                          <Input
                            id={`qty-${item.id}`}
                            type="number"
                            min="1"
                            max={item.stock}
                            value={selectedQuantity[item.id] || 1}
                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                            className="w-full h-8"
                          />
                        </div>
                        <Button 
                          variant="default" 
                          size="sm"
                          disabled={item.stock === 0}
                          onClick={() => handleSelectItem(item)}
                        >
                          {item.stock === 0 ? "Sem estoque" : "Selecionar"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

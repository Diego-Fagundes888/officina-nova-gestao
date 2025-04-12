
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, generateId } from "@/utils/mockData";
import { Part, ServiceOrder, ServiceStatus } from "@/types";
import { useApp } from "@/context/AppContext";
import { Plus, Trash2, Save } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CreateServiceOrder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { serviceOrders, addServiceOrder, updateServiceOrder } = useApp();
  
  const existingOrder = id 
    ? serviceOrders.find(order => order.id === id) 
    : null;
  
  const [formData, setFormData] = useState<{
    clientName: string;
    vehicleModel: string;
    vehicleYear: string;
    vehiclePlate: string;
    serviceType: string;
    parts: Part[];
    laborCost: number;
  }>({
    clientName: existingOrder?.clientName || "",
    vehicleModel: existingOrder?.vehicle.model || "",
    vehicleYear: existingOrder?.vehicle.year || "",
    vehiclePlate: existingOrder?.vehicle.plate || "",
    serviceType: existingOrder?.serviceType || "",
    parts: existingOrder?.parts || [],
    laborCost: existingOrder?.laborCost || 0,
  });
  
  const calculateTotal = () => {
    const partsTotal = formData.parts.reduce(
      (sum, part) => sum + part.price * part.quantity,
      0
    );
    return partsTotal + formData.laborCost;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Handle nested fields for vehicle
    if (name.startsWith("vehicle")) {
      const field = name.replace("vehicle", "").toLowerCase();
      setFormData({
        ...formData,
        [name]: value,
      });
    } else if (name === "laborCost") {
      setFormData({
        ...formData,
        laborCost: Number(value) || 0,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  
  const addPart = () => {
    setFormData({
      ...formData,
      parts: [
        ...formData.parts,
        { id: generateId(), name: "", price: 0, quantity: 1 },
      ],
    });
  };
  
  const updatePart = (id: string, field: keyof Part, value: string | number) => {
    setFormData({
      ...formData,
      parts: formData.parts.map(part => 
        part.id === id 
          ? { 
              ...part, 
              [field]: field === "name" ? value : Number(value) || 0 
            } 
          : part
      ),
    });
  };
  
  const removePart = (id: string) => {
    setFormData({
      ...formData,
      parts: formData.parts.filter(part => part.id !== id),
    });
  };
  
  const handleSubmit = (status: ServiceStatus) => {
    const total = calculateTotal();
    
    if (existingOrder) {
      updateServiceOrder(existingOrder.id, {
        clientName: formData.clientName,
        vehicle: {
          model: formData.vehicleModel,
          year: formData.vehicleYear,
          plate: formData.vehiclePlate,
        },
        serviceType: formData.serviceType,
        parts: formData.parts,
        laborCost: formData.laborCost,
        total,
        status,
      });
    } else {
      const newOrder: Omit<ServiceOrder, "id" | "createdAt" | "updatedAt"> = {
        clientName: formData.clientName,
        vehicle: {
          model: formData.vehicleModel,
          year: formData.vehicleYear,
          plate: formData.vehiclePlate,
        },
        serviceType: formData.serviceType,
        parts: formData.parts,
        laborCost: formData.laborCost,
        total,
        status,
      };
      
      addServiceOrder(newOrder);
    }
    
    navigate("/ordens");
  };
  
  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {existingOrder ? "Editar Ordem de Serviço" : "Nova Ordem de Serviço"}
        </h1>
        <p className="text-muted-foreground">
          {existingOrder ? "Atualize os dados da ordem de serviço" : "Preencha os dados para criar uma nova ordem de serviço"}
        </p>
      </div>
      
      <form className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Cliente e Veículo</CardTitle>
            <CardDescription>
              Dados do cliente e do veículo para esta ordem de serviço
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Nome do Cliente</Label>
              <Input
                id="clientName"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                placeholder="Nome completo do cliente"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleModel">Modelo do Veículo</Label>
                <Input
                  id="vehicleModel"
                  name="vehicleModel"
                  value={formData.vehicleModel}
                  onChange={handleChange}
                  placeholder="Ex: Fiat Uno"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicleYear">Ano</Label>
                <Input
                  id="vehicleYear"
                  name="vehicleYear"
                  value={formData.vehicleYear}
                  onChange={handleChange}
                  placeholder="Ex: 2020"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehiclePlate">Placa</Label>
                <Input
                  id="vehiclePlate"
                  name="vehiclePlate"
                  value={formData.vehiclePlate}
                  onChange={handleChange}
                  placeholder="Ex: ABC-1234"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="serviceType">Tipo de Serviço</Label>
              <Input
                id="serviceType"
                name="serviceType"
                value={formData.serviceType}
                onChange={handleChange}
                placeholder="Ex: Troca de óleo e filtros"
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Peças e Serviços</CardTitle>
            <CardDescription>
              Adicione as peças utilizadas e o valor da mão de obra
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium">Peças</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPart}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Peça
                </Button>
              </div>
              
              {formData.parts.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  Nenhuma peça adicionada. Clique em "Adicionar Peça" para começar.
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.parts.map((part, index) => (
                    <div key={part.id} className={cn(
                      "grid grid-cols-12 gap-2 items-center",
                      index !== 0 && "pt-3",
                      index !== formData.parts.length - 1 && "pb-3 border-b border-border"
                    )}>
                      <div className="col-span-5">
                        <Input
                          placeholder="Nome da peça"
                          value={part.name}
                          onChange={(e) => updatePart(part.id, "name", e.target.value)}
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          type="number"
                          placeholder="Preço unitário"
                          value={part.price || ""}
                          onChange={(e) => updatePart(part.id, "price", e.target.value)}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          placeholder="Qtd."
                          min="1"
                          value={part.quantity || ""}
                          onChange={(e) => updatePart(part.id, "quantity", e.target.value)}
                        />
                      </div>
                      <div className="col-span-1 text-right text-muted-foreground">
                        {formatCurrency(part.price * part.quantity)}
                      </div>
                      <div className="col-span-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removePart(part.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="laborCost">Mão de Obra</Label>
              <Input
                id="laborCost"
                name="laborCost"
                type="number"
                value={formData.laborCost || ""}
                onChange={handleChange}
                placeholder="Valor da mão de obra"
              />
            </div>
            
            <div className="pt-4 border-t border-border">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{formatCurrency(calculateTotal())}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/ordens")}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => handleSubmit(ServiceStatus.DRAFT)}
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar como Rascunho
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={() => handleSubmit(ServiceStatus.IN_PROGRESS)}
          >
            Salvar e Iniciar Serviço
          </Button>
        </div>
      </form>
    </div>
  );
}

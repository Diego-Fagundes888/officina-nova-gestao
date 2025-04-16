
import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Plus, Edit } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { VehicleService, Vehicle } from "@/types";

interface VehicleServiceFormProps {
  service?: VehicleService;
}

export default function VehicleServiceForm({ service }: VehicleServiceFormProps) {
  const { addVehicleService, updateVehicleService, vehicles } = useApp();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    vehicle_id: "",
    client_name: "",
    service_type: "",
    description: "",
    notes: "",
    service_date: new Date().toISOString().split("T")[0],
    price: "",
    mechanic_name: "",
  });
  
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  useEffect(() => {
    if (service) {
      setFormData({
        vehicle_id: service.vehicle_id || "",
        client_name: service.client_name || "",
        service_type: service.service_type || "",
        description: service.description || "",
        notes: service.notes || "",
        service_date: service.service_date || new Date().toISOString().split("T")[0],
        price: service.price ? service.price.toString() : "",
        mechanic_name: service.mechanic_name || "",
      });
      
      if (service.service_date) {
        setDate(new Date(service.service_date));
      }
    }
  }, [service]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };
  
  const handleDateChange = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      setFormData({
        ...formData,
        service_date: selectedDate.toISOString().split("T")[0],
      });
    }
  };
  
  const resetForm = () => {
    if (!service) {
      setFormData({
        vehicle_id: "",
        client_name: "",
        service_type: "",
        description: "",
        notes: "",
        service_date: new Date().toISOString().split("T")[0],
        price: "",
        mechanic_name: "",
      });
      setDate(new Date());
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!formData.vehicle_id || !formData.service_type || !formData.service_date) {
        toast.error("Preencha todos os campos obrigatórios");
        return;
      }
      
      const serviceData = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : undefined,
      };
      
      if (service) {
        await updateVehicleService(service.id, serviceData);
      } else {
        await addVehicleService(serviceData);
      }
      
      setOpen(false);
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar serviço:", error);
    }
  };
  
  // Placas dos veículos registrados
  const vehiclePlates = vehicles.map(v => v.plate);
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={service ? "ghost" : "default"} size={service ? "icon" : "default"}>
          {service ? <Edit className="h-4 w-4" /> : <><Plus className="mr-2 h-4 w-4" /> Novo Serviço</>}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{service ? "Editar Serviço" : "Adicionar Serviço ao Histórico"}</DialogTitle>
          <DialogDescription>
            {service 
              ? "Atualize as informações deste serviço no histórico do veículo."
              : "Preencha os dados para adicionar um novo serviço ao histórico do veículo."
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicle_id">Veículo (Placa)*</Label>
              {vehiclePlates.length > 0 ? (
                <Select
                  value={formData.vehicle_id}
                  onValueChange={(value) => handleSelectChange("vehicle_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um veículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehiclePlates.map((plate) => (
                      <SelectItem key={plate} value={plate}>{plate}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="vehicle_id"
                  name="vehicle_id"
                  value={formData.vehicle_id}
                  onChange={handleChange}
                  placeholder="Ex: ABC-1234"
                  required
                />
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="service_date">Data do Serviço*</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateChange}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="client_name">Cliente</Label>
            <Input
              id="client_name"
              name="client_name"
              value={formData.client_name}
              onChange={handleChange}
              placeholder="Nome do cliente"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="service_type">Tipo de Serviço*</Label>
            <Input
              id="service_type"
              name="service_type"
              value={formData.service_type}
              onChange={handleChange}
              placeholder="Ex: Troca de óleo, Revisão, etc."
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição do Serviço</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descreva o serviço realizado..."
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Observações adicionais..."
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Valor do Serviço</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                placeholder="Ex: 150.00"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mechanic_name">Mecânico Responsável</Label>
              <Input
                id="mechanic_name"
                name="mechanic_name"
                value={formData.mechanic_name}
                onChange={handleChange}
                placeholder="Nome do mecânico"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">{service ? "Atualizar" : "Adicionar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

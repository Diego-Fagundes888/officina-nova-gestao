
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "@/components/ui/dialog";
import { Appointment, ServiceStatus } from "@/types";
import { useApp } from "@/context/AppContext";

interface AppointmentServiceOrderModalProps {
  appointment: Appointment;
  isOpen: boolean;
  onClose: () => void;
}

export function AppointmentServiceOrderModal({
  appointment,
  isOpen,
  onClose,
}: AppointmentServiceOrderModalProps) {
  const navigate = useNavigate();
  const { addServiceOrder, updateAppointmentStatus } = useApp();
  const [laborCost, setLaborCost] = useState(0);
  const [notes, setNotes] = useState(appointment.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Create service order from appointment
      await addServiceOrder({
        clientName: appointment.clientName,
        vehicle: {
          model: appointment.vehicle.model,
          year: appointment.vehicle.year,
          plate: appointment.vehicle.plate,
        },
        serviceType: appointment.serviceType,
        parts: [],
        laborCost: laborCost,
        total: laborCost, // Total is initially just labor cost as no parts added yet
        status: ServiceStatus.IN_PROGRESS,
        completedAt: null
      });
      
      // Update appointment status
      await updateAppointmentStatus(appointment.id, "EM_ANDAMENTO");
      
      onClose();
      navigate("/ordens");
    } catch (error) {
      console.error("Error creating service order:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Iniciar Serviço</DialogTitle>
          <DialogDescription>
            Preencha as informações iniciais para criar uma ordem de serviço.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="client">Cliente</Label>
            <Input id="client" value={appointment.clientName} readOnly />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="vehicle">Veículo</Label>
            <Input 
              id="vehicle" 
              value={`${appointment.vehicle.model} (${appointment.vehicle.year}) - ${appointment.vehicle.plate}`} 
              readOnly 
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="service">Serviço</Label>
            <Input id="service" value={appointment.serviceType} readOnly />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="laborCost">Valor da Mão de Obra (R$)</Label>
            <Input 
              id="laborCost" 
              type="number" 
              value={laborCost || ""} 
              onChange={(e) => setLaborCost(Number(e.target.value))}
              placeholder="0.00"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea 
              id="notes" 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações sobre o serviço..."
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Processando..." : "Iniciar Serviço"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

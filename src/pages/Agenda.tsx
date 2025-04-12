
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Appointment } from "@/types";
import { generateId } from "@/utils/mockData";
import { Calendar, Clock, PlusCircle } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link, useNavigate } from "react-router-dom";
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

export default function Agenda() {
  const { appointments, addAppointment, deleteAppointment } = useApp();
  const navigate = useNavigate();
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [newAppointment, setNewAppointment] = useState<{
    clientName: string;
    vehicleModel: string;
    vehicleYear: string;
    vehiclePlate: string;
    serviceType: string;
    time: string;
    notes: string;
  }>({
    clientName: "",
    vehicleModel: "",
    vehicleYear: "",
    vehiclePlate: "",
    serviceType: "",
    time: "",
    notes: "",
  });
  
  const handleCreateAppointment = () => {
    if (
      selectedDate &&
      newAppointment.clientName &&
      newAppointment.vehicleModel &&
      newAppointment.serviceType &&
      newAppointment.time
    ) {
      const appointment: Omit<Appointment, "id"> = {
        clientName: newAppointment.clientName,
        vehicle: {
          model: newAppointment.vehicleModel,
          year: newAppointment.vehicleYear,
          plate: newAppointment.vehiclePlate,
        },
        serviceType: newAppointment.serviceType,
        date: selectedDate.toISOString(),
        time: newAppointment.time,
        notes: newAppointment.notes || undefined,
      };
      
      addAppointment(appointment);
      
      setNewAppointment({
        clientName: "",
        vehicleModel: "",
        vehicleYear: "",
        vehiclePlate: "",
        serviceType: "",
        time: "",
        notes: "",
      });
      
      setIsDialogOpen(false);
    }
  };
  
  const createServiceOrderFromAppointment = (appointment: Appointment) => {
    // Navigate to the create order page with appointment data
    navigate("/ordens/nova", {
      state: {
        clientName: appointment.clientName,
        vehicleModel: appointment.vehicle.model,
        vehicleYear: appointment.vehicle.year,
        vehiclePlate: appointment.vehicle.plate,
        serviceType: appointment.serviceType,
      },
    });
  };
  
  const getAppointmentsForDate = (date: Date | undefined) => {
    if (!date) return [];
    
    return appointments.filter((appointment) => {
      const appointmentDate = parseISO(appointment.date);
      return isSameDay(appointmentDate, date);
    });
  };
  
  const filteredAppointments = getAppointmentsForDate(selectedDate);
  
  const formatAppointmentDate = (date: string) => {
    return format(parseISO(date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
  };
  
  const formatTime = (time: string) => {
    return time;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
          <p className="text-muted-foreground">
            Gerencie os agendamentos da sua oficina
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Novo Agendamento</DialogTitle>
              <DialogDescription>
                Preencha os dados para criar um novo agendamento.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Nome do Cliente</Label>
                <Input
                  id="clientName"
                  value={newAppointment.clientName}
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      clientName: e.target.value,
                    })
                  }
                  placeholder="Ex: João Silva"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicleModel">Modelo do Veículo</Label>
                  <Input
                    id="vehicleModel"
                    value={newAppointment.vehicleModel}
                    onChange={(e) =>
                      setNewAppointment({
                        ...newAppointment,
                        vehicleModel: e.target.value,
                      })
                    }
                    placeholder="Ex: Fiat Uno"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleYear">Ano</Label>
                  <Input
                    id="vehicleYear"
                    value={newAppointment.vehicleYear}
                    onChange={(e) =>
                      setNewAppointment({
                        ...newAppointment,
                        vehicleYear: e.target.value,
                      })
                    }
                    placeholder="Ex: 2020"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="vehiclePlate">Placa</Label>
                <Input
                  id="vehiclePlate"
                  value={newAppointment.vehiclePlate}
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      vehiclePlate: e.target.value,
                    })
                  }
                  placeholder="Ex: ABC-1234"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="serviceType">Tipo de Serviço</Label>
                <Input
                  id="serviceType"
                  value={newAppointment.serviceType}
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      serviceType: e.target.value,
                    })
                  }
                  placeholder="Ex: Troca de óleo e filtros"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time">Horário</Label>
                <Input
                  id="time"
                  type="time"
                  value={newAppointment.time}
                  onChange={(e) =>
                    setNewAppointment({ ...newAppointment, time: e.target.value })
                  }
                  placeholder="Ex: 15:00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Observações (opcional)</Label>
                <Textarea
                  id="notes"
                  value={newAppointment.notes}
                  onChange={(e) =>
                    setNewAppointment({ ...newAppointment, notes: e.target.value })
                  }
                  placeholder="Ex: Cliente solicitou uso de óleo sintético"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateAppointment}>Agendar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Calendário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              locale={ptBR}
            />
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Agendamentos para {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: ptBR }) : "hoje"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Não há agendamentos para esta data.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredAppointments
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((appointment) => (
                    <div key={appointment.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{formatTime(appointment.time)}</Badge>
                            <h3 className="font-medium">{appointment.clientName}</h3>
                          </div>
                          <p className="text-muted-foreground">
                            {appointment.vehicle.model} ({appointment.vehicle.year}) - {appointment.vehicle.plate}
                          </p>
                          <p className="text-sm">{appointment.serviceType}</p>
                          {appointment.notes && (
                            <p className="text-sm text-muted-foreground italic">
                              "{appointment.notes}"
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => createServiceOrderFromAppointment(appointment)}
                          >
                            Criar OS
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">Excluir</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação não pode ser desfeita. Este agendamento será excluído permanentemente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteAppointment(appointment.id)}
                                  className="bg-destructive text-destructive-foreground"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Próximos Agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Não há agendamentos futuros.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {appointments
                .filter((app) => new Date(app.date) >= new Date(new Date().setHours(0, 0, 0, 0)))
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 5)
                .map((appointment) => (
                  <div key={appointment.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <h3 className="font-medium">{appointment.clientName}</h3>
                          <Badge variant="outline">
                            {formatAppointmentDate(appointment.date)} às {formatTime(appointment.time)}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">
                          {appointment.vehicle.model} ({appointment.vehicle.year}) - {appointment.vehicle.plate}
                        </p>
                        <p className="text-sm">{appointment.serviceType}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

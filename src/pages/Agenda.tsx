import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Appointment, AppointmentStatus } from "@/types";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AppointmentServiceOrderModal } from "@/components/AppointmentServiceOrderModal";

export default function Agenda() {
  const { 
    appointments, 
    setAppointments,
    updateAppointmentStatus
  } = useApp();
  const navigate = useNavigate();
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
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
  
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isServiceOrderModalOpen, setIsServiceOrderModalOpen] = useState(false);
  
  useEffect(() => {
    async function fetchAppointments() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .order('date, time');
        
        if (error) throw error;
        
        if (data) {
          const formattedAppointments = data.map(app => ({
            id: app.id,
            clientName: app.client_name,
            vehicle: {
              model: app.vehicle_model,
              year: app.vehicle_year,
              plate: app.vehicle_plate,
            },
            serviceType: app.service_type,
            date: app.date,
            time: app.time,
            notes: app.notes,
            status: (app.status as AppointmentStatus) || AppointmentStatus.AGENDADO,
          }));
          
          setAppointments(formattedAppointments);
        }
      } catch (error: any) {
        console.error("Erro ao carregar agendamentos:", error);
        toast.error(`Erro ao carregar agendamentos: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchAppointments();
  }, [setAppointments]);
  
  const handleCreateAppointment = async () => {
    if (
      selectedDate &&
      newAppointment.clientName &&
      newAppointment.vehicleModel &&
      newAppointment.serviceType &&
      newAppointment.time
    ) {
      try {
        const appointmentData = {
          client_name: newAppointment.clientName,
          vehicle_model: newAppointment.vehicleModel,
          vehicle_year: newAppointment.vehicleYear,
          vehicle_plate: newAppointment.vehiclePlate,
          service_type: newAppointment.serviceType,
          date: selectedDate.toISOString().split('T')[0],
          time: newAppointment.time,
          notes: newAppointment.notes || null,
          status: AppointmentStatus.AGENDADO
        };
        
        const { data, error } = await supabase
          .from('appointments')
          .insert(appointmentData)
          .select('*')
          .single();
          
        if (error) throw error;
        
        const newAppointmentFormatted: Appointment = {
          id: data.id,
          clientName: data.client_name,
          vehicle: {
            model: data.vehicle_model,
            year: data.vehicle_year,
            plate: data.vehicle_plate,
          },
          serviceType: data.service_type,
          date: data.date,
          time: data.time,
          notes: data.notes,
          status: data.status as AppointmentStatus,
        };
        
        setAppointments([...appointments, newAppointmentFormatted]);
        toast.success("Agendamento criado com sucesso!");
        
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
      } catch (error: any) {
        console.error("Erro ao criar agendamento:", error);
        toast.error(`Erro ao criar agendamento: ${error.message}`);
      }
    } else {
      toast.error("Preencha todos os campos obrigatórios");
    }
  };
  
  const createServiceOrderFromAppointment = (appointment: Appointment) => {
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
  
  const deleteAppointment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setAppointments(appointments.filter(item => item.id !== id));
      toast.success("Agendamento excluído com sucesso!");
    } catch (error: any) {
      console.error("Erro ao excluir agendamento:", error);
      toast.error(`Erro ao excluir agendamento: ${error.message}`);
    }
  };
  
  const getAppointmentsForDate = (date: Date | undefined) => {
    if (!date) return [];
    
    return appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.date);
      return isSameDay(appointmentDate, date);
    });
  };
  
  const filteredAppointments = getAppointmentsForDate(selectedDate);
  
  const formatAppointmentDate = (date: string) => {
    return format(new Date(date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
  };
  
  const formatTime = (time: string) => {
    return time;
  };

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.FINALIZADO:
        return "bg-green-500";
      case AppointmentStatus.EM_ANDAMENTO:
        return "bg-yellow-500";
      case AppointmentStatus.CANCELADO:
        return "bg-gray-500";
      case AppointmentStatus.ATRASADO:
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  };
  
  const handleStartService = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsServiceOrderModalOpen(true);
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
            {isLoading ? (
              <div className="text-center py-8">Carregando agendamentos...</div>
            ) : filteredAppointments.length === 0 ? (
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
                            <Badge 
                              variant="outline" 
                              className={`${getStatusColor(appointment.status)} text-white`}
                            >
                              {appointment.status}
                            </Badge>
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
                          {appointment.status === AppointmentStatus.AGENDADO && (
                            <Button
                              onClick={() => handleStartService(appointment)}
                            >
                              Iniciar Serviço
                            </Button>
                          )}
                          {appointment.status === AppointmentStatus.EM_ANDAMENTO && (
                            <Button
                              onClick={() => updateAppointmentStatus(
                                appointment.id, 
                                AppointmentStatus.FINALIZADO
                              )}
                            >
                              Finalizar Serviço
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            onClick={() => updateAppointmentStatus(
                              appointment.id, 
                              AppointmentStatus.CANCELADO
                            )}
                          >
                            Cancelar
                          </Button>
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
          {isLoading ? (
            <div className="text-center py-8">Carregando agendamentos...</div>
          ) : appointments.length === 0 ? (
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => createServiceOrderFromAppointment(appointment)}
                      >
                        Criar OS
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {selectedAppointment && (
        <AppointmentServiceOrderModal
          appointment={selectedAppointment}
          isOpen={isServiceOrderModalOpen}
          onClose={() => setIsServiceOrderModalOpen(false)}
        />
      )}
    </div>
  );
}

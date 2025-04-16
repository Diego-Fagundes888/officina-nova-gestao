
import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/utils/mockData";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Trash2, Edit, FileText } from "lucide-react";
import { VehicleService } from "@/types";
import VehicleServiceForm from "@/components/VehicleServiceForm";

export default function VehicleHistory() {
  const { vehicleServices, vehicles, deleteVehicleService } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlate, setFilterPlate] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<VehicleService | null>(null);
  
  // Extrair placas únicas dos veículos e serviços
  const uniquePlates = [...new Set([
    ...vehicles.map(v => v.plate),
    ...vehicleServices.map(s => s.vehicle_id)
  ])];
  
  const filteredServices = vehicleServices
    .filter(service => {
      const matchesPlate = !filterPlate || filterPlate === "all" || service.vehicle_id === filterPlate;
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        !searchQuery ||
        service.service_type.toLowerCase().includes(searchLower) ||
        (service.mechanic_name && service.mechanic_name.toLowerCase().includes(searchLower)) ||
        (service.description && service.description.toLowerCase().includes(searchLower)) ||
        (service.client_name && service.client_name.toLowerCase().includes(searchLower));
      
      return matchesPlate && matchesSearch;
    })
    .sort((a, b) => new Date(b.service_date).getTime() - new Date(a.service_date).getTime());
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  };
  
  const handleOpenDetails = (service: VehicleService) => {
    setSelectedService(service);
    setDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedService(null);
  };
  
  const handleDeleteService = async (id: string) => {
    try {
      await deleteVehicleService(id);
    } catch (error) {
      console.error("Erro ao excluir serviço:", error);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Histórico de Veículos</h1>
        <p className="text-muted-foreground">
          Visualize e gerencie o histórico de serviços realizados nos veículos dos clientes
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 space-y-2">
          <Label htmlFor="search">Pesquisar</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Buscar por tipo de serviço, mecânico, cliente ou descrição..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="w-full md:w-60 space-y-2">
          <Label htmlFor="plate-filter">Filtrar por veículo</Label>
          <Select value={filterPlate} onValueChange={setFilterPlate}>
            <SelectTrigger id="plate-filter">
              <SelectValue placeholder="Todos os veículos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os veículos</SelectItem>
              {uniquePlates.map((plate) => (
                <SelectItem key={plate} value={plate}>{plate}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <VehicleServiceForm />
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Histórico de Serviços</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo de Serviço</TableHead>
                  <TableHead>Mecânico</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      {searchQuery || filterPlate
                        ? "Nenhum resultado encontrado para sua busca."
                        : "Nenhum serviço registrado no histórico."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>{formatDate(service.service_date)}</TableCell>
                      <TableCell>{service.vehicle_id}</TableCell>
                      <TableCell>{service.client_name || "—"}</TableCell>
                      <TableCell>{service.service_type}</TableCell>
                      <TableCell>{service.mechanic_name || "—"}</TableCell>
                      <TableCell>{service.price ? formatCurrency(service.price) : "—"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDetails(service)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <VehicleServiceForm service={service} />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir este registro de serviço? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  className="bg-red-500 hover:bg-red-600"
                                  onClick={() => handleDeleteService(service.id)}
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedService && (
            <>
              <DialogHeader>
                <DialogTitle>Detalhes do Serviço</DialogTitle>
                <DialogDescription>
                  Informações detalhadas sobre o serviço realizado
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm">Data do Serviço</h4>
                    <p>{formatDate(selectedService.service_date)}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Veículo</h4>
                    <p>{selectedService.vehicle_id}</p>
                  </div>
                </div>
                
                {selectedService.client_name && (
                  <div>
                    <h4 className="font-medium text-sm">Cliente</h4>
                    <p>{selectedService.client_name}</p>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium text-sm">Tipo de Serviço</h4>
                  <p>{selectedService.service_type}</p>
                </div>
                
                {selectedService.description && (
                  <div>
                    <h4 className="font-medium text-sm">Descrição do Serviço</h4>
                    <p>{selectedService.description}</p>
                  </div>
                )}
                
                {selectedService.notes && (
                  <div>
                    <h4 className="font-medium text-sm">Observações</h4>
                    <p>{selectedService.notes}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  {selectedService.price && (
                    <div>
                      <h4 className="font-medium text-sm">Valor do Serviço</h4>
                      <p>{formatCurrency(selectedService.price)}</p>
                    </div>
                  )}
                  {selectedService.mechanic_name && (
                    <div>
                      <h4 className="font-medium text-sm">Mecânico Responsável</h4>
                      <p>{selectedService.mechanic_name}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <DialogFooter>
                <Button onClick={handleCloseDialog}>Fechar</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

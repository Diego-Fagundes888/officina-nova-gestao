
import { useApp } from "@/context/AppContext";
import { ServiceStatus } from "@/types";
import { formatCurrency } from "@/utils/mockData";
import { Eye, FilePlus, Pencil, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusLabels = {
  [ServiceStatus.DRAFT]: {
    label: "Rascunho",
    variant: "outline" as const,
  },
  [ServiceStatus.IN_PROGRESS]: {
    label: "Em Andamento",
    variant: "default" as const,
  },
  [ServiceStatus.COMPLETED]: {
    label: "Concluído",
    variant: "success" as const,
  },
  [ServiceStatus.CANCELED]: {
    label: "Cancelado",
    variant: "destructive" as const,
  },
};

export default function ServiceOrders() {
  const { serviceOrders, deleteServiceOrder, completeServiceOrder } = useApp();
  
  const draftOrders = serviceOrders.filter(order => order.status === ServiceStatus.DRAFT);
  const inProgressOrders = serviceOrders.filter(order => order.status === ServiceStatus.IN_PROGRESS);
  const completedOrders = serviceOrders.filter(order => order.status === ServiceStatus.COMPLETED);
  const canceledOrders = serviceOrders.filter(order => order.status === ServiceStatus.CANCELED);
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  };
  
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Ordens de Serviço</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Gerencie as ordens de serviço da oficina
          </p>
        </div>
        <Button asChild className="mt-2 sm:mt-0 w-full sm:w-auto">
          <Link to="/ordens/nova" className="flex items-center justify-center">
            <FilePlus className="h-4 w-4 mr-2" />
            Nova OS
          </Link>
        </Button>
      </div>
      
      <Tabs defaultValue="in-progress" className="w-full">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 mb-4 w-full">
          <TabsTrigger value="in-progress" className="text-xs sm:text-sm py-1.5">
            Em And. ({inProgressOrders.length})
          </TabsTrigger>
          <TabsTrigger value="draft" className="text-xs sm:text-sm py-1.5">
            Rasc. ({draftOrders.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-xs sm:text-sm py-1.5">
            Concl. ({completedOrders.length})
          </TabsTrigger>
          <TabsTrigger value="canceled" className="text-xs sm:text-sm py-1.5">
            Canc. ({canceledOrders.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="in-progress">
          <Card>
            <CardHeader className="pb-2 px-3 sm:px-6">
              <CardTitle className="text-lg sm:text-xl">Ordens em Andamento</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              {inProgressOrders.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  Não há ordens de serviço em andamento.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {inProgressOrders.map((order) => (
                    <div key={order.id} className="py-3 sm:py-4">
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <h3 className="font-medium text-base">{order.clientName}</h3>
                              <Badge variant="default" className="w-fit text-xs">Em Andamento</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {order.vehicle.model} ({order.vehicle.year}) - {order.vehicle.plate}
                            </p>
                            <p className="text-xs sm:text-sm">{order.serviceType}</p>
                            <p className="text-xs">
                              Criado em {formatDate(order.createdAt)}
                            </p>
                          </div>
                          <div className="flex flex-row sm:flex-col justify-between sm:items-end gap-2">
                            <p className="font-semibold">{formatCurrency(order.total)}</p>
                            
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" asChild className="h-8 w-8 p-0">
                                <Link to={`/ordens/${order.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => completeServiceOrder(order.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-36">
                                  <DropdownMenuItem asChild>
                                    <Link to={`/ordens/editar/${order.id}`}>
                                      <Pencil className="h-4 w-4 mr-2" />
                                      Editar
                                    </Link>
                                  </DropdownMenuItem>
                                  
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <DropdownMenuItem
                                        onSelect={(e) => e.preventDefault()}
                                        className="text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Excluir
                                      </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Esta ação não pode ser desfeita. Esta OS será excluída permanentemente.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => deleteServiceOrder(order.id)}
                                          className="bg-destructive text-destructive-foreground"
                                        >
                                          Excluir
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="draft">
          <Card>
            <CardHeader className="pb-2 px-3 sm:px-6">
              <CardTitle className="text-lg sm:text-xl">Rascunhos</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              {draftOrders.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  Não há rascunhos de ordens de serviço.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {draftOrders.map((order) => (
                    <div key={order.id} className="py-3 sm:py-4">
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <h3 className="font-medium text-base">{order.clientName}</h3>
                              <Badge variant="outline" className="w-fit text-xs">Rascunho</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {order.vehicle.model} ({order.vehicle.year}) - {order.vehicle.plate}
                            </p>
                            <p className="text-xs sm:text-sm">{order.serviceType}</p>
                            <p className="text-xs">
                              Criado em {formatDate(order.createdAt)}
                            </p>
                          </div>
                          <div className="flex flex-row sm:flex-col justify-between sm:items-end gap-2">
                            <p className="font-semibold">{formatCurrency(order.total)}</p>
                            
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" asChild className="h-8 w-8 p-0">
                                <Link to={`/ordens/${order.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              
                              <Button variant="outline" size="sm" asChild className="h-8 w-8 p-0">
                                <Link to={`/ordens/editar/${order.id}`}>
                                  <Pencil className="h-4 w-4" />
                                </Link>
                              </Button>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta ação não pode ser desfeita. Esta OS será excluída permanentemente.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteServiceOrder(order.id)}
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="completed">
          <Card>
            <CardHeader className="pb-2 px-3 sm:px-6">
              <CardTitle className="text-lg sm:text-xl">Serviços Concluídos</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              {completedOrders.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  Não há ordens de serviço concluídas.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {completedOrders.map((order) => (
                    <div key={order.id} className="py-3 sm:py-4">
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <h3 className="font-medium text-base">{order.clientName}</h3>
                              <Badge variant="success" className="w-fit text-xs">Concluído</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {order.vehicle.model} ({order.vehicle.year}) - {order.vehicle.plate}
                            </p>
                            <p className="text-xs sm:text-sm">{order.serviceType}</p>
                            <p className="text-xs">
                              Finalizado em {order.completedAt ? formatDate(order.completedAt) : "N/A"}
                            </p>
                          </div>
                          <div className="flex flex-row sm:flex-col justify-between sm:items-end gap-2">
                            <p className="font-semibold">{formatCurrency(order.total)}</p>
                            
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" asChild className="h-8 w-8 p-0">
                                <Link to={`/ordens/${order.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta ação não pode ser desfeita. Esta OS será excluída permanentemente.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteServiceOrder(order.id)}
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="canceled">
          <Card>
            <CardHeader className="pb-2 px-3 sm:px-6">
              <CardTitle className="text-lg sm:text-xl">Serviços Cancelados</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              {canceledOrders.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  Não há ordens de serviço canceladas.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {canceledOrders.map((order) => (
                    <div key={order.id} className="py-3 sm:py-4">
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <h3 className="font-medium text-base">{order.clientName}</h3>
                              <Badge variant="destructive" className="w-fit text-xs">Cancelado</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {order.vehicle.model} ({order.vehicle.year}) - {order.vehicle.plate}
                            </p>
                            <p className="text-xs sm:text-sm">{order.serviceType}</p>
                            <p className="text-xs">
                              Cancelado em {formatDate(order.updatedAt)}
                            </p>
                          </div>
                          <div className="flex flex-row sm:flex-col justify-between sm:items-end gap-2">
                            <p className="font-semibold">{formatCurrency(order.total)}</p>
                            
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" asChild className="h-8 w-8 p-0">
                                <Link to={`/ordens/${order.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta ação não pode ser desfeita. Esta OS será excluída permanentemente.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteServiceOrder(order.id)}
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

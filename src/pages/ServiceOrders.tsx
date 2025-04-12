
import { useApp } from "@/context/AppContext";
import { ServiceStatus } from "@/types";
import { formatCurrency } from "@/utils/mockData";
import { Eye, FilePlus, Pencil, Trash2 } from "lucide-react";
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ordens de Serviço</h1>
          <p className="text-muted-foreground">
            Gerencie as ordens de serviço da oficina
          </p>
        </div>
        <Button asChild>
          <Link to="/ordens/nova">
            <FilePlus className="h-4 w-4 mr-2" />
            Nova OS
          </Link>
        </Button>
      </div>
      
      <Tabs defaultValue="in-progress">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="in-progress">
            Em Andamento ({inProgressOrders.length})
          </TabsTrigger>
          <TabsTrigger value="draft">
            Rascunhos ({draftOrders.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Concluídos ({completedOrders.length})
          </TabsTrigger>
          <TabsTrigger value="canceled">
            Cancelados ({canceledOrders.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="in-progress" className="mt-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Ordens em Andamento</CardTitle>
            </CardHeader>
            <CardContent>
              {inProgressOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Não há ordens de serviço em andamento.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {inProgressOrders.map((order) => (
                    <div key={order.id} className="py-4">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <h3 className="font-medium">{order.clientName}</h3>
                            <Badge variant="default">Em Andamento</Badge>
                          </div>
                          <p className="text-muted-foreground">
                            {order.vehicle.model} ({order.vehicle.year}) - {order.vehicle.plate}
                          </p>
                          <p className="text-sm">{order.serviceType}</p>
                          <p className="text-sm">
                            Criado em {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="flex flex-col justify-between items-end gap-2">
                          <p className="font-semibold">{formatCurrency(order.total)}</p>
                          <div className="flex gap-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">Ações</Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link to={`/ordens/${order.id}`}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Ver Detalhes
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link to={`/ordens/editar/${order.id}`}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Editar
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => completeServiceOrder(order.id)}
                                >
                                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  Finalizar Serviço
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
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="draft" className="mt-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Rascunhos</CardTitle>
            </CardHeader>
            <CardContent>
              {draftOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Não há rascunhos de ordens de serviço.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {draftOrders.map((order) => (
                    <div key={order.id} className="py-4">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <h3 className="font-medium">{order.clientName}</h3>
                            <Badge variant="outline">Rascunho</Badge>
                          </div>
                          <p className="text-muted-foreground">
                            {order.vehicle.model} ({order.vehicle.year}) - {order.vehicle.plate}
                          </p>
                          <p className="text-sm">{order.serviceType}</p>
                          <p className="text-sm">
                            Criado em {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="flex flex-col justify-between items-end gap-2">
                          <p className="font-semibold">{formatCurrency(order.total)}</p>
                          <div className="flex gap-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">Ações</Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link to={`/ordens/${order.id}`}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Ver Detalhes
                                  </Link>
                                </DropdownMenuItem>
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
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="completed" className="mt-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Serviços Concluídos</CardTitle>
            </CardHeader>
            <CardContent>
              {completedOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Não há ordens de serviço concluídas.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {completedOrders.map((order) => (
                    <div key={order.id} className="py-4">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <h3 className="font-medium">{order.clientName}</h3>
                            <Badge variant="success">Concluído</Badge>
                          </div>
                          <p className="text-muted-foreground">
                            {order.vehicle.model} ({order.vehicle.year}) - {order.vehicle.plate}
                          </p>
                          <p className="text-sm">{order.serviceType}</p>
                          <p className="text-sm">
                            Finalizado em {order.completedAt ? formatDate(order.completedAt) : "N/A"}
                          </p>
                        </div>
                        <div className="flex flex-col justify-between items-end gap-2">
                          <p className="font-semibold">{formatCurrency(order.total)}</p>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/ordens/${order.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Detalhes
                              </Link>
                            </Button>
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
        
        <TabsContent value="canceled" className="mt-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Serviços Cancelados</CardTitle>
            </CardHeader>
            <CardContent>
              {canceledOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Não há ordens de serviço canceladas.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {canceledOrders.map((order) => (
                    <div key={order.id} className="py-4">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <h3 className="font-medium">{order.clientName}</h3>
                            <Badge variant="destructive">Cancelado</Badge>
                          </div>
                          <p className="text-muted-foreground">
                            {order.vehicle.model} ({order.vehicle.year}) - {order.vehicle.plate}
                          </p>
                          <p className="text-sm">{order.serviceType}</p>
                          <p className="text-sm">
                            Cancelado em {formatDate(order.updatedAt)}
                          </p>
                        </div>
                        <div className="flex flex-col justify-between items-end gap-2">
                          <p className="font-semibold">{formatCurrency(order.total)}</p>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/ordens/${order.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Detalhes
                              </Link>
                            </Button>
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

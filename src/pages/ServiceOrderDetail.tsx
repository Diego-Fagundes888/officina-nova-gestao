
import { useParams, Link, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { formatCurrency } from "@/utils/mockData";
import { ServiceStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, Calendar, Car, Clock, Pencil, Tool, UserCircle } from "lucide-react";

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

export default function ServiceOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { serviceOrders, completeServiceOrder } = useApp();
  
  const order = serviceOrders.find(order => order.id === id);
  
  if (!order) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ordem de Serviço não encontrada</h1>
          <p className="text-muted-foreground">
            A ordem de serviço que você está procurando não existe ou foi removida.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/ordens">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Ordens de Serviço
          </Link>
        </Button>
      </div>
    );
  }
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };
  
  const { variant, label } = statusLabels[order.status];
  
  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold tracking-tight">
              Ordem de Serviço #{order.id.substring(0, 6)}
            </h1>
            <Badge variant={variant}>{label}</Badge>
          </div>
          <p className="text-muted-foreground">
            Criada em {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/ordens">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
          {order.status === ServiceStatus.IN_PROGRESS && (
            <>
              <Button variant="outline" asChild>
                <Link to={`/ordens/editar/${order.id}`}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </Link>
              </Button>
              <Button onClick={() => {
                completeServiceOrder(order.id);
                navigate("/ordens");
              }}>
                Finalizar Serviço
              </Button>
            </>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <UserCircle className="h-5 w-5 mr-2" />
              Informações do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Cliente</h3>
              <p className="text-lg font-medium">{order.clientName}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Tipo de Serviço</h3>
              <p className="text-lg font-medium">{order.serviceType}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Car className="h-5 w-5 mr-2" />
              Dados do Veículo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Modelo</h3>
              <p className="text-lg font-medium">{order.vehicle.model}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Ano</h3>
                <p className="text-lg font-medium">{order.vehicle.year}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Placa</h3>
                <p className="text-lg font-medium">{order.vehicle.plate}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <Tool className="h-5 w-5 mr-2" />
            Peças e Serviços
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.parts.length > 0 ? (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Peças Utilizadas</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-secondary">
                        <th className="px-4 py-2 text-left font-medium">Descrição</th>
                        <th className="px-4 py-2 text-right font-medium">Preço Unit.</th>
                        <th className="px-4 py-2 text-center font-medium">Qtd.</th>
                        <th className="px-4 py-2 text-right font-medium">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {order.parts.map((part) => (
                        <tr key={part.id}>
                          <td className="px-4 py-3">{part.name}</td>
                          <td className="px-4 py-3 text-right">{formatCurrency(part.price)}</td>
                          <td className="px-4 py-3 text-center">{part.quantity}</td>
                          <td className="px-4 py-3 text-right">{formatCurrency(part.price * part.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Peças Utilizadas</h3>
                <p className="text-muted-foreground text-sm py-2">Nenhuma peça utilizada nesta ordem de serviço.</p>
              </div>
            )}
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Detalhes do Serviço</h3>
              <dl className="divide-y divide-border">
                <div className="grid grid-cols-2 py-3">
                  <dt className="font-medium">Mão de Obra</dt>
                  <dd className="text-right">{formatCurrency(order.laborCost)}</dd>
                </div>
                <div className="grid grid-cols-2 py-3">
                  <dt className="font-medium">Valor das Peças</dt>
                  <dd className="text-right">
                    {formatCurrency(
                      order.parts.reduce((sum, part) => sum + part.price * part.quantity, 0)
                    )}
                  </dd>
                </div>
                <div className="grid grid-cols-2 py-3">
                  <dt className="text-lg font-semibold">Total</dt>
                  <dd className="text-right text-lg font-bold">{formatCurrency(order.total)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Histórico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="relative">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-foreground">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="absolute top-8 bottom-0 left-1/2 w-px -translate-x-1/2 bg-border"></div>
              </div>
              <div>
                <p className="font-medium">Ordem de serviço criada</p>
                <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
              </div>
            </div>
            
            {order.status === ServiceStatus.COMPLETED && order.completedAt && (
              <div className="flex items-start space-x-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Serviço finalizado</p>
                  <p className="text-sm text-muted-foreground">{formatDate(order.completedAt)}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

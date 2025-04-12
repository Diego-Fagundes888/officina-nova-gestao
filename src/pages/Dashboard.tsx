
import CardStats from "@/components/CardStats";
import { useApp } from "@/context/AppContext";
import { ServiceStatus } from "@/types";
import { formatCurrency, getDailyRevenue } from "@/utils/mockData";
import { BarChart3, Car, Clock, DollarSign, Wrench, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { serviceOrders, completeServiceOrder } = useApp();
  
  const today = new Date();
  const formattedDate = format(today, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
  
  const inProgressOrders = serviceOrders.filter(
    (order) => order.status === ServiceStatus.IN_PROGRESS
  );
  
  const completedToday = serviceOrders.filter(
    (order) => 
      order.status === ServiceStatus.COMPLETED && 
      order.completedAt && 
      new Date(order.completedAt).toDateString() === today.toDateString()
  );
  
  const dailyRevenue = getDailyRevenue();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground capitalize">{formattedDate}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <CardStats 
          title="Serviços em Andamento" 
          value={String(inProgressOrders.length)}
          icon={Wrench}
          description="Ordens de serviço ativas"
        />
        
        <CardStats 
          title="Serviços Concluídos Hoje" 
          value={String(completedToday.length)}
          icon={CheckCircle}
          description="Finalizados no dia de hoje"
        />
        
        <CardStats 
          title="Receita Diária" 
          value={formatCurrency(dailyRevenue)}
          icon={DollarSign}
          description="Total faturado hoje"
        />
      </div>
      
      <Card className="border border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Serviços em Andamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          {inProgressOrders.length > 0 ? (
            <div className="divide-y divide-border">
              {inProgressOrders.map((order) => (
                <div key={order.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="font-medium">{order.clientName}</h4>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Car className="mr-1 h-4 w-4" />
                        {order.vehicle.model} ({order.vehicle.year}) - {order.vehicle.plate}
                      </div>
                      <p className="text-sm">{order.serviceType}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link to={`/ordens/${order.id}`}>
                          Ver Detalhes
                        </Link>
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => completeServiceOrder(order.id)}
                      >
                        Finalizar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground py-4">Não há serviços em andamento no momento.</p>
          )}
        </CardContent>
      </Card>
      
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center">
          <BarChart3 className="mr-2 h-5 w-5" />
          Resumo de Atividades
        </h2>
        <Button variant="outline" asChild>
          <Link to="/financeiro">Ver Relatório Completo</Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="border border-border bg-card lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Próximos Agendamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-right">
              <Button variant="link" size="sm" asChild className="h-auto p-0">
                <Link to="/agenda">Ver Todos</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-right">
              <Button variant="link" size="sm" asChild className="h-auto p-0">
                <Link to="/pecas">Gerenciar</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

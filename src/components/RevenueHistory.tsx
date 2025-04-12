
import { useApp } from "@/context/AppContext";
import { ServiceStatus } from "@/types";
import { formatCurrency } from "@/utils/mockData";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function RevenueHistory() {
  const { serviceOrders } = useApp();

  // Obter todos os serviços concluídos e ordená-los pela data de conclusão (mais recente primeiro)
  const completedOrders = serviceOrders
    .filter((order) => order.status === ServiceStatus.COMPLETED && order.completedAt)
    .sort((a, b) => {
      if (!a.completedAt || !b.completedAt) return 0;
      return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
    });

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: format(date, "dd/MM/yyyy", { locale: ptBR }),
      time: format(date, "HH:mm", { locale: ptBR })
    };
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-xl font-semibold">
          <CheckCircle className="mr-2 h-5 w-5" />
          Histórico de Receitas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {completedOrders.length === 0 ? (
          <p className="text-center py-4 text-muted-foreground">
            Nenhum serviço finalizado até o momento.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {completedOrders.map((order) => {
              const datetime = order.completedAt ? formatDateTime(order.completedAt) : { date: "-", time: "-" };
              
              return (
                <div key={order.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-medium">{order.clientName}</h4>
                        <span className="text-xs px-2 py-0.5 bg-secondary rounded-full">
                          {order.vehicle.model} ({order.vehicle.plate})
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{order.serviceType}</p>
                    </div>
                    <div className="flex flex-col items-end mt-2 sm:mt-0">
                      <p className="font-semibold text-green-500">
                        {formatCurrency(order.total)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {datetime.date} às {datetime.time}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

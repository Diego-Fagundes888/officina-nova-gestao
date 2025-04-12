
import { useApp } from "@/context/AppContext";
import { ServiceStatus } from "@/types";
import { formatCurrency } from "@/utils/mockData";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export default function RevenueHistory() {
  const { serviceOrders, deleteServiceOrder } = useApp();

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
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg sm:text-xl font-semibold">
          <CheckCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          Histórico de Receitas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {completedOrders.length === 0 ? (
          <p className="text-center py-4 text-muted-foreground">
            Nenhum serviço finalizado até o momento.
          </p>
        ) : (
          <div className="divide-y divide-border overflow-x-auto">
            {completedOrders.map((order) => {
              const datetime = order.completedAt ? formatDateTime(order.completedAt) : { date: "-", time: "-" };
              
              return (
                <div key={order.id} className="py-3 sm:py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-medium text-sm sm:text-base">{order.clientName}</h4>
                        <span className="text-xs px-2 py-0.5 bg-secondary rounded-full truncate max-w-[150px] sm:max-w-none">
                          {order.vehicle.model} ({order.vehicle.plate})
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">{order.serviceType}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1 sm:mt-0">
                      <p className="font-semibold text-green-500 text-sm sm:text-base">
                        {formatCurrency(order.total)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {datetime.date} às {datetime.time}
                      </p>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir este registro de receita? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-red-500 hover:bg-red-600"
                              onClick={() => deleteServiceOrder(order.id)}
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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


import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { ServiceStatus } from "@/types";
import { formatCurrency } from "@/utils/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";

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

export default function History() {
  const { serviceOrders } = useApp();
  const [search, setSearch] = useState("");
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  };
  
  const filteredOrders = serviceOrders.filter((order) => {
    const searchLower = search.toLowerCase();
    return (
      order.clientName.toLowerCase().includes(searchLower) ||
      order.vehicle.model.toLowerCase().includes(searchLower) ||
      order.vehicle.plate.toLowerCase().includes(searchLower) ||
      order.serviceType.toLowerCase().includes(searchLower)
    );
  });
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Histórico de Serviços</h1>
        <p className="text-muted-foreground">
          Visualize todas as ordens de serviço registradas
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Buscar por cliente, veículo ou serviço..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Histórico Completo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      {search
                        ? "Nenhum resultado encontrado para sua busca."
                        : "Nenhuma ordem de serviço registrada."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.clientName}</TableCell>
                      <TableCell>
                        {order.vehicle.model} ({order.vehicle.plate})
                      </TableCell>
                      <TableCell>{order.serviceType}</TableCell>
                      <TableCell>
                        {order.status === ServiceStatus.COMPLETED
                          ? order.completedAt 
                            ? formatDate(order.completedAt)
                            : formatDate(order.updatedAt)
                          : formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusLabels[order.status].variant}>
                          {statusLabels[order.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(order.total)}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/ordens/${order.id}`}>
                            <span className="sr-only">Ver detalhes</span>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

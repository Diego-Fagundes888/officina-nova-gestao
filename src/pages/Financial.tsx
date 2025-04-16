
import { useApp } from "@/context/AppContext";
import { 
  formatCurrency, 
  getWeeklyRevenue, 
  getMonthlyRevenue,
  getRevenueChartData
} from "@/utils/mockData";
import { useState } from "react";
import { DollarSign, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import CardStats from "@/components/CardStats";
import RevenueHistory from "@/components/RevenueHistory";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ServiceStatus } from "@/types";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function Financial() {
  const { serviceOrders } = useApp();
  const [chartView, setChartView] = useState<"daily" | "weekly" | "monthly">("daily");
  
  const today = new Date();
  const completedToday = serviceOrders.filter(
    (order) => 
      order.status === ServiceStatus.COMPLETED && 
      order.completedAt && 
      new Date(order.completedAt).toDateString() === today.toDateString()
  );
  const dailyRevenue = completedToday.reduce((sum, order) => sum + order.total, 0);
  
  const weeklyRevenue = getWeeklyRevenue();
  const monthlyRevenue = getMonthlyRevenue();
  const chartData = getRevenueChartData();
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-muted-foreground">
            Acompanhe as finanças da sua oficina
          </p>
        </div>
        
        <ToggleGroup type="single" value={chartView} onValueChange={(value) => {
          if (value) setChartView(value as "daily" | "weekly" | "monthly");
        }}>
          <ToggleGroupItem value="daily" aria-label="Daily view">Diário</ToggleGroupItem>
          <ToggleGroupItem value="weekly" aria-label="Weekly view">Semanal</ToggleGroupItem>
          <ToggleGroupItem value="monthly" aria-label="Monthly view">Mensal</ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CardStats 
          title="Receita Diária" 
          value={formatCurrency(dailyRevenue)}
          icon={TrendingUp}
          description="Total recebido hoje"
          className="border-l-4 border-l-green-500"
        />
        
        <CardStats 
          title="Receita Semanal" 
          value={formatCurrency(weeklyRevenue)}
          icon={TrendingUp}
          description="Total dos últimos 7 dias"
          className="border-l-4 border-l-blue-500"
        />
        
        <CardStats 
          title="Receita Mensal" 
          value={formatCurrency(monthlyRevenue)}
          icon={DollarSign}
          description="Total do mês atual"
          className="border-l-4 border-l-purple-500"
        />
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Receitas (Últimos 7 dias)</CardTitle>
          <CardDescription>
            Visualização das receitas nos últimos dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
                />
                <Legend />
                <Bar dataKey="revenue" name="Receitas" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <RevenueHistory />
      
      <Tabs defaultValue="monthly">
        <TabsList className="grid w-full md:w-auto grid-cols-3">
          <TabsTrigger value="daily">Diário</TabsTrigger>
          <TabsTrigger value="weekly">Semanal</TabsTrigger>
          <TabsTrigger value="monthly">Mensal</TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily" className="mt-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Resumo Diário</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Receita Total</p>
                  <p className="text-2xl font-bold text-green-500">{formatCurrency(dailyRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="weekly" className="mt-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Resumo Semanal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Receita Total</p>
                  <p className="text-2xl font-bold text-green-500">{formatCurrency(weeklyRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="monthly" className="mt-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Resumo Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Receita Total</p>
                  <p className="text-2xl font-bold text-green-500">{formatCurrency(monthlyRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

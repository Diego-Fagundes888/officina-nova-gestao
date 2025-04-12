import { useApp } from "@/context/AppContext";
import { 
  formatCurrency, 
  getWeeklyRevenue, 
  getMonthlyRevenue,
  getDailyExpenses,
  getMonthlyExpenses,
  getRevenueChartData
} from "@/utils/mockData";
import { useState } from "react";
import { DollarSign, PlusCircle, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import CardStats from "@/components/CardStats";
import RevenueHistory from "@/components/RevenueHistory";
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ServiceStatus } from "@/types";

export default function Financial() {
  const { expenses, addExpense, deleteExpense, serviceOrders } = useApp();
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    category: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  
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
  const dailyExpenses = getDailyExpenses();
  const monthlyExpenses = getMonthlyExpenses();
  const chartData = getRevenueChartData();
  
  const calculateNetProfit = (revenue: number, expenses: number) => {
    return revenue - expenses;
  };
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  };
  
  const handleExpenseSubmit = () => {
    if (newExpense.description && newExpense.amount && newExpense.category) {
      addExpense({
        description: newExpense.description,
        amount: Number(newExpense.amount),
        date: new Date().toISOString(),
        category: newExpense.category,
      });
      
      setNewExpense({
        description: "",
        amount: "",
        category: "",
      });
      
      setIsDialogOpen(false);
    }
  };

  const handleDeleteExpense = (id: string) => {
    console.log("Excluindo despesa com ID:", id);
    if (id) {
      deleteExpense(id);
    }
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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Nova Despesa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Nova Despesa</DialogTitle>
              <DialogDescription>
                Preencha os dados da despesa para registrá-la no sistema.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  placeholder="Ex: Compra de ferramentas"
                  value={newExpense.description}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Ex: 150.00"
                  value={newExpense.amount}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, amount: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  placeholder="Ex: Ferramentas, Aluguel, Materiais"
                  value={newExpense.category}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, category: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleExpenseSubmit}>Salvar Despesa</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <CardStats 
          title="Receita Diária" 
          value={formatCurrency(dailyRevenue)}
          icon={TrendingUp}
          description="Total recebido hoje"
          className="border-l-4 border-l-green-500"
        />
        
        <CardStats 
          title="Despesas do Dia" 
          value={formatCurrency(dailyExpenses)}
          icon={TrendingDown}
          description="Total gasto hoje"
          className="border-l-4 border-l-red-500"
        />
        
        <CardStats 
          title="Balanço do Dia" 
          value={formatCurrency(calculateNetProfit(dailyRevenue, dailyExpenses))}
          icon={DollarSign}
          description="Lucro líquido de hoje"
          className="border-l-4 border-l-blue-500"
        />
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Receitas x Despesas (Últimos 7 dias)</CardTitle>
          <CardDescription>
            Comparativo entre receitas e despesas nos últimos dias
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
                <Bar dataKey="expenses" name="Despesas" fill="#ef4444" />
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Receita Total</p>
                    <p className="text-2xl font-bold text-green-500">{formatCurrency(dailyRevenue)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Despesas Totais</p>
                    <p className="text-2xl font-bold text-red-500">{formatCurrency(dailyExpenses)}</p>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <p className="font-medium">Lucro Líquido (Receitas - Despesas)</p>
                    <p className={`text-xl font-bold ${
                      calculateNetProfit(dailyRevenue, dailyExpenses) >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}>
                      {formatCurrency(calculateNetProfit(dailyRevenue, dailyExpenses))}
                    </p>
                  </div>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Receita Total</p>
                    <p className="text-2xl font-bold text-green-500">{formatCurrency(weeklyRevenue)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Despesas Totais</p>
                    <p className="text-2xl font-bold text-red-500">
                      {formatCurrency(
                        chartData.reduce((sum, day) => sum + day.expenses, 0)
                      )}
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <p className="font-medium">Lucro Líquido (Receitas - Despesas)</p>
                    <p className={`text-xl font-bold ${
                      calculateNetProfit(
                        weeklyRevenue,
                        chartData.reduce((sum, day) => sum + day.expenses, 0)
                      ) >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}>
                      {formatCurrency(
                        calculateNetProfit(
                          weeklyRevenue,
                          chartData.reduce((sum, day) => sum + day.expenses, 0)
                        )
                      )}
                    </p>
                  </div>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Receita Total</p>
                    <p className="text-2xl font-bold text-green-500">{formatCurrency(monthlyRevenue)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Despesas Totais</p>
                    <p className="text-2xl font-bold text-red-500">{formatCurrency(monthlyExpenses)}</p>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <p className="font-medium">Lucro Líquido (Receitas - Despesas)</p>
                    <p className={`text-xl font-bold ${
                      calculateNetProfit(monthlyRevenue, monthlyExpenses) >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}>
                      {formatCurrency(calculateNetProfit(monthlyRevenue, monthlyExpenses))}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Registro de Despesas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Não há despesas registradas.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {expenses
                .slice()
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5)
                .map((expense) => (
                  <div key={expense.id} className="py-4">
                    <div className="flex justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="font-medium">{expense.description}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(expense.date)} • {expense.category}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-red-500">
                          {formatCurrency(expense.amount)}
                        </p>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir esta despesa? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>
                                Cancelar
                              </AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-red-500 hover:bg-red-600"
                                onClick={() => expense.id && handleDeleteExpense(expense.id)}
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
  );
}

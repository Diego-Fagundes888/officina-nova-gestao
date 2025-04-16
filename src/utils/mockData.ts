import { ServiceOrder, ServiceStatus, InventoryItem, Appointment, Expense, AppointmentStatus } from "@/types";
import { addDays, format } from "date-fns";

// Generate random ID
export const generateId = () => Math.random().toString(36).substring(2, 11);

// Format currency
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Sample service orders
export const mockServiceOrders: ServiceOrder[] = [
  {
    id: generateId(),
    clientName: "João Silva",
    vehicle: {
      model: "Fiat Uno",
      year: "2018",
      plate: "ABC-1234",
    },
    serviceType: "Troca de óleo e filtros",
    parts: [
      { id: generateId(), name: "Óleo 5W30", price: 35, quantity: 4 },
      { id: generateId(), name: "Filtro de óleo", price: 25, quantity: 1 },
      { id: generateId(), name: "Filtro de ar", price: 45, quantity: 1 },
    ],
    laborCost: 80,
    total: 290,
    status: ServiceStatus.IN_PROGRESS,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    clientName: "Maria Oliveira",
    vehicle: {
      model: "Honda Fit",
      year: "2020",
      plate: "DEF-5678",
    },
    serviceType: "Revisão completa",
    parts: [
      { id: generateId(), name: "Óleo 5W30", price: 35, quantity: 4 },
      { id: generateId(), name: "Filtro de óleo", price: 30, quantity: 1 },
      { id: generateId(), name: "Filtro de ar", price: 50, quantity: 1 },
      { id: generateId(), name: "Filtro de combustível", price: 80, quantity: 1 },
      { id: generateId(), name: "Filtro de ar condicionado", price: 60, quantity: 1 },
    ],
    laborCost: 150,
    total: 460,
    status: ServiceStatus.COMPLETED,
    createdAt: addDays(new Date(), -2).toISOString(),
    updatedAt: addDays(new Date(), -1).toISOString(),
    completedAt: addDays(new Date(), -1).toISOString(),
  },
  {
    id: generateId(),
    clientName: "Carlos Pereira",
    vehicle: {
      model: "VW Golf",
      year: "2019",
      plate: "GHI-9012",
    },
    serviceType: "Troca de pastilhas de freio",
    parts: [
      { id: generateId(), name: "Jogo de pastilhas dianteiras", price: 180, quantity: 1 },
      { id: generateId(), name: "Fluido de freio DOT4", price: 40, quantity: 1 },
    ],
    laborCost: 120,
    total: 340,
    status: ServiceStatus.IN_PROGRESS,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    clientName: "Ana Santos",
    vehicle: {
      model: "Toyota Corolla",
      year: "2021",
      plate: "JKL-3456",
    },
    serviceType: "Alinhamento e balanceamento",
    parts: [],
    laborCost: 150,
    total: 150,
    status: ServiceStatus.DRAFT,
    createdAt: addDays(new Date(), -1).toISOString(),
    updatedAt: addDays(new Date(), -1).toISOString(),
  },
];

// Sample inventory items
export const mockInventory: InventoryItem[] = [
  {
    id: generateId(),
    name: "Óleo 5W30 (1L)",
    purchase_price: 25,
    selling_price: 35,
    stock: 20,
    min_stock: 5
  },
  {
    id: generateId(),
    name: "Filtro de óleo universal",
    purchase_price: 18,
    selling_price: 25,
    stock: 15,
    min_stock: 5
  },
  {
    id: generateId(),
    name: "Filtro de ar universal",
    purchase_price: 35,
    selling_price: 50,
    stock: 10,
    min_stock: 5
  },
  {
    id: generateId(),
    name: "Pastilhas de freio dianteiras",
    purchase_price: 120,
    selling_price: 180,
    stock: 6,
    min_stock: 5
  },
  {
    id: generateId(),
    name: "Fluido de freio DOT4 (500ml)",
    purchase_price: 30,
    selling_price: 45,
    stock: 8,
    min_stock: 5
  },
];

// Sample appointments
export const mockAppointments: Appointment[] = [
  {
    id: generateId(),
    clientName: "Roberto Campos",
    vehicle: {
      model: "Hyundai HB20",
      year: "2020",
      plate: "MNO-7890",
    },
    serviceType: "Troca de óleo",
    date: addDays(new Date(), 1).toISOString(),
    time: "09:30",
    notes: "Cliente solicitou uso de óleo sintético",
    status: AppointmentStatus.AGENDADO,
  },
  {
    id: generateId(),
    clientName: "Fernanda Lima",
    vehicle: {
      model: "Jeep Renegade",
      year: "2019",
      plate: "PQR-1234",
    },
    serviceType: "Revisão de 40.000km",
    date: addDays(new Date(), 2).toISOString(),
    time: "14:00",
    status: AppointmentStatus.AGENDADO,
  },
  {
    id: generateId(),
    clientName: "Lucas Mendes",
    vehicle: {
      model: "Nissan Kicks",
      year: "2021",
      plate: "STU-5678",
    },
    serviceType: "Reparo no ar condicionado",
    date: addDays(new Date(), 2).toISOString(),
    time: "16:30",
    status: AppointmentStatus.AGENDADO,
  },
];

// Sample expenses
export const mockExpenses: Expense[] = [
  {
    id: generateId(),
    description: "Compra de ferramentas",
    amount: 450,
    date: addDays(new Date(), -10).toISOString(),
    category: "Equipamentos",
  },
  {
    id: generateId(),
    description: "Reposição de estoque",
    amount: 1200,
    date: addDays(new Date(), -5).toISOString(),
    category: "Peças",
  },
  {
    id: generateId(),
    description: "Conta de energia",
    amount: 380,
    date: addDays(new Date(), -2).toISOString(),
    category: "Utilidades",
  },
];

// Get weekly revenue
export const getWeeklyRevenue = () => {
  const oneWeekAgo = addDays(new Date(), -7);
  
  const completed = mockServiceOrders.filter(
    (order) => order.status === ServiceStatus.COMPLETED &&
    new Date(order.completedAt || "") >= oneWeekAgo
  );
  
  return completed.reduce((sum, order) => sum + order.total, 0);
};

// Get monthly revenue
export const getMonthlyRevenue = () => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const completed = mockServiceOrders.filter((order) => {
    if (order.status !== ServiceStatus.COMPLETED || !order.completedAt) return false;
    const date = new Date(order.completedAt);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });
  
  return completed.reduce((sum, order) => sum + order.total, 0);
};

// Get daily expenses
export const getDailyExpenses = () => {
  const today = mockExpenses.filter(
    (expense) => new Date(expense.date).toDateString() === new Date().toDateString()
  );
  
  return today.reduce((sum, expense) => sum + expense.amount, 0);
};

// Get current month expenses
export const getMonthlyExpenses = () => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const thisMonth = mockExpenses.filter((expense) => {
    const date = new Date(expense.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });
  
  return thisMonth.reduce((sum, expense) => sum + expense.amount, 0);
};

// Generate data for charts (last 7 days)
export const getRevenueChartData = () => {
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(new Date(), -6 + i);
    return {
      date: format(date, 'dd/MM'),
      revenue: 0,
      expenses: 0,
    };
  });
  
  mockServiceOrders.forEach((order) => {
    if (order.status !== ServiceStatus.COMPLETED || !order.completedAt) return;
    
    const orderDate = new Date(order.completedAt);
    const orderDateStr = format(orderDate, 'dd/MM');
    
    const dayIndex = days.findIndex((day) => day.date === orderDateStr);
    if (dayIndex >= 0) {
      days[dayIndex].revenue += order.total;
    }
  });
  
  mockExpenses.forEach((expense) => {
    const expenseDate = new Date(expense.date);
    const expenseDateStr = format(expenseDate, 'dd/MM');
    
    const dayIndex = days.findIndex((day) => day.date === expenseDateStr);
    if (dayIndex >= 0) {
      days[dayIndex].expenses += expense.amount;
    }
  });
  
  return days;
};


import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { ServiceOrder, Appointment, InventoryItem, Expense, ServiceStatus } from "@/types";
import { 
  mockServiceOrders, 
  mockAppointments, 
  mockInventory,
  mockExpenses, 
  generateId 
} from "@/utils/mockData";
import { toast } from "sonner";

interface AppContextProps {
  serviceOrders: ServiceOrder[];
  appointments: Appointment[];
  inventory: InventoryItem[];
  expenses: Expense[];
  addServiceOrder: (order: Omit<ServiceOrder, "id" | "createdAt" | "updatedAt">) => void;
  updateServiceOrder: (id: string, order: Partial<ServiceOrder>) => void;
  deleteServiceOrder: (id: string) => void;
  completeServiceOrder: (id: string) => void;
  addAppointment: (appointment: Omit<Appointment, "id">) => void;
  updateAppointment: (id: string, appointment: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  addInventoryItem: (item: Omit<InventoryItem, "id">) => void;
  updateInventoryItem: (id: string, item: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;
  addExpense: (expense: Omit<Expense, "id">) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>(mockServiceOrders);
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem("serviceOrders", JSON.stringify(serviceOrders));
  }, [serviceOrders]);

  useEffect(() => {
    localStorage.setItem("appointments", JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem("inventory", JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  // Initialize from localStorage if available
  useEffect(() => {
    const savedServiceOrders = localStorage.getItem("serviceOrders");
    if (savedServiceOrders) {
      setServiceOrders(JSON.parse(savedServiceOrders));
    }

    const savedAppointments = localStorage.getItem("appointments");
    if (savedAppointments) {
      setAppointments(JSON.parse(savedAppointments));
    }

    const savedInventory = localStorage.getItem("inventory");
    if (savedInventory) {
      setInventory(JSON.parse(savedInventory));
    }

    const savedExpenses = localStorage.getItem("expenses");
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
  }, []);

  const addServiceOrder = (order: Omit<ServiceOrder, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    const newOrder: ServiceOrder = {
      ...order,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setServiceOrders([...serviceOrders, newOrder]);
    toast.success("Ordem de serviço criada com sucesso!");
  };

  const updateServiceOrder = (id: string, order: Partial<ServiceOrder>) => {
    setServiceOrders(serviceOrders.map(item => 
      item.id === id 
        ? { ...item, ...order, updatedAt: new Date().toISOString() } 
        : item
    ));
    toast.success("Ordem de serviço atualizada!");
  };

  const deleteServiceOrder = (id: string) => {
    setServiceOrders(serviceOrders.filter(item => item.id !== id));
    toast.success("Ordem de serviço excluída!");
  };

  const completeServiceOrder = (id: string) => {
    setServiceOrders(serviceOrders.map(item => 
      item.id === id 
        ? { 
            ...item, 
            status: ServiceStatus.COMPLETED, 
            updatedAt: new Date().toISOString(),
            completedAt: new Date().toISOString()
          } 
        : item
    ));
    toast.success("Ordem de serviço finalizada com sucesso!");
  };

  const addAppointment = (appointment: Omit<Appointment, "id">) => {
    const newAppointment: Appointment = {
      ...appointment,
      id: generateId(),
    };
    setAppointments([...appointments, newAppointment]);
    toast.success("Agendamento criado com sucesso!");
  };

  const updateAppointment = (id: string, appointment: Partial<Appointment>) => {
    setAppointments(appointments.map(item => 
      item.id === id ? { ...item, ...appointment } : item
    ));
    toast.success("Agendamento atualizado!");
  };

  const deleteAppointment = (id: string) => {
    setAppointments(appointments.filter(item => item.id !== id));
    toast.success("Agendamento excluído!");
  };

  const addInventoryItem = (item: Omit<InventoryItem, "id">) => {
    const newItem: InventoryItem = {
      ...item,
      id: generateId(),
    };
    setInventory([...inventory, newItem]);
    toast.success("Item de estoque adicionado!");
  };

  const updateInventoryItem = (id: string, item: Partial<InventoryItem>) => {
    setInventory(inventory.map(inventoryItem => 
      inventoryItem.id === id ? { ...inventoryItem, ...item } : inventoryItem
    ));
    toast.success("Item de estoque atualizado!");
  };

  const deleteInventoryItem = (id: string) => {
    setInventory(inventory.filter(item => item.id !== id));
    toast.success("Item de estoque excluído!");
  };

  const addExpense = (expense: Omit<Expense, "id">) => {
    const newExpense: Expense = {
      ...expense,
      id: generateId(),
    };
    setExpenses([...expenses, newExpense]);
    toast.success("Despesa adicionada com sucesso!");
  };

  const updateExpense = (id: string, expense: Partial<Expense>) => {
    setExpenses(expenses.map(item => 
      item.id === id ? { ...item, ...expense } : item
    ));
    toast.success("Despesa atualizada!");
  };

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter(item => item.id !== id));
    toast.success("Despesa excluída!");
  };

  return (
    <AppContext.Provider
      value={{
        serviceOrders,
        appointments,
        inventory,
        expenses,
        addServiceOrder,
        updateServiceOrder,
        deleteServiceOrder,
        completeServiceOrder,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        addExpense,
        updateExpense,
        deleteExpense,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

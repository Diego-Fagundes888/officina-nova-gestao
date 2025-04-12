
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { ServiceOrder, Appointment, InventoryItem, Expense, ServiceStatus } from "@/types";
import { mockServiceOrders, mockAppointments, mockExpenses, generateId } from "@/utils/mockData";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AppContextProps {
  serviceOrders: ServiceOrder[];
  appointments: Appointment[];
  inventory: InventoryItem[];
  expenses: Expense[];
  addServiceOrder: (order: Omit<ServiceOrder, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateServiceOrder: (id: string, order: Partial<ServiceOrder>) => Promise<void>;
  deleteServiceOrder: (id: string) => Promise<void>;
  completeServiceOrder: (id: string) => Promise<void>;
  addAppointment: (appointment: Omit<Appointment, "id">) => Promise<void>;
  updateAppointment: (id: string, appointment: Partial<Appointment>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  addInventoryItem: (item: Omit<InventoryItem, "id">) => Promise<void>;
  updateInventoryItem: (id: string, item: Partial<InventoryItem>) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;
  addExpense: (expense: Omit<Expense, "id">) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  setInventory: (items: InventoryItem[]) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Carregar dados do Supabase na inicialização
  useEffect(() => {
    async function fetchInitialData() {
      try {
        // Buscar ordens de serviço
        const { data: serviceOrdersData, error: serviceOrdersError } = await supabase
          .from('service_orders')
          .select('*');
        
        if (serviceOrdersError) throw serviceOrdersError;
        
        // Para cada ordem de serviço, buscar as peças relacionadas
        if (serviceOrdersData) {
          const ordersWithParts = await Promise.all(
            serviceOrdersData.map(async (order) => {
              const { data: partsData, error: partsError } = await supabase
                .from('service_order_parts')
                .select('*')
                .eq('service_order_id', order.id);
              
              if (partsError) throw partsError;
              
              // Converter do formato do banco para o formato da aplicação
              return {
                id: order.id,
                clientName: order.client_name,
                vehicle: {
                  model: order.vehicle_model,
                  year: order.vehicle_year,
                  plate: order.vehicle_plate,
                },
                serviceType: order.service_type,
                parts: partsData ? partsData.map(part => ({
                  id: part.id,
                  name: part.name,
                  price: Number(part.price),
                  quantity: part.quantity,
                  inventory_item_id: part.inventory_item_id
                })) : [],
                laborCost: Number(order.labor_cost),
                total: Number(order.total),
                status: order.status as ServiceStatus,
                createdAt: order.created_at,
                updatedAt: order.updated_at,
                completedAt: order.completed_at,
              };
            })
          );
          
          setServiceOrders(ordersWithParts);
        } else {
          // Fallback para dados mockados se não houver dados no banco
          setServiceOrders(mockServiceOrders);
        }
        
        // Buscar inventário
        const { data: inventoryData, error: inventoryError } = await supabase
          .from('inventory_items')
          .select('*');
        
        if (inventoryError) throw inventoryError;
        
        if (inventoryData && inventoryData.length > 0) {
          setInventory(inventoryData);
        }
        
        // Buscar agendamentos
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select('*');
        
        if (appointmentsError) throw appointmentsError;
        
        if (appointmentsData && appointmentsData.length > 0) {
          const formattedAppointments = appointmentsData.map(app => ({
            id: app.id,
            clientName: app.client_name,
            vehicle: {
              model: app.vehicle_model,
              year: app.vehicle_year,
              plate: app.vehicle_plate,
            },
            serviceType: app.service_type,
            date: app.date,
            time: app.time,
            notes: app.notes,
          }));
          
          setAppointments(formattedAppointments);
        } else {
          setAppointments(mockAppointments);
        }
        
        // Buscar despesas
        const { data: expensesData, error: expensesError } = await supabase
          .from('expenses')
          .select('*');
        
        if (expensesError) throw expensesError;
        
        if (expensesData && expensesData.length > 0) {
          setExpenses(expensesData);
        } else {
          setExpenses(mockExpenses);
        }
        
      } catch (error: any) {
        console.error("Erro ao carregar dados iniciais:", error);
        toast.error(`Erro ao carregar dados: ${error.message}`);
        
        // Usar dados mockados em caso de erro
        setServiceOrders(mockServiceOrders);
        setAppointments(mockAppointments);
        setExpenses(mockExpenses);
      } finally {
        setIsInitialized(true);
      }
    }
    
    fetchInitialData();
  }, []);

  const addServiceOrder = async (order: Omit<ServiceOrder, "id" | "createdAt" | "updatedAt">) => {
    try {
      // Converter do formato da aplicação para o formato do banco
      const orderData = {
        client_name: order.clientName,
        vehicle_model: order.vehicle.model,
        vehicle_year: order.vehicle.year,
        vehicle_plate: order.vehicle.plate,
        service_type: order.serviceType,
        labor_cost: order.laborCost,
        total: order.total,
        status: order.status,
      };
      
      // Inserir a ordem de serviço
      const { data: newOrder, error: orderError } = await supabase
        .from('service_orders')
        .insert(orderData)
        .select('*')
        .single();
      
      if (orderError) throw orderError;
      
      // Inserir as peças da ordem
      if (order.parts.length > 0) {
        const partsData = order.parts.map(part => ({
          service_order_id: newOrder.id,
          name: part.name,
          price: part.price,
          quantity: part.quantity,
          inventory_item_id: part.inventory_item_id
        }));
        
        const { error: partsError } = await supabase
          .from('service_order_parts')
          .insert(partsData);
        
        if (partsError) throw partsError;
        
        // Atualizar o estoque para cada peça
        for (const part of order.parts) {
          if (part.inventory_item_id) {
            const { data: inventoryItem } = await supabase
              .from('inventory_items')
              .select('stock')
              .eq('id', part.inventory_item_id)
              .single();
            
            if (inventoryItem) {
              await supabase
                .from('inventory_items')
                .update({ stock: inventoryItem.stock - part.quantity })
                .eq('id', part.inventory_item_id);
            }
          }
        }
      }
      
      // Atualizar o estado da aplicação
      const formattedOrder: ServiceOrder = {
        id: newOrder.id,
        clientName: newOrder.client_name,
        vehicle: {
          model: newOrder.vehicle_model,
          year: newOrder.vehicle_year,
          plate: newOrder.vehicle_plate,
        },
        serviceType: newOrder.service_type,
        parts: order.parts,
        laborCost: Number(newOrder.labor_cost),
        total: Number(newOrder.total),
        status: newOrder.status as ServiceStatus,
        createdAt: newOrder.created_at,
        updatedAt: newOrder.updated_at,
        completedAt: newOrder.completed_at,
      };
      
      setServiceOrders([...serviceOrders, formattedOrder]);
      toast.success("Ordem de serviço criada com sucesso!");
    } catch (error: any) {
      console.error("Erro ao adicionar ordem de serviço:", error);
      toast.error(`Erro ao criar ordem de serviço: ${error.message}`);
    }
  };

  const updateServiceOrder = async (id: string, orderUpdate: Partial<ServiceOrder>) => {
    try {
      const orderData: any = {};
      
      if (orderUpdate.clientName) orderData.client_name = orderUpdate.clientName;
      if (orderUpdate.vehicle) {
        orderData.vehicle_model = orderUpdate.vehicle.model;
        orderData.vehicle_year = orderUpdate.vehicle.year;
        orderData.vehicle_plate = orderUpdate.vehicle.plate;
      }
      if (orderUpdate.serviceType) orderData.service_type = orderUpdate.serviceType;
      if (orderUpdate.laborCost !== undefined) orderData.labor_cost = orderUpdate.laborCost;
      if (orderUpdate.total !== undefined) orderData.total = orderUpdate.total;
      if (orderUpdate.status) orderData.status = orderUpdate.status;
      
      orderData.updated_at = new Date().toISOString();
      
      // Atualizar a ordem de serviço
      if (Object.keys(orderData).length > 0) {
        const { error: orderError } = await supabase
          .from('service_orders')
          .update(orderData)
          .eq('id', id);
        
        if (orderError) throw orderError;
      }
      
      // Atualizar as peças se fornecidas
      if (orderUpdate.parts) {
        // Remover peças antigas
        const { error: deleteError } = await supabase
          .from('service_order_parts')
          .delete()
          .eq('service_order_id', id);
        
        if (deleteError) throw deleteError;
        
        // Adicionar novas peças
        if (orderUpdate.parts.length > 0) {
          const partsData = orderUpdate.parts.map(part => ({
            service_order_id: id,
            name: part.name,
            price: part.price,
            quantity: part.quantity,
            inventory_item_id: part.inventory_item_id
          }));
          
          const { error: insertError } = await supabase
            .from('service_order_parts')
            .insert(partsData);
          
          if (insertError) throw insertError;
        }
      }
      
      // Atualizar o estado da aplicação
      setServiceOrders(serviceOrders.map(order => 
        order.id === id 
          ? { ...order, ...orderUpdate, updatedAt: new Date().toISOString() } 
          : order
      ));
      
      toast.success("Ordem de serviço atualizada!");
    } catch (error: any) {
      console.error("Erro ao atualizar ordem de serviço:", error);
      toast.error(`Erro ao atualizar ordem de serviço: ${error.message}`);
    }
  };

  const deleteServiceOrder = async (id: string) => {
    try {
      // Excluir a ordem de serviço (vai excluir automaticamente as peças associadas devido à constraint ON DELETE CASCADE)
      const { error } = await supabase
        .from('service_orders')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Atualizar o estado da aplicação
      setServiceOrders(serviceOrders.filter(item => item.id !== id));
      toast.success("Ordem de serviço excluída!");
    } catch (error: any) {
      console.error("Erro ao excluir ordem de serviço:", error);
      toast.error(`Erro ao excluir ordem de serviço: ${error.message}`);
    }
  };

  const completeServiceOrder = async (id: string) => {
    try {
      const now = new Date().toISOString();
      
      // Atualizar o status da ordem de serviço para COMPLETED e definir completedAt
      const { error } = await supabase
        .from('service_orders')
        .update({
          status: ServiceStatus.COMPLETED,
          updated_at: now,
          completed_at: now
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Atualizar o estado da aplicação
      setServiceOrders(serviceOrders.map(order => 
        order.id === id 
          ? { 
              ...order, 
              status: ServiceStatus.COMPLETED, 
              updatedAt: now,
              completedAt: now
            } 
          : order
      ));
      
      toast.success("Ordem de serviço finalizada com sucesso!");
    } catch (error: any) {
      console.error("Erro ao finalizar ordem de serviço:", error);
      toast.error(`Erro ao finalizar ordem de serviço: ${error.message}`);
    }
  };

  const addAppointment = async (appointment: Omit<Appointment, "id">) => {
    try {
      // Converter do formato da aplicação para o formato do banco
      const appointmentData = {
        client_name: appointment.clientName,
        vehicle_model: appointment.vehicle.model,
        vehicle_year: appointment.vehicle.year,
        vehicle_plate: appointment.vehicle.plate,
        service_type: appointment.serviceType,
        date: appointment.date,
        time: appointment.time,
        notes: appointment.notes || null,
      };
      
      // Inserir o agendamento
      const { data, error } = await supabase
        .from('appointments')
        .insert(appointmentData)
        .select('*')
        .single();
      
      if (error) throw error;
      
      // Atualizar o estado da aplicação
      const newAppointment: Appointment = {
        id: data.id,
        clientName: data.client_name,
        vehicle: {
          model: data.vehicle_model,
          year: data.vehicle_year,
          plate: data.vehicle_plate,
        },
        serviceType: data.service_type,
        date: data.date,
        time: data.time,
        notes: data.notes,
      };
      
      setAppointments([...appointments, newAppointment]);
      toast.success("Agendamento criado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao adicionar agendamento:", error);
      toast.error(`Erro ao criar agendamento: ${error.message}`);
    }
  };

  const updateAppointment = async (id: string, appointmentUpdate: Partial<Appointment>) => {
    try {
      const appointmentData: any = {};
      
      if (appointmentUpdate.clientName) appointmentData.client_name = appointmentUpdate.clientName;
      if (appointmentUpdate.vehicle) {
        appointmentData.vehicle_model = appointmentUpdate.vehicle.model;
        appointmentData.vehicle_year = appointmentUpdate.vehicle.year;
        appointmentData.vehicle_plate = appointmentUpdate.vehicle.plate;
      }
      if (appointmentUpdate.serviceType) appointmentData.service_type = appointmentUpdate.serviceType;
      if (appointmentUpdate.date) appointmentData.date = appointmentUpdate.date;
      if (appointmentUpdate.time) appointmentData.time = appointmentUpdate.time;
      if (appointmentUpdate.notes !== undefined) appointmentData.notes = appointmentUpdate.notes;
      
      // Atualizar o agendamento
      const { error } = await supabase
        .from('appointments')
        .update(appointmentData)
        .eq('id', id);
      
      if (error) throw error;
      
      // Atualizar o estado da aplicação
      setAppointments(appointments.map(item => 
        item.id === id ? { ...item, ...appointmentUpdate } : item
      ));
      
      toast.success("Agendamento atualizado!");
    } catch (error: any) {
      console.error("Erro ao atualizar agendamento:", error);
      toast.error(`Erro ao atualizar agendamento: ${error.message}`);
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      // Excluir o agendamento
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Atualizar o estado da aplicação
      setAppointments(appointments.filter(item => item.id !== id));
      toast.success("Agendamento excluído!");
    } catch (error: any) {
      console.error("Erro ao excluir agendamento:", error);
      toast.error(`Erro ao excluir agendamento: ${error.message}`);
    }
  };

  const addInventoryItem = async (item: Omit<InventoryItem, "id">) => {
    try {
      // Inserir o item no inventário
      const { data, error } = await supabase
        .from('inventory_items')
        .insert(item)
        .select('*')
        .single();
      
      if (error) throw error;
      
      // Atualizar o estado da aplicação
      setInventory([...inventory, data]);
      toast.success("Item de estoque adicionado!");
    } catch (error: any) {
      console.error("Erro ao adicionar item de estoque:", error);
      toast.error(`Erro ao adicionar item de estoque: ${error.message}`);
    }
  };

  const updateInventoryItem = async (id: string, itemUpdate: Partial<InventoryItem>) => {
    try {
      // Atualizar o item no inventário
      const { error } = await supabase
        .from('inventory_items')
        .update(itemUpdate)
        .eq('id', id);
      
      if (error) throw error;
      
      // Atualizar o estado da aplicação
      setInventory(inventory.map(item => 
        item.id === id ? { ...item, ...itemUpdate } : item
      ));
      
      toast.success("Item de estoque atualizado!");
    } catch (error: any) {
      console.error("Erro ao atualizar item de estoque:", error);
      toast.error(`Erro ao atualizar item de estoque: ${error.message}`);
    }
  };

  const deleteInventoryItem = async (id: string) => {
    try {
      // Excluir o item do inventário
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Atualizar o estado da aplicação
      setInventory(inventory.filter(item => item.id !== id));
      toast.success("Item de estoque excluído!");
    } catch (error: any) {
      console.error("Erro ao excluir item de estoque:", error);
      toast.error(`Erro ao excluir item de estoque: ${error.message}`);
    }
  };

  const addExpense = async (expense: Omit<Expense, "id">) => {
    try {
      // Inserir a despesa
      const { data, error } = await supabase
        .from('expenses')
        .insert(expense)
        .select('*')
        .single();
      
      if (error) throw error;
      
      // Atualizar o estado da aplicação
      setExpenses([...expenses, data]);
      toast.success("Despesa adicionada com sucesso!");
    } catch (error: any) {
      console.error("Erro ao adicionar despesa:", error);
      toast.error(`Erro ao adicionar despesa: ${error.message}`);
    }
  };

  const updateExpense = async (id: string, expenseUpdate: Partial<Expense>) => {
    try {
      // Atualizar a despesa
      const { error } = await supabase
        .from('expenses')
        .update(expenseUpdate)
        .eq('id', id);
      
      if (error) throw error;
      
      // Atualizar o estado da aplicação
      setExpenses(expenses.map(expense => 
        expense.id === id ? { ...expense, ...expenseUpdate } : expense
      ));
      
      toast.success("Despesa atualizada!");
    } catch (error: any) {
      console.error("Erro ao atualizar despesa:", error);
      toast.error(`Erro ao atualizar despesa: ${error.message}`);
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      // Excluir a despesa
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Atualizar o estado da aplicação
      setExpenses(expenses.filter(expense => expense.id !== id));
      toast.success("Despesa excluída!");
    } catch (error: any) {
      console.error("Erro ao excluir despesa:", error);
      toast.error(`Erro ao excluir despesa: ${error.message}`);
    }
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
        setInventory,
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

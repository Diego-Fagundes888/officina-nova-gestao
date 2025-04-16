import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { ServiceOrder, Appointment, InventoryItem, Expense, ServiceStatus, VehicleService, Vehicle } from "@/types";
import { mockServiceOrders, mockAppointments, mockExpenses, generateId } from "@/utils/mockData";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/types/supabase";

interface AppContextProps {
  serviceOrders: ServiceOrder[];
  appointments: Appointment[];
  inventory: InventoryItem[];
  expenses: Expense[];
  setAppointments: (appointments: Appointment[]) => void;
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
  vehicleServices: VehicleService[];
  addVehicleService: (service: Omit<VehicleService, "id" | "created_at">) => Promise<void>;
  updateVehicleService: (id: string, service: Partial<VehicleService>) => Promise<void>;
  deleteVehicleService: (id: string) => Promise<void>;
  setVehicleServices: (services: VehicleService[]) => void;
  vehicles: Vehicle[];
  getVehicle: (plate: string) => Promise<Vehicle | null>;
  getVehicleServices: (plate: string) => VehicleService[];
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [vehicleServices, setVehicleServices] = useState<VehicleService[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const { data: vehiclesData, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('*');
        
        if (vehiclesError) throw vehiclesError;
        
        if (vehiclesData && vehiclesData.length > 0) {
          setVehicles(vehiclesData);
        }
        
        const { data: serviceOrdersData, error: serviceOrdersError } = await supabase
          .from('service_orders')
          .select('*');
        
        if (serviceOrdersError) throw serviceOrdersError;
        
        if (serviceOrdersData) {
          const ordersWithParts = await Promise.all(
            serviceOrdersData.map(async (order) => {
              const { data: partsData, error: partsError } = await supabase
                .from('service_order_parts')
                .select('*')
                .eq('service_order_id', order.id);
              
              if (partsError) throw partsError;
              
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
          setServiceOrders(mockServiceOrders);
        }
        
        const { data: inventoryData, error: inventoryError } = await supabase
          .from('inventory_items')
          .select('*');
        
        if (inventoryError) throw inventoryError;
        
        if (inventoryData && inventoryData.length > 0) {
          setInventory(inventoryData);
        }
        
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
        
        const { data: expensesData, error: expensesError } = await supabase
          .from('expenses')
          .select('*');
        
        if (expensesError) throw expensesError;
        
        if (expensesData && expensesData.length > 0) {
          setExpenses(expensesData);
        } else {
          setExpenses(mockExpenses);
        }
        
        const { data: vehicleServicesData, error: vehicleServicesError } = await supabase
          .from('vehicle_services')
          .select('*');
        
        if (vehicleServicesError) throw vehicleServicesError;
        
        if (vehicleServicesData && vehicleServicesData.length > 0) {
          setVehicleServices(vehicleServicesData);
        }
        
      } catch (error: any) {
        console.error("Erro ao carregar dados iniciais:", error);
        toast.error(`Erro ao carregar dados: ${error.message}`);
        
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
      
      await getOrCreateVehicle(order.vehicle.plate, order.vehicle.model, order.vehicle.year);
      
      const { data: newOrder, error: orderError } = await supabase
        .from('service_orders')
        .insert(orderData)
        .select('*')
        .single();
      
      if (orderError) throw orderError;
      
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
      
      if (Object.keys(orderData).length > 0) {
        const { error: orderError } = await supabase
          .from('service_orders')
          .update(orderData)
          .eq('id', id);
        
        if (orderError) throw orderError;
      }
      
      if (orderUpdate.parts) {
        const { error: deleteError } = await supabase
          .from('service_order_parts')
          .delete()
          .eq('service_order_id', id);
        
        if (deleteError) throw deleteError;
        
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
      if (!isValidUUID(id)) {
        toast.error("ID inválido para exclusão");
        return;
      }
      
      const { error } = await supabase
        .from('service_orders')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
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
      
      const order = serviceOrders.find(o => o.id === id);
      if (!order) {
        throw new Error("Ordem de serviço não encontrada");
      }
      
      const { error } = await supabase
        .from('service_orders')
        .update({
          status: ServiceStatus.COMPLETED,
          updated_at: now,
          completed_at: now
        })
        .eq('id', id);
      
      if (error) throw error;
      
      const serviceData = {
        vehicle_id: order.vehicle.plate,
        service_type: order.serviceType,
        description: `Ordem de Serviço #${id.substring(0, 8)}`,
        notes: `Mão de obra: ${order.laborCost}. Peças incluídas: ${order.parts.map(p => p.name).join(', ')}`,
        service_date: now,
        price: order.total
      };
      
      await addVehicleService({
        ...serviceData,
        client_name: order.clientName
      });
      
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
      
      await getOrCreateVehicle(appointment.vehicle.plate, appointment.vehicle.model, appointment.vehicle.year);
      
      const { data, error } = await supabase
        .from('appointments')
        .insert(appointmentData)
        .select('*')
        .single();
      
      if (error) throw error;
      
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
      
      const serviceData = {
        vehicle_id: appointment.vehicle.plate,
        service_type: "Agendamento: " + appointment.serviceType,
        description: `Agendamento para ${appointment.date} às ${appointment.time}`,
        notes: appointment.notes || "Sem observações",
        service_date: new Date().toISOString()
      };
      
      await addVehicleService({
        ...serviceData,
        client_name: appointment.clientName
      });
      
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
      
      const { error } = await supabase
        .from('appointments')
        .update(appointmentData)
        .eq('id', id);
      
      if (error) throw error;
      
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
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setAppointments(appointments.filter(item => item.id !== id));
      toast.success("Agendamento excluído!");
    } catch (error: any) {
      console.error("Erro ao excluir agendamento:", error);
      toast.error(`Erro ao excluir agendamento: ${error.message}`);
    }
  };

  const addInventoryItem = async (item: Omit<InventoryItem, "id">) => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .insert(item)
        .select('*')
        .single();
      
      if (error) throw error;
      
      setInventory([...inventory, data]);
      toast.success("Item de estoque adicionado!");
    } catch (error: any) {
      console.error("Erro ao adicionar item de estoque:", error);
      toast.error(`Erro ao adicionar item de estoque: ${error.message}`);
    }
  };

  const updateInventoryItem = async (id: string, itemUpdate: Partial<InventoryItem>) => {
    try {
      const { error } = await supabase
        .from('inventory_items')
        .update(itemUpdate)
        .eq('id', id);
      
      if (error) throw error;
      
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
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setInventory(inventory.filter(item => item.id !== id));
      toast.success("Item de estoque excluído!");
    } catch (error: any) {
      console.error("Erro ao excluir item de estoque:", error);
      toast.error(`Erro ao excluir item de estoque: ${error.message}`);
    }
  };

  const addExpense = async (expense: Omit<Expense, "id">) => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert(expense)
        .select('*')
        .single();
      
      if (error) throw error;
      
      setExpenses([...expenses, data]);
      toast.success("Despesa adicionada com sucesso!");
    } catch (error: any) {
      console.error("Erro ao adicionar despesa:", error);
      toast.error(`Erro ao adicionar despesa: ${error.message}`);
    }
  };

  const updateExpense = async (id: string, expenseUpdate: Partial<Expense>) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .update(expenseUpdate)
        .eq('id', id);
      
      if (error) throw error;
      
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
      if (!id) {
        toast.error("ID inválido para exclusão");
        return;
      }
      
      console.log("Tentando excluir despesa com ID:", id);
      
      if (!isValidUUID(id) && expenses.some(e => e.id === id)) {
        setExpenses(prevExpenses => prevExpenses.filter(expense => expense.id !== id));
        toast.success("Despesa excluída!");
        return;
      }
      
      if (isValidUUID(id)) {
        const { error } = await supabase
          .from('expenses')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        setExpenses(prevExpenses => prevExpenses.filter(expense => expense.id !== id));
        toast.success("Despesa excluída!");
      } else {
        toast.error("Formato de ID inválido para exclusão no banco de dados");
      }
    } catch (error: any) {
      console.error("Erro ao excluir despesa:", error);
      toast.error(`Erro ao excluir despesa: ${error.message}`);
    }
  };

  const addVehicleService = async (service: Omit<VehicleService, "id" | "created_at">) => {
    try {
      await getOrCreateVehicle(service.vehicle_id, "", "");
      
      const { client_name, ...serviceData } = service;
      
      const { data, error } = await supabase
        .from('vehicle_services')
        .insert(serviceData)
        .select('*')
        .single();
      
      if (error) throw error;
      
      const fullServiceData = { ...data, client_name: client_name || "" };
      
      setVehicleServices([...vehicleServices, fullServiceData]);
      toast.success("Serviço adicionado ao histórico do veículo!");
      
      return fullServiceData;
    } catch (error: any) {
      console.error("Erro ao adicionar serviço:", error);
      toast.error(`Erro ao adicionar serviço: ${error.message}`);
      throw error;
    }
  };

  const updateVehicleService = async (id: string, serviceUpdate: Partial<VehicleService>) => {
    try {
      const { client_name, ...serviceData } = serviceUpdate;
      
      const { error } = await supabase
        .from('vehicle_services')
        .update(serviceData)
        .eq('id', id);
      
      if (error) throw error;
      
      setVehicleServices(vehicleServices.map(service => 
        service.id === id ? { ...service, ...serviceUpdate } : service
      ));
      
      toast.success("Serviço atualizado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao atualizar serviço:", error);
      toast.error(`Erro ao atualizar serviço: ${error.message}`);
    }
  };

  const deleteVehicleService = async (id: string) => {
    try {
      if (!isValidUUID(id)) {
        toast.error("ID inválido para exclusão");
        return;
      }
      
      const { error } = await supabase
        .from('vehicle_services')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setVehicleServices(vehicleServices.filter(service => service.id !== id));
      toast.success("Serviço excluído!");
    } catch (error: any) {
      console.error("Erro ao excluir serviço:", error);
      toast.error(`Erro ao excluir serviço: ${error.message}`);
    }
  };

  const getOrCreateVehicle = async (plate: string, model: string, year: string): Promise<Vehicle> => {
    try {
      const { data: existingVehicle, error: queryError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('plate', plate)
        .maybeSingle();
      
      if (queryError) throw queryError;
      
      if (existingVehicle) {
        return existingVehicle as Vehicle;
      }
      
      const { data: newVehicle, error: insertError } = await supabase
        .from('vehicles')
        .insert({
          plate,
          model,
          year
        })
        .select('*')
        .single();
      
      if (insertError) throw insertError;
      
      const vehicleData = newVehicle as Vehicle;
      setVehicles([...vehicles, vehicleData]);
      
      return vehicleData;
    } catch (error: any) {
      console.error("Erro ao obter/criar veículo:", error);
      throw error;
    }
  };

  const getVehicle = async (plate: string): Promise<Vehicle | null> => {
    try {
      const localVehicle = vehicles.find(v => v.plate === plate);
      if (localVehicle) return localVehicle;
      
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('plate', plate)
        .maybeSingle();
      
      if (error) throw error;
      
      return data as Vehicle | null;
    } catch (error: any) {
      console.error("Erro ao buscar veículo:", error);
      return null;
    }
  };

  const getVehicleServices = (plate: string): VehicleService[] => {
    return vehicleServices.filter(service => service.vehicle_id === plate);
  };

  return (
    <AppContext.Provider
      value={{
        serviceOrders,
        appointments,
        inventory,
        expenses,
        setAppointments,
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
        vehicleServices,
        addVehicleService,
        updateVehicleService,
        deleteVehicleService,
        setVehicleServices,
        vehicles,
        getVehicle,
        getVehicleServices,
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

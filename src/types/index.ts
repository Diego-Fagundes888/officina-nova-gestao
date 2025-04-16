
export enum ServiceStatus {
  DRAFT = "DRAFT",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELED = "CANCELED"
}

export enum AppointmentStatus {
  AGENDADO = "AGENDADO",
  EM_ANDAMENTO = "EM_ANDAMENTO",
  FINALIZADO = "FINALIZADO",
  CANCELADO = "CANCELADO",
  ATRASADO = "ATRASADO"
}

// Define the Part interface
export interface Part {
  id: string;
  name: string;
  price: number;
  quantity: number;
  inventory_item_id?: string;
}

// Define the Service Order interface
export interface ServiceOrder {
  id: string;
  clientName: string;
  vehicle: {
    model: string;
    year: string;
    plate: string;
  };
  serviceType: string;
  parts: Part[];
  laborCost: number;
  total: number;
  status: ServiceStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// Define the Appointment interface
export interface Appointment {
  id: string;
  clientName: string;
  vehicle: {
    model: string;
    year: string;
    plate: string;
  };
  serviceType: string;
  date: string;
  time: string;
  notes?: string;
  status: AppointmentStatus;
}

// Define the InventoryItem interface
export interface InventoryItem {
  id: string;
  name: string;
  purchase_price: number;
  selling_price: number;
  stock: number;
  min_stock: number;
}

// Define the Expense interface
export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
}

// Define the Vehicle interface
export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  year: string;
  created_at: string;
}

// Define the VehicleService interface
export interface VehicleService {
  id: string;
  vehicle_id: string;
  service_type: string;
  description?: string;
  notes?: string;
  service_date: string;
  price?: number;
  mechanic_name?: string;
  created_at: string;
  client_name: string;
}



export enum ServiceStatus {
  DRAFT = "RASCUNHO",
  IN_PROGRESS = "EM_ANDAMENTO",
  COMPLETED = "CONCLUIDO",
  CANCELED = "CANCELADO",
}

export interface Part {
  id: string;
  name: string;
  price: number;
  quantity: number;
  inventory_item_id?: string;
}

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

export interface InventoryItem {
  id: string;
  name: string;
  purchase_price: number;
  selling_price: number;
  stock: number;
  min_stock: number;
}

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
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
}


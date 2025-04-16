
export enum AppointmentStatus {
  AGENDADO = "AGENDADO",
  EM_ANDAMENTO = "EM_ANDAMENTO",
  FINALIZADO = "FINALIZADO",
  CANCELADO = "CANCELADO",
  ATRASADO = "ATRASADO"
}

// Update the Appointment interface to include status
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
  status: AppointmentStatus; // New field
}

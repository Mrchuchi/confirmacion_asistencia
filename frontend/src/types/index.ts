export interface Acompanante {
  id: number;
  invitado_id: number;
  nombre: string;
  cedula: string;
  edad?: number;
  parentesco?: string;
  eps?: string;
  estado_asistencia: boolean;
  created_at: string;
  updated_at: string;
}

export interface Invitado {
  id: number;
  nombre: string;
  cedula: string;
  campana_area?: string;
  eps?: string;
  sede?: string;
  estado_asistencia: boolean;
  created_at: string;
  updated_at: string;
  acompanantes: Acompanante[];
}

export interface SearchResponse {
  invitado: Invitado;
  total_personas: number;
  asistencia_confirmada: boolean;
}

export interface ConfirmarAsistenciaRequest {
  invitado_id: number;
  acompanantes_ids?: number[];
}

export interface ConfirmarAsistenciaResponse {
  success: boolean;
  message: string;
  personas_confirmadas: number;
}

export interface AsistenciaStats {
  total_invitados: number;
  invitados_confirmados: number;
  total_acompanantes: number;
  acompanantes_confirmados: number;
  total_personas: number;
  personas_confirmadas: number;
}

export interface Usuario {
  id: number;
  username: string;
  nombre_completo: string;
  created_at: string;
  updated_at: string;
}

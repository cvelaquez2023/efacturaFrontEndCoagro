export interface ICreateVisitaModel {
  cliente: string;
  ruta: string;
  inicio: string;
  razon?: string;
  fin?: string;
  fechaPlan?: string;
  tipo?: string;
  notas?: string;
  docPro?: string;
}
export interface IResponseVisita {
  CLIENTE: string;
  RUTA: string;
  INICIO: string;
  RAZON: string;
  FIN: string;
  FECHA_PLAN: string;
  TIPO: string;
  NOTAS: string;
  DOC_PRO: string;
}

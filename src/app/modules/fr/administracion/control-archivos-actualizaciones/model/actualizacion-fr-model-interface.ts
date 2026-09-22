export interface IActualizacionFr {
  nombre: string;
  tipo: "Paquete" | "Reporte" | "Otros";
  fecha: string;
  handhelds: string;
  publicada: boolean;
}

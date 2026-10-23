import { formatDate } from "@angular/common";
import { AbstractControl } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import {
  F1SelectorComponent,
  IF1Item,
} from "../../rutas/shared/f1-selector/f1-selector.component";

/** true si `codigo` cae dentro del rango Desde/Hasta (ambos opcionales e inclusivos), comparando
 *  como texto igual que los rangos de Softland. */
export const enRango = (
  codigo: string | null | undefined,
  desde?: string | null,
  hasta?: string | null
): boolean => {
  const valor = String(codigo ?? "").trim();
  const d = String(desde ?? "").trim();
  const h = String(hasta ?? "").trim();
  if (d && valor.localeCompare(d, undefined, { numeric: true }) < 0) return false;
  if (h && valor.localeCompare(h, undefined, { numeric: true }) > 0) return false;
  return true;
};

/** Fecha de hoy como YYYY-MM-DD (formato de los inputs type="date" y del backend). */
export const hoyIso = (): string => formatDate(new Date(), "yyyy-MM-dd", "en-US");

export const sumarDias = (fechaIso: string, dias: number): string => {
  const [y, m, d] = fechaIso.split("-").map(Number);
  return formatDate(new Date(y, m - 1, d + dias), "yyyy-MM-dd", "en-US");
};

/** Primer día del mes actual como YYYY-MM-DD. */
export const inicioMesIso = (): string => {
  const hoy = new Date();
  return formatDate(
    new Date(hoy.getFullYear(), hoy.getMonth(), 1),
    "yyyy-MM-dd",
    "en-US"
  );
};

/** Los datetime de SQL Server son hora local (El Salvador) sin zona, pero el driver los entrega
 *  como si fueran UTC ("...T10:06:32.000Z"). Esos textos se formatean en UTC para mostrar la hora
 *  tal como está guardada; un Date o un texto sin "Z" se formatea en la zona del navegador. */
const zonaDe = (valor: string | Date): string | undefined =>
  typeof valor === "string" && valor.endsWith("Z") ? "+0000" : undefined;

export const fmtFecha = (valor: string | Date | null | undefined): string =>
  valor ? formatDate(valor, "dd/MM/yyyy", "en-US", zonaDe(valor)) : "";

export const fmtHora = (valor: string | Date | null | undefined): string =>
  valor ? formatDate(valor, "hh:mm a", "en-US", zonaDe(valor)) : "";

export const fmtFechaHora = (valor: string | Date | null | undefined): string =>
  valor ? formatDate(valor, "dd/MM/yyyy hh:mm a", "en-US", zonaDe(valor)) : "";

/** Clave YYYY-MM-DD de una fecha/hora (misma regla de zona que fmtFecha). */
export const claveDia = (valor: string | Date): string =>
  formatDate(valor, "yyyy-MM-dd", "en-US", zonaDe(valor));

/** Día de la semana como lo guarda RUTA_CLIENTE.DIA: 1=Lunes ... 7=Domingo. */
export const diaSemanaRuta = (fechaIso: string): number => {
  const [y, m, d] = fechaIso.split("-").map(Number);
  const js = new Date(y, m - 1, d).getDay(); // 0=Domingo
  return js === 0 ? 7 : js;
};

/** Distancia en metros entre dos puntos GPS (fórmula de haversine). */
export const distanciaMetros = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const rad = (g: number) => (g * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export interface IColumnaExport {
  header: string;
  valor: (fila: any) => unknown; // eslint-disable-line @typescript-eslint/no-explicit-any
}

/** Descarga las filas como CSV (separador ";" y BOM para que Excel lo abra con acentos). */
export const exportarCsv = (
  nombreArchivo: string,
  columnas: IColumnaExport[],
  filas: unknown[]
): void => {
  const celda = (v: unknown) => {
    const texto = v == null ? "" : String(v);
    return /[";\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
  };
  const lineas = [
    columnas.map((c) => celda(c.header)).join(";"),
    ...filas.map((f) => columnas.map((c) => celda(c.valor(f))).join(";")),
  ];
  const blob = new Blob(["﻿" + lineas.join("\r\n")], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${nombreArchivo}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Abre el selector F1 y, al elegir, escribe el código en `control` y el nombre en `nombre`
 * (si se pasa). Mismo patrón que los pickers de Asignación de Rutas.
 */
export const abrirSelectorF1 = (
  dialog: MatDialog,
  titulo: string,
  items: IF1Item[],
  control: AbstractControl | null,
  nombre?: AbstractControl | null
): void => {
  dialog
    .open(F1SelectorComponent, {
      width: "640px",
      data: { titulo, items },
    })
    .afterClosed()
    .subscribe((item?: IF1Item) => {
      if (!item) return;
      control?.setValue(item.codigo);
      nombre?.setValue(item.nombre);
    });
};

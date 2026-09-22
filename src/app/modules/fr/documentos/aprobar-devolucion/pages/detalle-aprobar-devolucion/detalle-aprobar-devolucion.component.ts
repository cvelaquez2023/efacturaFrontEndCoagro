import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import {
  IDevolucionFr,
  ILineaArticuloDevolucion,
} from "../../../devoluciones/model/devolucion-fr-model-interface";

const MOCK_LINEAS: ILineaArticuloDevolucion[] = [
  {
    articulo: "ART001",
    descripcion: "Fertilizante Foliar 20L",
    cantidad: 2,
    lote: "L-2026-08",
  },
  {
    articulo: "ART003",
    descripcion: "Semilla Maiz Hibrido",
    cantidad: 1,
    lote: "L-2026-08",
  },
];

@Component({
  selector: "app-detalle-aprobar-devolucion",
  templateUrl: "./detalle-aprobar-devolucion.component.html",
  styleUrls: ["./detalle-aprobar-devolucion.component.scss"],
})
export class DetalleAprobarDevolucionComponent {
  lineas: ILineaArticuloDevolucion[] = MOCK_LINEAS;

  constructor(@Inject(MAT_DIALOG_DATA) public ediData: IDevolucionFr) {}
}

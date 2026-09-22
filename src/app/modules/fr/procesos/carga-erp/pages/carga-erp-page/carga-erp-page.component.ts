import { Component } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { SnotifyPosition, SnotifyService } from "ng-snotify";

interface ITareaProgramada {
  nombre: string;
  ultimaEjecucion: string;
  proximaEjecucion: string;
  comentario: string;
}

interface IBitacoraCarga {
  fecha: string;
  estado: "Exitosa" | "Con errores";
  archivo: string;
}

// Pantalla solo visual (manual pag. 125): Carga de Datos al ERP.
// No existe endpoint real; el proceso y las tareas programadas son datos de muestra.
const MOCK_TAREAS: ITareaProgramada[] = [
  {
    nombre: "Carga nocturna al ERP",
    ultimaEjecucion: "2026-08-09T23:00:00",
    proximaEjecucion: "2026-08-10T23:00:00",
    comentario: "Carga automatica diaria",
  },
];
const MOCK_BITACORA: IBitacoraCarga[] = [
  {
    fecha: "2026-08-09T23:00:00",
    estado: "Exitosa",
    archivo: "carga_erp_20260809.log",
  },
  {
    fecha: "2026-08-08T23:00:00",
    estado: "Exitosa",
    archivo: "carga_erp_20260808.log",
  },
];

@Component({
  selector: "app-carga-erp-page",
  templateUrl: "./carga-erp-page.component.html",
  styleUrls: ["./carga-erp-page.component.scss"],
})
export class CargaErpPageComponent {
  constructor(private _snotifyService: SnotifyService) {}

  procesoFinalizado = false;
  tareas = new MatTableDataSource<ITareaProgramada>(MOCK_TAREAS);
  bitacora = new MatTableDataSource<IBitacoraCarga>(MOCK_BITACORA);
  tareasColumns = [
    "nombre",
    "ultimaEjecucion",
    "proximaEjecucion",
    "comentario",
  ];
  bitacoraColumns = ["fecha", "estado", "archivo"];

  ejecutarCarga(): void {
    this.procesoFinalizado = true;
    this._snotifyService.info(
      "La carga hacia SoftlandERP ha finalizado correctamente",
      { position: SnotifyPosition.rightTop }
    );
  }
}

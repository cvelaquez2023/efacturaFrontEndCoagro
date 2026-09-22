import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { SnotifyPosition, SnotifyService } from "ng-snotify";

interface ITareaProgramada {
  nombre: string;
  tipoCarga: "Completa" | "Parcial";
  ultimaEjecucion: string;
  proximaEjecucion: string;
  comentario: string;
}

interface IBitacoraCarga {
  fecha: string;
  estado: "Exitosa" | "Con errores";
  archivo: string;
}

// Pantalla solo visual (manual pag. 119): Carga de Datos a HandHeld.
// No existe endpoint real; el proceso y las tareas programadas son datos de muestra.
const MOCK_TAREAS: ITareaProgramada[] = [
  {
    nombre: "Carga nocturna completa",
    tipoCarga: "Completa",
    ultimaEjecucion: "2026-08-09T22:00:00",
    proximaEjecucion: "2026-08-10T22:00:00",
    comentario: "Carga automatica diaria",
  },
];
const MOCK_BITACORA: IBitacoraCarga[] = [
  {
    fecha: "2026-08-09T22:00:00",
    estado: "Exitosa",
    archivo: "carga_20260809.log",
  },
  {
    fecha: "2026-08-08T22:00:00",
    estado: "Exitosa",
    archivo: "carga_20260808.log",
  },
];

@Component({
  selector: "app-carga-handheld-page",
  templateUrl: "./carga-handheld-page.component.html",
  styleUrls: ["./carga-handheld-page.component.scss"],
})
export class CargaHandheldPageComponent {
  constructor(
    private _formBuilder: FormBuilder,
    private _snotifyService: SnotifyService
  ) {
    this.procesoForm = this._formBuilder.group({
      fechaVisita: ["", [Validators.required]],
      cargaParcial: [false],
      ruta: [""],
      actualizarExistencias: [true],
      actualizarPendientesCobro: [true],
      cargaClientesNuevos: [true],
    });
  }

  procesoForm: FormGroup;
  procesoFinalizado = false;
  tareas = new MatTableDataSource<ITareaProgramada>(MOCK_TAREAS);
  bitacora = new MatTableDataSource<IBitacoraCarga>(MOCK_BITACORA);
  tareasColumns = [
    "nombre",
    "tipoCarga",
    "ultimaEjecucion",
    "proximaEjecucion",
  ];
  bitacoraColumns = ["fecha", "estado", "archivo"];

  ejecutarCarga(): void {
    if (this.procesoForm.invalid) {
      return;
    }
    this.procesoFinalizado = true;
    this._snotifyService.info(
      "La carga hacia las HandHelds ha finalizado correctamente",
      { position: SnotifyPosition.rightTop }
    );
  }
}

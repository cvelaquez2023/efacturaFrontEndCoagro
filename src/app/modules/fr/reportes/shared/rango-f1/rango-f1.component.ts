import { Component, Input } from "@angular/core";
import { AbstractControl, FormControl } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { IF1Item } from "../../../rutas/shared/f1-selector/f1-selector.component";
import { abrirSelectorF1 } from "../reporte-utils";

/**
 * Grupo "Desde / Hasta" de los filtros de reportes de Softland: cada extremo es un código que se
 * elige con el selector F1 (o se digita) y a la par se muestra su nombre. Ambos son opcionales.
 */
@Component({
  selector: "app-rango-f1",
  templateUrl: "./rango-f1.component.html",
  styleUrls: ["./rango-f1.component.scss"],
})
export class RangoF1Component {
  constructor(private _dialog: MatDialog) {}

  @Input() titulo = "";
  @Input() items: IF1Item[] = [];
  @Input() desde!: AbstractControl | null;
  @Input() hasta!: AbstractControl | null;

  control(c: AbstractControl | null): FormControl {
    return c as FormControl;
  }

  nombre(c: AbstractControl | null): string {
    const codigo = String(c?.value ?? "").trim();
    if (!codigo) return "";
    return this.items.find((i) => i.codigo === codigo)?.nombre ?? "(no existe)";
  }

  buscar(c: AbstractControl | null): void {
    abrirSelectorF1(this._dialog, this.titulo, this.items, c);
  }
}

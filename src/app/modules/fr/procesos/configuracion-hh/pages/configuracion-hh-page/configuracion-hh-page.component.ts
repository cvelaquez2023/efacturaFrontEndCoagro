import { Component } from "@angular/core";
import { SnotifyPosition, SnotifyService } from "ng-snotify";

interface IHandheldItem {
  codigo: string;
  descripcion: string;
}

// Pantalla solo visual (manual pag. 130): copia masiva de configuracion entre HandHelds.
// No existe endpoint real; el boton Procesar solo simula el resultado.
const MOCK_HANDHELDS: IHandheldItem[] = [
  { codigo: "HH01", descripcion: "Pocket Ruta 1" },
  { codigo: "HH02", descripcion: "Pocket Ruta 2" },
  { codigo: "HH03", descripcion: "Pocket Ruta 3" },
];

@Component({
  selector: "app-configuracion-hh-page",
  templateUrl: "./configuracion-hh-page.component.html",
  styleUrls: ["./configuracion-hh-page.component.scss"],
})
export class ConfiguracionHhPageComponent {
  constructor(private _snotifyService: SnotifyService) {}

  origen = "";
  disponibles: IHandheldItem[] = [...MOCK_HANDHELDS];
  seleccionados: IHandheldItem[] = [];

  agregar(item: IHandheldItem): void {
    this.disponibles = this.disponibles.filter((h) => h.codigo !== item.codigo);
    this.seleccionados = [...this.seleccionados, item];
  }

  quitar(item: IHandheldItem): void {
    this.seleccionados = this.seleccionados.filter(
      (h) => h.codigo !== item.codigo
    );
    this.disponibles = [...this.disponibles, item];
  }

  procesar(): void {
    if (!this.origen || !this.seleccionados.length) {
      this._snotifyService.warning(
        "Debe elegir un HandHeld origen y al menos un destino",
        { position: SnotifyPosition.rightTop }
      );
      return;
    }
    this._snotifyService.info(
      "La copia de configuracion finalizo correctamente",
      { position: SnotifyPosition.rightTop }
    );
  }
}

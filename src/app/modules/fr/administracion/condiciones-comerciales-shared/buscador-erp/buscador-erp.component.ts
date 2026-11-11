import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { Observable, of, Subscription } from "rxjs";
import { debounceTime, distinctUntilChanged, switchMap, tap } from "rxjs/operators";
import { CatalogosComercialesService } from "../catalogos-comerciales.service";
import { IArticuloBusqueda, ICodigoNombre } from "../condiciones-comerciales.model";

/**
 * Campo "escriba el código o nombre" con autocompletado contra el ERP real (clientes o artículos).
 * Emite el elemento elegido, o null si el usuario borra el texto.
 */
@Component({
  selector: "app-buscador-erp",
  templateUrl: "./buscador-erp.component.html",
  styleUrls: ["./buscador-erp.component.scss"],
})
export class BuscadorErpComponent implements OnInit, OnChanges, OnDestroy {
  @Input() tipo: "cliente" | "articulo" = "cliente";
  @Input() etiqueta = "";
  @Input() placeholder = "Escriba el código o nombre";
  /** Texto a mostrar (p. ej. al editar: "07193 - NOMBRE"). */
  @Input() texto = "";
  @Input() requerido = false;
  @Input() deshabilitado = false;
  @Output() seleccion = new EventEmitter<ICodigoNombre | IArticuloBusqueda | null>();

  control = new FormControl("");
  opciones: (ICodigoNombre | IArticuloBusqueda)[] = [];
  buscando = false;
  private _sub?: Subscription;

  constructor(private _catalogos: CatalogosComercialesService) {}

  ngOnInit(): void {
    this.control.setValue(this.texto, { emitEvent: false });
    this._sub = this.control.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap((valor) => {
          if (!String(valor ?? "").trim()) this.seleccion.emit(null);
        }),
        switchMap((valor) => this._buscar(String(valor ?? "")))
      )
      .subscribe((opciones) => {
        this.opciones = opciones;
        this.buscando = false;
      });
  }

  ngOnChanges(cambios: SimpleChanges): void {
    if (cambios['texto'] && !cambios['texto'].firstChange) {
      this.control.setValue(this.texto, { emitEvent: false });
    }
    if (cambios['deshabilitado']) {
      if (this.deshabilitado) this.control.disable({ emitEvent: false });
      else this.control.enable({ emitEvent: false });
    }
  }

  ngOnDestroy(): void {
    this._sub?.unsubscribe();
  }

  private _buscar(texto: string): Observable<(ICodigoNombre | IArticuloBusqueda)[]> {
    const q = texto.trim();
    if (q.length < 2 || q.includes(" - ")) return of([]);
    this.buscando = true;
    return this.tipo === "cliente"
      ? this._catalogos.buscarClientes(q)
      : this._catalogos.buscarArticulos(q);
  }

  elegir(evento: MatAutocompleteSelectedEvent): void {
    const item = evento.option.value as ICodigoNombre;
    this.control.setValue(`${item.codigo} - ${item.nombre}`, { emitEvent: false });
    this.opciones = [];
    this.seleccion.emit(item);
  }

  /** Borra el texto. Con `emitir = false` no avisa al padre (p. ej. al reiniciar un formulario). */
  limpiar(emitir = true): void {
    this.control.setValue("", { emitEvent: false });
    this.opciones = [];
    if (emitir) this.seleccion.emit(null);
  }

  /** Muestra un texto sin buscar ni emitir (p. ej. "07193 - NOMBRE" al editar). */
  fijarTexto(texto: string): void {
    this.control.setValue(texto, { emitEvent: false });
    this.opciones = [];
  }
}

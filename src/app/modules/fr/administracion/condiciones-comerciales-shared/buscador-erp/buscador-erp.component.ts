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
import { debounceTime, distinctUntilChanged, filter, switchMap, tap } from "rxjs/operators";
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
  /** Ya se buscó ese texto y no hubo coincidencias (para mostrar "Sin resultados"). */
  sinResultados = false;
  /** Texto del elemento elegido; si el usuario lo cambia, la selección deja de valer. */
  private _textoElegido = "";
  private _sub?: Subscription;

  constructor(private _catalogos: CatalogosComercialesService) {}

  ngOnInit(): void {
    this.control.setValue(this.texto, { emitEvent: false });
    this._textoElegido = this.texto;
    this._sub = this.control.valueChanges
      .pipe(
        // Al elegir una opción el autocompletado escribe el objeto elegido en el control; eso no es
        // texto del usuario y no debe anular la selección (elegir() pone luego el texto "código - nombre").
        filter((valor) => valor === null || typeof valor === "string"),
        debounceTime(300),
        distinctUntilChanged(),
        tap((valor) => {
          const texto = String(valor ?? "");
          if (texto === this._textoElegido) return;
          // Si borra o cambia el texto de lo que había elegido, ya no hay selección.
          if (this._textoElegido && texto !== this._textoElegido) {
            this._textoElegido = "";
            this.seleccion.emit(null);
          } else if (!texto.trim()) {
            this.seleccion.emit(null);
          }
        }),
        switchMap((valor) => this._buscar(String(valor ?? "")))
      )
      .subscribe((opciones) => this._mostrar(opciones));
  }

  ngOnChanges(cambios: SimpleChanges): void {
    if (cambios['texto'] && !cambios['texto'].firstChange) {
      this.control.setValue(this.texto, { emitEvent: false });
      this._textoElegido = this.texto;
    }
    if (cambios['deshabilitado']) {
      if (this.deshabilitado) this.control.disable({ emitEvent: false });
      else this.control.enable({ emitEvent: false });
    }
  }

  ngOnDestroy(): void {
    this._sub?.unsubscribe();
  }

  /** Al entrar al campo vacío se muestran los primeros disponibles. */
  alEnfocar(): void {
    if (this.deshabilitado || String(this.control.value ?? "").trim() || this.opciones.length) return;
    this.buscando = true;
    const lista$: Observable<(ICodigoNombre | IArticuloBusqueda)[]> =
      this.tipo === "cliente" ? this._catalogos.buscarClientes("") : this._catalogos.buscarArticulos("");
    lista$.subscribe((opciones) => this._mostrar(opciones, false));
  }

  /**
   * Al salir del campo sin elegir de la lista: si el texto es exactamente el código (o el nombre)
   * de una opción, se toma esa; así escribir "16001" y salir también vale.
   */
  alSalir(): void {
    const texto = String(this.control.value ?? "").trim().toUpperCase();
    if (!texto || this._textoElegido) return;
    const exacta = this.opciones.find(
      (o) => o.codigo.toUpperCase() === texto || String(o.nombre ?? "").trim().toUpperCase() === texto
    );
    if (exacta) this._fijar(exacta);
  }

  private _mostrar(opciones: (ICodigoNombre | IArticuloBusqueda)[], marcarVacio = true): void {
    this.opciones = opciones;
    this.buscando = false;
    this.sinResultados = marcarVacio && !opciones.length && String(this.control.value ?? "").trim().length >= 2;
  }

  private _buscar(texto: string): Observable<(ICodigoNombre | IArticuloBusqueda)[]> {
    const q = texto.trim();
    this.sinResultados = false;
    if (q.length < 2 || q.includes(" - ")) return of([]);
    this.buscando = true;
    return this.tipo === "cliente"
      ? this._catalogos.buscarClientes(q)
      : this._catalogos.buscarArticulos(q);
  }

  /** Texto que muestra el campo para una opción (o el texto escrito tal cual). */
  readonly mostrar = (valor: ICodigoNombre | string | null): string =>
    !valor ? "" : typeof valor === "string" ? valor : `${valor.codigo} - ${valor.nombre}`;

  elegir(evento: MatAutocompleteSelectedEvent): void {
    this._fijar(evento.option.value as ICodigoNombre);
  }

  private _fijar(item: ICodigoNombre): void {
    this._textoElegido = `${item.codigo} - ${item.nombre}`;
    this.control.setValue(this._textoElegido, { emitEvent: false });
    this.opciones = [];
    this.sinResultados = false;
    this.seleccion.emit(item);
  }

  /** Borra el texto. Con `emitir = false` no avisa al padre (p. ej. al reiniciar un formulario). */
  limpiar(emitir = true): void {
    this.control.setValue("", { emitEvent: false });
    this._textoElegido = "";
    this.opciones = [];
    this.sinResultados = false;
    if (emitir) this.seleccion.emit(null);
  }

  /** Muestra un texto sin buscar ni emitir (p. ej. "07193 - NOMBRE" al editar). */
  fijarTexto(texto: string): void {
    this.control.setValue(texto, { emitEvent: false });
    this._textoElegido = texto;
    this.opciones = [];
  }
}

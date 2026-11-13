import { Component, forwardRef, Input, OnChanges } from "@angular/core";
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from "@angular/forms";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";

/** Opción del selector: valor que se guarda en el formulario + texto que se ve y se busca. */
export interface IOpcionBuscable {
  valor: string | number;
  texto: string;
}

const normalizar = (t: string): string =>
  String(t ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/**
 * Selector con búsqueda: se escribe parte del código o del nombre y la lista se filtra (sin tildes
 * ni mayúsculas). Funciona con formControlName como un mat-select; el valor vacío (null) es "Todos".
 */
@Component({
  selector: "app-select-buscable",
  templateUrl: "./select-buscable.component.html",
  styleUrls: ["./select-buscable.component.scss"],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SelectBuscableComponent), multi: true },
  ],
})
export class SelectBuscableComponent implements ControlValueAccessor, OnChanges {
  @Input() etiqueta = "";
  @Input() opciones: IOpcionBuscable[] = [];
  /** Texto de la opción vacía (null). */
  @Input() textoTodos = "Todos";
  @Input() placeholder = "Escriba para buscar…";

  texto = new FormControl("");
  filtradas: IOpcionBuscable[] = [];
  deshabilitado = false;

  private _valor: string | number | null = null;
  private _onChange: (v: string | number | null) => void = () => undefined;
  private _onTouched: () => void = () => undefined;

  constructor() {
    this.texto.valueChanges.subscribe((t) => this._filtrar(typeof t === "string" ? t : ""));
  }

  ngOnChanges(): void {
    // Llegaron (o cambiaron) las opciones: mostrar el texto del valor actual.
    this._mostrarValor();
    this._filtrar("");
  }

  writeValue(valor: string | number | null): void {
    this._valor = valor ?? null;
    this._mostrarValor();
  }

  registerOnChange(fn: (v: string | number | null) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(deshabilitado: boolean): void {
    this.deshabilitado = deshabilitado;
    if (deshabilitado) this.texto.disable({ emitEvent: false });
    else this.texto.enable({ emitEvent: false });
  }

  /** Lo que muestra el campo para un valor elegido (el autocompletado escribe el valor en el input). */
  readonly mostrar = (v: string | number | null): string =>
    typeof v === "string" && !this.opciones.some((o) => o.valor === v) ? v : this.opciones.find((o) => o.valor === v)?.texto ?? "";

  /** Al entrar se ve toda la lista (aunque el campo muestre el elegido). */
  alEnfocar(): void {
    this._filtrar("");
  }

  elegir(evento: MatAutocompleteSelectedEvent): void {
    const valor = evento.option.value as string | number | null;
    this._valor = valor ?? null;
    this._mostrarValor();
    this._onChange(this._valor);
  }

  /** Al salir sin elegir de la lista se vuelve a mostrar lo que estaba elegido. */
  alSalir(): void {
    this._onTouched();
    this._mostrarValor();
  }

  limpiar(evento: Event): void {
    evento.stopPropagation();
    this._valor = null;
    this._mostrarValor();
    this._onChange(null);
  }

  get tieneValor(): boolean {
    return this._valor !== null && this._valor !== "";
  }

  private _mostrarValor(): void {
    const actual = this.opciones.find((o) => o.valor === this._valor);
    this.texto.setValue(this.tieneValor ? actual?.texto ?? String(this._valor) : "", { emitEvent: false });
  }

  private _filtrar(t: string): void {
    const q = normalizar(t).trim();
    const actual = this.opciones.find((o) => o.valor === this._valor)?.texto;
    // Si el campo muestra lo ya elegido, se lista todo.
    if (!q || t === actual) {
      this.filtradas = this.opciones;
      return;
    }
    const palabras = q.split(/\s+/);
    this.filtradas = this.opciones.filter((o) => {
      const texto = normalizar(o.texto);
      return palabras.every((p) => texto.includes(p));
    });
  }
}

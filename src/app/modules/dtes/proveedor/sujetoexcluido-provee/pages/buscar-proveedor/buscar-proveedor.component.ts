import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { FormControl } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Subscription, of } from "rxjs";
import { catchError, debounceTime, distinctUntilChanged, map, switchMap, tap } from "rxjs/operators";
import { VendedorApiService } from "@app/modules/as/tablas/funcionarios/vendedores/services/vendedor-api.service";
import { IProveedorBusqueda } from "@app/modules/as/tablas/funcionarios/vendedores/services/vendedor-api-model-interface";

/**
 * Lupa de proveedores (Sujeto Excluido): busca en el ERP por código, nombre, alias o DUI/NIT
 * y devuelve el proveedor elegido al cerrar.
 */
@Component({
  selector: "app-buscar-proveedor",
  templateUrl: "./buscar-proveedor.component.html",
  styleUrls: ["./buscar-proveedor.component.scss"],
})
export class BuscarProveedorComponent implements OnInit, OnDestroy {
  readonly texto = new FormControl("");
  proveedores: IProveedorBusqueda[] = [];
  buscando = false;
  error = "";
  private _sub?: Subscription;

  constructor(
    private _api: VendedorApiService,
    private _dialogRef: MatDialogRef<BuscarProveedorComponent, IProveedorBusqueda>,
    @Inject(MAT_DIALOG_DATA) public data: { texto?: string } | null
  ) {}

  ngOnInit(): void {
    this._sub = this.texto.valueChanges
      .pipe(
        debounceTime(300),
        map((v) => String(v ?? "").trim()),
        distinctUntilChanged(),
        tap(() => {
          this.buscando = true;
          this.error = "";
        }),
        switchMap((q) =>
          this._api.buscarProveedores(q).pipe(
            map((r) => {
              if (!r.success) throw new Error("busqueda");
              return r.result || [];
            }),
            catchError((e: unknown) => {
              const estado = e instanceof HttpErrorResponse ? e.status : 0;
              this.error =
                estado === 404
                  ? "El servidor todavía no tiene la búsqueda de proveedores (GET /proveedor?q=). Falta publicar el backend actualizado. Mientras tanto escriba el DUI/NIT en el formulario."
                  : "No se pudo consultar los proveedores. Intente de nuevo.";
              return of([] as IProveedorBusqueda[]);
            })
          )
        )
      )
      .subscribe((lista) => {
        this.proveedores = lista;
        this.buscando = false;
      });
    // Arranca con lo que ya estaba escrito en el DUI (o con los primeros proveedores).
    this.texto.setValue(this.data?.texto ?? "");
  }

  ngOnDestroy(): void {
    this._sub?.unsubscribe();
  }

  elegir(p: IProveedorBusqueda): void {
    this._dialogRef.close(p);
  }

  /** Enter en el buscador: si hay un solo resultado, se elige. */
  alEnter(): void {
    if (this.proveedores.length === 1) this.elegir(this.proveedores[0]);
  }

  limpiar(): void {
    this.texto.setValue("");
  }

  inactivo(p: IProveedorBusqueda): boolean {
    return String(p.ACTIVO ?? "S").trim().toUpperCase() === "N";
  }
}

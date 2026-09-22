import { Component, OnDestroy, OnInit } from "@angular/core";
import { PageEvent } from "@angular/material/paginator";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { Subject } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { VendedorErpApiService } from "../../service/vendedor-erp-api.service";
import { IResponseVendedorErp } from "../../model/agente-fr-model-interface";

@Component({
  selector: "app-agentes-page",
  templateUrl: "./agentes-page.component.html",
  styleUrls: ["./agentes-page.component.scss"],
})
export class AgentesPageComponent implements OnInit, OnDestroy {
  constructor(
    private _vendedorErpApiService: VendedorErpApiService,
    private _snotifyService: SnotifyService
  ) {}

  vendedores: IResponseVendedorErp[] = [];
  displayedColumns: string[] = [
    "codigo",
    "nombre",
    "empleado",
    "telefono",
    "correo",
    "comision",
  ];

  q = "";
  page = 1;
  limit = 20;
  total = 0;

  cargando = false;

  private _busqueda$ = new Subject<string>();

  ngOnInit(): void {
    this._busqueda$
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((q) => {
        this.q = q;
        this.page = 1;
        this._cargarPagina();
      });
    this._cargarPagina();
  }

  ngOnDestroy(): void {
    this._busqueda$.complete();
  }

  onBuscar(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    this._busqueda$.next(valor.trim());
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.limit = event.pageSize;
    this._cargarPagina();
  }

  correo(vendedor: IResponseVendedorErp): string {
    return vendedor.E_MAIL || vendedor.Correo || "";
  }

  private _cargarPagina(): void {
    this.cargando = true;
    this._vendedorErpApiService
      .getVendedoresErp(this.q, this.page, this.limit)
      .subscribe({
        next: (response) => {
          this.cargando = false;
          if (response.success) {
            this.vendedores = response.result;
            this.total = response.pagination
              ? response.pagination.total
              : response.result.length;
          } else {
            this._snotifyService.error(
              response.errors?.[0] ??
                "Error al consultar los vendedores del ERP",
              {
                position: SnotifyPosition.rightTop,
              }
            );
          }
        },
        error: () => {
          this.cargando = false;
          this._snotifyService.error(
            "No fue posible consultar los vendedores del ERP",
            { position: SnotifyPosition.rightTop }
          );
        },
      });
  }
}

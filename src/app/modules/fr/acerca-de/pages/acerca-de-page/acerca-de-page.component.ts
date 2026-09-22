import { Component } from "@angular/core";

interface ICaracteristica {
  icono: string;
  titulo: string;
  descripcion: string;
}

const CARACTERISTICAS: ICaracteristica[] = [
  {
    icono: "alt_route",
    titulo: "Rutas y Ruteo",
    descripcion:
      "Administracion de rutas, asignacion de clientes, agentes y bodegas para preventa y facturacion.",
  },
  {
    icono: "phone_iphone",
    titulo: "Dispositivo Movil",
    descripcion:
      "Captura de pedidos, facturas, cobros, devoluciones y visitas desde HandHelds en campo.",
  },
  {
    icono: "sync",
    titulo: "Sincronizacion",
    descripcion:
      "Carga de datos entre SoftlandERP, las tablas intermedias y los dispositivos moviles.",
  },
  {
    icono: "summarize",
    titulo: "Reportes",
    descripcion:
      "Indicadores de sincronizacion, visitas, ventas en consignacion y liquidacion de agentes.",
  },
];

@Component({
  selector: "app-acerca-de-page",
  templateUrl: "./acerca-de-page.component.html",
  styleUrls: ["./acerca-de-page.component.scss"],
})
export class AcercaDePageComponent {
  version = "7.00";
  caracteristicas: ICaracteristica[] = CARACTERISTICAS;
}

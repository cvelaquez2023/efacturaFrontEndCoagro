import { Injectable } from "@angular/core";
import { ICondicionCliente, IPromocion } from "./condiciones-comerciales.model";

/**
 * Datos de prueba en memoria (se pierden al recargar) mientras el backend no expone
 * /fr/condicionCliente y /fr/promocion. Sembrado con los ejemplos del correo de COAGRO.
 * ESTADO se recalcula al leer; el valor guardado aquí no importa.
 */
@Injectable({
  providedIn: "root",
})
export class CondicionesMockStoreService {
  condiciones: ICondicionCliente[] = [];
  promociones: IPromocion[] = [];
  private _idCondicion = 0;
  private _idPromocion = 0;
  private _idProducto = 0;

  constructor() {
    this._sembrar();
  }

  siguienteIdCondicion(): number {
    return ++this._idCondicion;
  }

  siguienteIdPromocion(): number {
    return ++this._idPromocion;
  }

  siguienteIdProducto(): number {
    return ++this._idProducto;
  }

  private _sembrar(): void {
    const cartera = {
      "00986": ["AGROPECUARIA EL SERVIDOR, S.A. DE C.V.", "Baudilio Mejía", "003", true],
      "07193": [
        "AGROSERVICIO EL GATO AGRICOLA, SOCIEDAD ANONIMA DE CAPITAL VARIABLE",
        "Juan Carlos Guardado",
        "001",
        true,
      ],
      "06018": ["ANGELA MORENA FERRUFINO LOZANO", "Jennyfer Batres", "002", true],
      "00158": ["ARMANDO MARIN MACHADO PORTILLO", "Jennyfer Batres", "", false],
      "00212": ["CAPCYSA DE R.L.", "Jennyfer Batres", "002", true],
    } as Record<string, [string, string, string, boolean]>;

    const condicion = (
      cliente: string,
      alcance: "A" | "L" | "T",
      valor: string,
      valorDescripcion: string,
      descuento: number | null,
      precio: number | null,
      inicio: string,
      fin: string | null,
      cantidadMin: number | null = null
    ): ICondicionCliente => {
      const [nombre, agente, ruta, enCartera] = cartera[cliente];
      return {
        ID: this.siguienteIdCondicion(),
        CLIENTE: cliente,
        CLIENTE_NOMBRE: nombre,
        ALCANCE: alcance,
        VALOR: valor,
        VALOR_DESCRIPCION: valorDescripcion,
        DESCUENTO_MAX: descuento,
        PRECIO_ESPECIAL: precio,
        CANTIDAD_MIN: cantidadMin,
        FECHA_INICIO: inicio,
        FECHA_FIN: fin,
        ACTIVA: "S",
        NOTAS: null,
        ESTADO: "VIGENTE",
        RUTAS: ruta,
        AGENTE: null,
        AGENTE_NOMBRE: agente,
        EN_CARTERA: enCartera,
        USUARIO_CREACION: "demo",
        FECHA_CREACION: "2026-11-01T08:00:00",
      };
    };

    this.condiciones = [
      condicion("00986", "A", "16003", "CIPER-CLOR X 356 ML", 8, null, "2026-11-01", null),
      condicion("00986", "L", "0005", "Productos Bayer Vet", 6, null, "2026-09-01", "2026-10-31"),
      condicion("07193", "T", "CREDELIO", "CREDELIO", 10, null, "2026-11-01", null),
      condicion("07193", "T", "BRAVECTO", "BRAVECTO", 10, null, "2026-11-01", null),
      condicion("07193", "L", "0010", "Productos Vet Calox", 10, null, "2026-11-01", null),
      condicion("06018", "L", "0007", "Productos Reveex", 5, null, "2026-11-01", null),
      condicion("06018", "L", "0010", "Productos Vet Calox", 7, null, "2026-11-01", null),
      condicion("00158", "L", "0010", "Productos Vet Calox", 7, null, "2026-11-01", null),
      condicion("00212", "L", "0010", "Productos Vet Calox", 10, null, "2026-11-01", "2026-12-31"),
      condicion("00212", "A", "16001", "ALBENDAZOL 20% X 100 ML", null, 5.8, "2026-12-01", "2027-01-31", 50),
    ];

    const producto = (
      alcance: "A" | "L" | "T",
      valor: string,
      descripcion: string,
      cantidadMin: number | null,
      descuento: number | null,
      precio: number | null
    ) => ({
      ID: this.siguienteIdProducto(),
      ALCANCE: alcance,
      VALOR: valor,
      VALOR_DESCRIPCION: descripcion,
      CANTIDAD_MIN: cantidadMin,
      DESCUENTO: descuento,
      PRECIO_ESPECIAL: precio,
    });

    this.promociones = [
      {
        ID: this.siguienteIdPromocion(),
        TITULO: "Compre 1 caja de Credelio y llévese 1 Jabón Asuntol bonificado",
        DESCRIPCION: null,
        TIPO: "B",
        FECHA_INICIO: "2026-11-01",
        FECHA_FIN: "2026-12-31",
        DESTINO: "T",
        ARTICULO_BONIFICADO: "15415",
        ARTICULO_BONIFICADO_DESCRIPCION: "ASUNTOL JABON X 100 GR",
        CANTIDAD_BONIFICADA: 1,
        ACTIVA: "S",
        ESTADO: "VIGENTE",
        productos: [producto("T", "CREDELIO", "CREDELIO", 1, null, null)],
        destinos: [],
      },
      {
        ID: this.siguienteIdPromocion(),
        TITULO: "Credelio + 112.5 mg al precio de Credelio 112.5 mg",
        DESCRIPCION: null,
        TIPO: "P",
        FECHA_INICIO: "2026-11-01",
        FECHA_FIN: "2026-11-30",
        DESTINO: "T",
        ARTICULO_BONIFICADO: null,
        ARTICULO_BONIFICADO_DESCRIPCION: null,
        CANTIDAD_BONIFICADA: null,
        ACTIVA: "S",
        ESTADO: "VIGENTE",
        productos: [producto("A", "15064", "CREDELIO + 112.5 MG X 3 TAB", null, null, 33.25)],
        destinos: [],
      },
      {
        ID: this.siguienteIdPromocion(),
        TITULO: "Compra 1 CARPROFENO X 100 TAB y llévese GRATIS 1 CARPROFENO X 10 TAB",
        DESCRIPCION: null,
        TIPO: "B",
        FECHA_INICIO: "2026-11-01",
        FECHA_FIN: "2026-11-30",
        DESTINO: "T",
        ARTICULO_BONIFICADO: "16117-1",
        ARTICULO_BONIFICADO_DESCRIPCION: "CARPROFENO X 10 TAB",
        CANTIDAD_BONIFICADA: 1,
        ACTIVA: "S",
        ESTADO: "VIGENTE",
        productos: [producto("A", "16117", "CARPROFENO X 100 TAB", 1, null, null)],
        destinos: [],
      },
      {
        ID: this.siguienteIdPromocion(),
        TITULO: "Temporada navideña: toda la línea Calox 15 %",
        DESCRIPCION: "Descuento de temporada para todos los clientes en diciembre.",
        TIPO: "D",
        FECHA_INICIO: "2026-12-01",
        FECHA_FIN: "2026-12-31",
        DESTINO: "T",
        ARTICULO_BONIFICADO: null,
        ARTICULO_BONIFICADO_DESCRIPCION: null,
        CANTIDAD_BONIFICADA: null,
        ACTIVA: "S",
        ESTADO: "PROGRAMADA",
        productos: [producto("L", "0010", "Productos Vet Calox", null, 15, null)],
        destinos: [],
      },
    ];
  }
}

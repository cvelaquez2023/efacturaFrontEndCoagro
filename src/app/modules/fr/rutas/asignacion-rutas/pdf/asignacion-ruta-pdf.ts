import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { Content, TableCell, TDocumentDefinitions } from "pdfmake/interfaces";
import {
  DIAS_SEMANA,
  DiaSemana,
} from "../model/asignacion-ruta-model-interface";

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
(pdfMake as any).vfs = (pdfFonts as any).pdfMake.vfs;

export interface IReporteCampo {
  codigo: string;
  nombre: string;
}

export interface IReporteClienteDia {
  cliente: string;
  nombre: string;
  orden: number;
}

export interface IReporteAsignacionRuta {
  ruta: IReporteCampo;
  activa: boolean;
  compania: IReporteCampo;
  agente: IReporteCampo;
  handheld: IReporteCampo;
  bodega: IReporteCampo;
  grupoArticulo: IReporteCampo;
  clientesPorDia: Map<DiaSemana, IReporteClienteDia[]>;
}

const NOMBRE_DIA: Record<DiaSemana, string> = {
  Lunes: "Lunes",
  Martes: "Martes",
  Miercoles: "Miércoles",
  Jueves: "Jueves",
  Viernes: "Viernes",
  Sabado: "Sábado",
  Domingo: "Domingo",
};

const COLOR_PRIMARIO = "#1f3864";
const COLOR_FONDO = "#e8edf5";

const campo = (valor: IReporteCampo): string => {
  if (!valor.codigo) return "—";
  return valor.nombre ? `${valor.codigo} - ${valor.nombre}` : valor.codigo;
};

const filaCabecera = (etiqueta: string, valor: string): Content[] => [
  { text: etiqueta, bold: true, color: COLOR_PRIMARIO },
  { text: valor },
];

const construirCabecera = (reporte: IReporteAsignacionRuta): Content[] => [
  {
    columns: [
      {
        text: "Reporte de Asignación de Ruta",
        style: "titulo",
      },
      {
        text: new Date().toLocaleString("es-SV"),
        alignment: "right",
        fontSize: 8,
        color: "#666",
        margin: [0, 6, 0, 0],
      },
    ],
  },
  {
    canvas: [
      {
        type: "line",
        x1: 0,
        y1: 4,
        x2: 532,
        y2: 4,
        lineWidth: 1.5,
        lineColor: COLOR_PRIMARIO,
      },
    ],
    margin: [0, 0, 0, 10],
  },
  {
    table: {
      widths: [90, "*", 90, "*"],
      body: [
        [
          ...filaCabecera("Ruta", campo(reporte.ruta)),
          ...filaCabecera("Estado", reporte.activa ? "Activa" : "Inactiva"),
        ],
        [
          ...filaCabecera("Agente", campo(reporte.agente)),
          ...filaCabecera("HandHeld", campo(reporte.handheld)),
        ],
        [
          ...filaCabecera("Camión / Bodega", campo(reporte.bodega)),
          ...filaCabecera("Grupo Artículo", campo(reporte.grupoArticulo)),
        ],
        [
          ...filaCabecera("Compañía", campo(reporte.compania)),
          ...filaCabecera("Total clientes", String(totalClientes(reporte))),
        ],
      ],
    },
    layout: {
      fillColor: () => COLOR_FONDO,
      hLineColor: () => "#ffffff",
      vLineColor: () => "#ffffff",
      paddingTop: () => 4,
      paddingBottom: () => 4,
    },
    margin: [0, 0, 0, 14],
  },
];

const totalClientes = (reporte: IReporteAsignacionRuta): number =>
  new Set(
    Array.from(reporte.clientesPorDia.values()).flatMap((clientes) =>
      clientes.map((c) => c.cliente)
    )
  ).size;

const construirDia = (
  dia: DiaSemana,
  clientes: IReporteClienteDia[]
): Content[] => {
  const encabezado: Content = {
    text: `${NOMBRE_DIA[dia]}  (${clientes.length} cliente${
      clientes.length === 1 ? "" : "s"
    })`,
    style: "dia",
  };
  if (!clientes.length) {
    return [
      encabezado,
      {
        text: "Sin clientes asignados",
        italics: true,
        color: "#888",
        fontSize: 9,
        margin: [4, 0, 0, 10],
      },
    ];
  }
  return [
    encabezado,
    {
      table: {
        headerRows: 1,
        widths: [40, 90, "*"],
        body: [
          [
            { text: "Orden", style: "th" },
            { text: "Cliente", style: "th" },
            { text: "Nombre", style: "th" },
          ],
          ...clientes.map((c): TableCell[] => [
            { text: String(c.orden), alignment: "center" },
            c.cliente,
            c.nombre || "—",
          ]),
        ],
      },
      layout: {
        fillColor: (fila: number) =>
          fila === 0 ? COLOR_PRIMARIO : fila % 2 === 0 ? "#f5f7fb" : null,
        hLineWidth: () => 0.5,
        vLineWidth: () => 0,
        hLineColor: () => "#d0d7e5",
      },
      fontSize: 9,
      margin: [0, 0, 0, 12],
    },
  ];
};

/** Arma el PDF de una asignación de ruta (cabecera + clientes separados por día) y lo abre en
 *  una pestaña del navegador, desde donde se puede descargar o imprimir. `ventana` debe abrirse
 *  de forma síncrona en el click (antes de las consultas al backend) para que el bloqueador de
 *  ventanas emergentes no la bloquee. */
export const abrirReporteAsignacionRuta = (
  reporte: IReporteAsignacionRuta,
  ventana: Window | null
): void => {
  const docDefinition: TDocumentDefinitions = {
    pageSize: "LETTER",
    pageMargins: [40, 40, 40, 40],
    info: { title: `Asignación de Ruta ${reporte.ruta.codigo}` },
    defaultStyle: { font: "Roboto", fontSize: 10 },
    styles: {
      titulo: { fontSize: 16, bold: true, color: COLOR_PRIMARIO },
      dia: {
        fontSize: 11,
        bold: true,
        color: COLOR_PRIMARIO,
        margin: [0, 4, 0, 4],
      },
      th: { bold: true, color: "#ffffff" },
    },
    footer: (pagina: number, total: number) => ({
      text: `Página ${pagina} de ${total}`,
      alignment: "right",
      fontSize: 8,
      color: "#888",
      margin: [0, 10, 40, 0],
    }),
    content: [
      ...construirCabecera(reporte),
      ...DIAS_SEMANA.flatMap((dia) =>
        construirDia(dia, reporte.clientesPorDia.get(dia) ?? [])
      ),
    ],
  };

  pdfMake.createPdf(docDefinition).open({}, ventana);
};

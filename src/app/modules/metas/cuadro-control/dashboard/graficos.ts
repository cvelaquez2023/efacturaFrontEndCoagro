/**
 * Opciones de Highcharts para el Dashboard (estilo uniforme: Arial, colores de la empresa,
 * sin créditos, tooltips en español con formato de dinero/unidades).
 */
import * as Highcharts from "highcharts";

export const COLORES = {
  marino: "#1B2A5C",
  rojo: "#C62828",
  verde: "#3AAA35",
  turquesa: "#2FA39A",
  ambar: "#F2A900",
  gris: "#9AA0A6",
  azul: "#1565C0",
  morado: "#6A4C93",
};

export const PALETA = [
  COLORES.marino,
  COLORES.rojo,
  COLORES.turquesa,
  COLORES.ambar,
  COLORES.verde,
  COLORES.azul,
  COLORES.morado,
  "#E76F51",
  "#8D6E63",
  COLORES.gris,
];

const dinero = (v: number) => "$" + Highcharts.numberFormat(v, 2, ".", ",");
const entero = (v: number) => Highcharts.numberFormat(v, 0, ".", ",");

const base = (alto = 320): Highcharts.Options => ({
  chart: { height: alto, style: { fontFamily: "Arial, Roboto, sans-serif" }, backgroundColor: "transparent", spacing: [10, 10, 10, 10] },
  title: { text: undefined },
  credits: { enabled: false },
  colors: PALETA,
  legend: { itemStyle: { fontWeight: "normal", color: "#3c4043" } },
  lang: { noData: "Sin datos para los filtros elegidos" } as Highcharts.LangOptions,
  accessibility: { enabled: false },
});

/** Columnas de ventas ($) + línea de unidades (eje derecho). */
export const graficoTendencia = (categorias: string[], ventas: number[], unidades: number[], titulo: string): Highcharts.Options => ({
  ...base(330),
  xAxis: { categories: categorias, title: { text: titulo }, crosshair: true },
  yAxis: [
    { title: { text: "Ventas ($)" }, labels: { formatter: function () { return dinero(Number(this.value)); } } },
    { title: { text: "Unidades" }, opposite: true },
  ],
  tooltip: {
    shared: true,
    formatter: function () {
      const puntos = this.points ?? [];
      return `<b>${this.x}</b><br/>` + puntos.map((p) => `<span style="color:${p.color}">●</span> ${p.series.name}: <b>${p.series.index === 0 ? dinero(Number(p.y)) : entero(Number(p.y))}</b>`).join("<br/>");
    },
  },
  plotOptions: { column: { borderRadius: 3, borderWidth: 0 } },
  series: [
    { type: "column", name: "Ventas ($)", data: ventas, color: COLORES.marino },
    { type: "spline", name: "Unidades", data: unidades, yAxis: 1, color: COLORES.rojo, marker: { radius: 3 } },
  ],
});

/** Barras horizontales (ranking) en dinero, con un dato extra en el tooltip. */
export const graficoRanking = (
  nombres: string[],
  valores: number[],
  extra: string[],
  color = COLORES.marino,
  esDinero = true
): Highcharts.Options => ({
  ...base(Math.max(260, nombres.length * 28 + 60)),
  chart: { ...base().chart, type: "bar", height: Math.max(260, nombres.length * 28 + 60) },
  xAxis: { categories: nombres, labels: { style: { fontSize: "11px" } } },
  yAxis: { title: { text: undefined }, labels: { formatter: function () { return esDinero ? dinero(Number(this.value)) : entero(Number(this.value)); } } },
  legend: { enabled: false },
  tooltip: {
    formatter: function () {
      const i = this.point.index;
      return `<b>${this.x}</b><br/>${esDinero ? dinero(Number(this.y)) : entero(Number(this.y))}${extra[i] ? "<br/>" + extra[i] : ""}`;
    },
  },
  plotOptions: {
    bar: {
      borderRadius: 3,
      borderWidth: 0,
      color,
      dataLabels: { enabled: true, formatter: function () { return esDinero ? dinero(Number(this.y)) : entero(Number(this.y)); }, style: { fontWeight: "normal", fontSize: "10px" } },
    },
  },
  series: [{ type: "bar", name: "Valor", data: valores }],
});

/** % de avance contra la meta por vendedor (rojo < 50 %, ámbar < 100 %, verde ≥ 100 %) y línea del 100 %. */
export const graficoAvanceMetas = (nombres: string[], avances: number[], detalle: string[]): Highcharts.Options => ({
  ...base(Math.max(240, nombres.length * 28 + 60)),
  chart: { ...base().chart, type: "bar", height: Math.max(240, nombres.length * 28 + 60) },
  xAxis: { categories: nombres, labels: { style: { fontSize: "11px" } } },
  yAxis: {
    title: { text: undefined },
    labels: { format: "{value}%" },
    plotLines: [{ value: 100, color: COLORES.verde, width: 2, dashStyle: "Dash", zIndex: 5, label: { text: "Meta 100 %", style: { color: COLORES.verde } } }],
  },
  legend: { enabled: false },
  tooltip: {
    formatter: function () {
      return `<b>${this.x}</b><br/>Avance: <b>${Highcharts.numberFormat(Number(this.y), 1)}%</b><br/>${detalle[this.point.index] ?? ""}`;
    },
  },
  plotOptions: { bar: { borderRadius: 3, borderWidth: 0, dataLabels: { enabled: true, format: "{y:.0f}%", style: { fontWeight: "normal", fontSize: "10px" } } } },
  series: [
    {
      type: "bar",
      name: "Avance",
      data: avances.map((a) => ({ y: Number((a * 100).toFixed(1)), color: a >= 1 ? COLORES.verde : a >= 0.5 ? COLORES.ambar : COLORES.rojo })),
    },
  ],
});

/** Dona de participación (top N + "Otros"). */
export const graficoDona = (datos: { nombre: string; valor: number }[], esDinero = true, top = 8): Highcharts.Options => {
  const orden = [...datos].filter((d) => d.valor > 0).sort((a, b) => b.valor - a.valor);
  const principales = orden.slice(0, top);
  const otros = orden.slice(top).reduce((t, d) => t + d.valor, 0);
  const puntos = principales.map((d) => ({ name: d.nombre, y: Number(d.valor.toFixed(2)) }));
  if (otros > 0) puntos.push({ name: "Otros", y: Number(otros.toFixed(2)) });
  return {
    ...base(330),
    chart: { ...base().chart, type: "pie", height: 330 },
    tooltip: {
      formatter: function () {
        return `<b>${this.key}</b><br/>${esDinero ? dinero(Number(this.y)) : entero(Number(this.y))} (${Highcharts.numberFormat(Number(this.percentage), 1)}%)`;
      },
    },
    plotOptions: {
      pie: {
        innerSize: "58%",
        borderWidth: 1,
        dataLabels: { enabled: true, format: "{point.name}: {point.percentage:.1f}%", style: { fontWeight: "normal", fontSize: "10px", textOutline: "none" }, distance: 12 },
      },
    },
    series: [{ type: "pie", name: "Participación", data: puntos }],
  };
};

/** Columnas apiladas (p. ej. visitas con/sin pedido por día). */
export const graficoApilado = (categorias: string[], series: { nombre: string; datos: number[]; color: string }[], tituloX: string): Highcharts.Options => ({
  ...base(300),
  chart: { ...base().chart, type: "column", height: 300 },
  xAxis: { categories: categorias, title: { text: tituloX } },
  yAxis: { title: { text: "Visitas" }, allowDecimals: false, stackLabels: { enabled: true, style: { fontWeight: "normal", color: "#3c4043" } } },
  tooltip: { shared: true },
  plotOptions: { column: { stacking: "normal", borderWidth: 0, borderRadius: 2 } },
  series: series.map((s) => ({ type: "column", name: s.nombre, data: s.datos, color: s.color })),
});

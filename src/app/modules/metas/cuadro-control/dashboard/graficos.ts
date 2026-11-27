/**
 * Opciones de Highcharts para el Dashboard de Metas (estilo uniforme: Arial, colores de la empresa,
 * sin créditos, tooltips en español con formato de unidades y porcentajes).
 */
import * as Highcharts from "highcharts";

export const COLORES = {
  marino: "#1B2A5C",
  rojo: "#C62828",
  verde: "#3AAA35",
  turquesa: "#2FA39A",
  ambar: "#F2A900",
  gris: "#9AA0A6",
  grisClaro: "#DADCE0",
  azul: "#1565C0",
};

/** Color de un avance: verde ≥ 100 %, ámbar ≥ 50 %, rojo por debajo. */
export const colorAvance = (avance: number): string =>
  avance >= 1 ? COLORES.verde : avance >= 0.5 ? COLORES.ambar : COLORES.rojo;

const entero = (v: number) => Highcharts.numberFormat(v, 0, ".", ",");
const pct = (v: number) => Highcharts.numberFormat(v, 1, ".", ",") + "%";

const base = (alto = 320): Highcharts.Options => ({
  chart: {
    height: alto,
    style: { fontFamily: "Arial, Roboto, sans-serif" },
    backgroundColor: "transparent",
    spacing: [10, 6, 10, 6],
  },
  title: { text: undefined },
  credits: { enabled: false },
  legend: { itemStyle: { fontWeight: "normal", color: "#3c4043" } },
  lang: { noData: "Sin metas para los filtros elegidos" } as Highcharts.LangOptions,
  accessibility: { enabled: false },
});

/**
 * % de avance contra la meta (barras horizontales coloreadas por estado) con la línea del 100 %.
 * Sirve para vendedores, proveedores, líneas o líderes.
 */
export const graficoAvance = (nombres: string[], avances: number[], detalle: string[]): Highcharts.Options => {
  const alto = Math.max(220, nombres.length * 30 + 70);
  const maximo = Math.max(110, ...avances.map((a) => a * 100 + 10));
  return {
    ...base(alto),
    chart: { ...base().chart, type: "bar", height: alto },
    xAxis: { categories: nombres, labels: { style: { fontSize: "11px", color: "#3c4043" } }, lineColor: COLORES.grisClaro },
    yAxis: {
      title: { text: undefined },
      min: 0,
      max: Math.ceil(maximo / 10) * 10,
      labels: { format: "{value}%" },
      gridLineColor: "#eef0f2",
      plotLines: [
        {
          value: 100,
          color: COLORES.verde,
          width: 2,
          dashStyle: "Dash",
          zIndex: 5,
          label: { text: "Meta", align: "right", x: -4, style: { color: COLORES.verde, fontSize: "10px" } },
        },
      ],
    },
    legend: { enabled: false },
    tooltip: {
      formatter: function () {
        return `<b>${this.x}</b><br/>Avance: <b>${pct(Number(this.y))}</b><br/>${detalle[this.point.index] ?? ""}`;
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 3,
        borderWidth: 0,
        pointPadding: 0.12,
        groupPadding: 0.08,
        dataLabels: { enabled: true, format: "{y:.0f}%", style: { fontWeight: "600", fontSize: "10px", textOutline: "none" } },
      },
    },
    series: [
      {
        type: "bar",
        name: "Avance",
        data: avances.map((a) => ({ y: Number((a * 100).toFixed(1)), color: colorAvance(a) })),
      },
    ],
  };
};

/**
 * Mes: unidades vendidas acumuladas por día contra el ritmo ideal (de 0 a la meta) y la meta total.
 * `acumulado` trae null en los días que todavía no llegan.
 */
export const graficoEvolucionMes = (dias: string[], acumulado: (number | null)[], meta: number): Highcharts.Options => {
  const n = dias.length;
  const ideal = dias.map((_, i) => Math.round((meta * (i + 1)) / n));
  return {
    ...base(320),
    xAxis: { categories: dias, title: { text: "Día del mes" }, crosshair: true, lineColor: COLORES.grisClaro },
    yAxis: {
      title: { text: "Unidades" },
      min: 0,
      gridLineColor: "#eef0f2",
      plotLines: meta
        ? [{ value: meta, color: COLORES.verde, width: 2, dashStyle: "Dash", zIndex: 5, label: { text: `Meta ${entero(meta)} u`, style: { color: COLORES.verde, fontSize: "10px" } } }]
        : [],
    },
    tooltip: {
      shared: true,
      formatter: function () {
        const puntos = this.points ?? [];
        const lineas = puntos.map((p) => `<span style="color:${p.color}">●</span> ${p.series.name}: <b>${entero(Number(p.y))}</b>`);
        const real = puntos.find((p) => p.series.index === 0);
        if (real && meta) lineas.push(`Avance: <b>${pct((Number(real.y) / meta) * 100)}</b>`);
        return `<b>Día ${this.x}</b><br/>` + lineas.join("<br/>");
      },
    },
    plotOptions: { series: { marker: { enabled: false, radius: 3 } } },
    series: [
      {
        type: "areaspline",
        name: "Vendido acumulado",
        data: acumulado,
        color: COLORES.marino,
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, "rgba(27,42,92,0.28)"],
            [1, "rgba(27,42,92,0.02)"],
          ],
        },
        lineWidth: 2.5,
      },
      { type: "line", name: "Ritmo ideal", data: ideal, color: COLORES.ambar, dashStyle: "ShortDash", lineWidth: 2 },
    ],
  };
};

/** Año: meta y vendido (unidades) por mes, con el % de avance en el eje derecho. */
export const graficoEvolucionAnio = (meses: string[], metas: number[], vendidos: number[]): Highcharts.Options => ({
  ...base(320),
  xAxis: { categories: meses, crosshair: true, lineColor: COLORES.grisClaro },
  yAxis: [
    { title: { text: "Unidades" }, min: 0, gridLineColor: "#eef0f2" },
    {
      title: { text: "Avance" },
      opposite: true,
      min: 0,
      labels: { format: "{value}%" },
      plotLines: [{ value: 100, color: COLORES.verde, width: 1, dashStyle: "Dash" }],
    },
  ],
  tooltip: {
    shared: true,
    formatter: function () {
      const puntos = this.points ?? [];
      return (
        `<b>${this.x}</b><br/>` +
        puntos
          .map((p) => `<span style="color:${p.color}">●</span> ${p.series.name}: <b>${p.series.index === 2 ? pct(Number(p.y)) : entero(Number(p.y))}</b>`)
          .join("<br/>")
      );
    },
  },
  plotOptions: { column: { borderRadius: 3, borderWidth: 0, groupPadding: 0.12 } },
  series: [
    { type: "column", name: "Meta (u)", data: metas, color: COLORES.grisClaro },
    { type: "column", name: "Vendido (u)", data: vendidos, color: COLORES.marino },
    {
      type: "spline",
      name: "Avance",
      yAxis: 1,
      data: metas.map((m, i) => (m ? Number(((vendidos[i] / m) * 100).toFixed(1)) : null)),
      color: COLORES.rojo,
      marker: { enabled: true, radius: 4 },
    },
  ],
});

/** Dona de cantidades con color propio por punto (p. ej. estado de las metas). */
export const graficoDona = (datos: { nombre: string; valor: number; color: string }[], centro: string): Highcharts.Options => ({
  ...base(320),
  chart: { ...base().chart, type: "pie", height: 320 },
  title: {
    text: centro,
    verticalAlign: "middle",
    floating: true,
    y: -8,
    style: { fontSize: "13px", color: "#5f6368", fontWeight: "normal" },
    useHTML: true,
  },
  tooltip: {
    formatter: function () {
      return `<b>${this.key}</b><br/>${entero(Number(this.y))} metas (${pct(Number(this.percentage))})`;
    },
  },
  legend: { enabled: true, itemStyle: { fontWeight: "normal", color: "#3c4043", fontSize: "11px" } },
  plotOptions: {
    pie: {
      innerSize: "68%",
      borderWidth: 2,
      borderColor: "#ffffff",
      showInLegend: true,
      dataLabels: { enabled: false },
    },
  },
  series: [
    {
      type: "pie",
      name: "Metas",
      data: datos.filter((d) => d.valor > 0).map((d) => ({ name: d.nombre, y: d.valor, color: d.color })),
    },
  ],
});

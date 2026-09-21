/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

(pdfMake as any).vfs = (pdfFonts as any).pdfMake.vfs;

type Product = {
	bodega: string;
	nombre: string;
	cantidad: number;
	unidad: string;
	precio: number;
	descuento: number;
	porDesc: number;
	total: number;
	lote?: string;
	fechaVence?: string;
};

type Resumen = {
	totalNoSuj: number;
	totalExenta: number;
	totalGravada: number;
	subTotalVentas: number;
	totalDescu: number;
	subTotal: number;
	ivaPerci1: number;
	ivaRete1: number;
	reteRenta: number;
	montoTotalOperacion: number;
	totalPagar: number;
	totalLetras: string;
};

type Receptor = {
	nit: string;
	nrc: string;
	nombre: string;
	descActividad: string;
	nombreComercial: string;
	direccion_compl: string;
	telefono: string;
	correo: string;
};

type Empresa = {
	nombre: string;
	complementoDir: string;
	desActividad: string;
	nit: string;
	nrc: string;
	telefono: string;
	logoUrl: string;
};

type Dte = {
	dte: string;
	codigoGeneracion: string;
	selloRecibido: string;
	fechaProce: string;
	tipoDoc: string;
	diasCredito?: string;
	condicionPago?: string;
	formaPago?: string;
	fechavence?: string;
};

type documento = {
	dte: string;
	fechaDocumento: string;
	fechaDocVence: string;
	condicionPago: string;
	diasNeto: number;
	formaPago: string;
};
const PAGE_WIDTH = 228; // 80mm in points (1 inch = 72 points, 80mm ≈ 3.15 inches)
const PAGE_MARGIN = 8;

const money = (value = 0): string =>
	new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(value);

const tipoDocLabel = (tipo: string): string => {
	if (tipo === '01') return 'CONSUMIDOR FINAL';
	if (tipo === '03') return 'COMPROBANTE DE CRÉDITO FISCAL';
	if (tipo === '11') return 'FACTURA EXPORTACIÓN';
	return 'DOCUMENTO TRIBUTARIO ELECTRÓNICO';
};

const splitControlNumber = (dte: string): string => {
	if (!dte) return '';
	return `${dte.substring(0, 15)}-${dte.substring(19, 34)}`;
};

const getDates = (raw: string) => {
	const d = new Date(raw);
	return {
		visible: d.toLocaleString('es-SV'),
		qr: d.toISOString().split('T')[0]
	};
};

const line = '------------------------------------------------';
const buildSeparatorText = (title: string, totalChars = 60, fillChar = '-'): string => {
	const cleanTitle = ` ${String(title).trim().toUpperCase()} `;
	if (cleanTitle.length >= totalChars) {
		return cleanTitle.slice(0, totalChars);
	}

	const remaining = totalChars - cleanTitle.length;
	const left = Math.floor(remaining / 2);
	const right = remaining - left;

	return fillChar.repeat(left) + cleanTitle + fillChar.repeat(right);
};

const separator = (title = '', marginTop = 2, marginBottom = 2) => ({
	text: title ? buildSeparatorText(title, 60, '-') : '-'.repeat(60),
	noWrap: true,
	fontSize: 8,
	color: '#000000',
	bold: true,
	alignment: 'center',

	margin: [0, marginTop, 0, marginBottom]
});
const labelValue = (label: string, value: string, bold = false) => ({
	text: [
		{ text: `${label}: `, bold: true },
		{ text: value || '-', bold }
	],
	fontSize: 8,
	margin: [0, 0.5, 0, 0.5]
});

const moneyRow = (label: string, value: number, emphasized = false) => ({
	columns: [
		{
			width: '*',
			text: label,
			fontSize: emphasized ? 7 : 8,
			bold: emphasized,
			color: emphasized ? '#003b73' : '#000',
			margin: [0, 0.5, 4, 0.5]
		},
		{
			width: 78,
			text: money(value),
			alignment: 'right',
			fontSize: emphasized ? 7 : 8,
			bold: emphasized,
			color: emphasized ? '#003b73' : '#000',
			margin: [0, 0.5, 4, 0.5],
			noWrap: true
		}
	],
	columnGap: 2
});

const buildHeader = (empresa: Empresa, dte: Dte) => {
	const { visible, qr } = getDates(dte.fechaProce);

	return [
		{
			columns: [
				{
					width: 90,
					qr: `https://admin.factura.gob.sv/consultaPublica?ambiente=01&codGen=${dte.codigoGeneracion}&fechaEmi=${qr}`,
					fit: 86,
					eccLevel: 'Q',
					margin: [0, 0, 3, 0]
				},
				{
					width: '*',
					stack: [
						empresa.logoUrl
							? {
									image: `data:image/png;base64,${empresa.logoUrl}`,
									fit: [88, 88],
									alignment: 'center',
									margin: [0, 0, 0, 0]
							  }
							: []
					]
				}
			]
		},
		{ text: 'DOCUMENTO TRIBUTARIO ELECTRÓNICO', fontSize: 12, alignment: 'center', margin: [0, 4, 0, 0] },
		{
			text: tipoDocLabel(dte.tipoDoc),
			fontSize: 10,
			bold: true,
			color: '#0070c0',
			alignment: 'center',
			margin: [0, 1, 0, 3]
		},
		separator('DATOS DEL EMISOR'),
		labelValue('Emisor', empresa.nombre),
		{
			columns: [
				{
					width: '*',
					text: [{ text: 'NIT: ', bold: true }, { text: empresa.nit || '-' }],
					fontSize: 8,
					margin: [0, 0.5, 4, 0.5]
				},
				{
					width: '*',
					text: [{ text: 'NRC: ', bold: true }, { text: empresa.nrc || '-' }],
					fontSize: 8,
					margin: [4, 0.5, 0, 0.5]
				}
			],
			columnGap: 6
		},
		labelValue('Actividad Económica', empresa.desActividad),
		labelValue('Dirección', empresa.complementoDir),
		{
			columns: [
				{
					width: '*',
					text: [{ text: 'Telefono: ', bold: true }, { text: empresa.telefono || '-' }],
					fontSize: 8,
					margin: [0, 0.5, 4, 0.5]
				},
				{
					width: '*',
					text: [{ text: 'Correo: ', bold: true }, { text: 'info@coagro.com.sv' }],
					fontSize: 8,
					margin: [4, 0.5, 0, 0.5]
				}
			],
			columnGap: 6
		},
		separator('DATOS DE FACTURACIÓN'),
		labelValue('Código de Generación', dte.codigoGeneracion),
		labelValue('Sello de Recepción', dte.selloRecibido),
		labelValue('Número de Control', splitControlNumber(dte.dte)),
		labelValue('Fecha y Hora de Generación', visible)
	];
};

const buildCustomer = (receptor: Receptor, cliente: string, vendedor: string) => [
	separator('DATOS DEL RECEPTOR'),
	labelValue('Nombre o Razón Social', cliente || receptor.nombre),
	labelValue('Nombre Comercial', receptor.nombreComercial),
	{
		columns: [
			{
				width: '*',
				text: [{ text: 'NIT: ', bold: true }, { text: receptor.nit || '-' }],
				fontSize: 8,
				margin: [0, 0.5, 4, 0.5]
			},
			{
				width: '*',
				text: [{ text: 'NRC: ', bold: true }, { text: receptor.nrc || '-' }],
				fontSize: 8,
				margin: [4, 0.5, 0, 0.5]
			}
		],
		columnGap: 6
	},
	labelValue('Giro', receptor.descActividad),
	labelValue('Dirección', receptor.direccion_compl),
	labelValue('Teléfono', receptor.telefono),
	labelValue('Correo', receptor.correo)
];

const fmt = (value = 0) =>
	new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(value);

const pct = (value = 0) => `${value.toFixed(0)}%`;

const buildProducts = (products: Product[]) => {
	const content: any[] = [
		separator('DETALLE DE PRODUCTOS'),
		{
			columns: [
				{ width: 30, text: 'CANT.', fontSize: 8, bold: true },
				{ width: '*', text: 'DESCRIPCION', fontSize: 8, bold: true }
			],
			margin: [0, 1, 0, 2]
		}
	];

	for (const p of products) {
		const precioDescuento = p.precio - (p.precio * p.descuento) / 100;

		content.push({
			stack: [
				{
					columns: [
						{
							width: 30,
							text: `${p.cantidad.toFixed(0)}`,
							fontSize: 6,
							bold: true
						},
						{
							width: '*',
							text: p.nombre,
							fontSize: 6,
							bold: true
						}
					],
					margin: [0, 0, 0, 0]
				},
				{
					columns: [
						{
							width: '*',
							text: [{ text: 'P/UNI: ', bold: true }, { text: fmt(p.precio) }],
							fontSize: 6
						},
						{
							width: 82,
							text: [{ text: 'DESC: ', bold: true }, { text: pct(p.porDesc) }],
							fontSize: 6,
							alignment: 'right',
							margin: [0, 0.5, 4, 0.5],
							noWrap: true
						}
					],
					margin: [0, 0, 0, 0]
				},
				{
					columns: [
						{
							width: '*',
							text: [{ text: 'P/DESC: ', bold: true }, { text: fmt(p.total/p.cantidad) }],
							fontSize: 6
						},
						{
							width: 82,
							text: [{ text: 'SUB TOTAL: ', bold: true }, { text: fmt(p.total) }],
							fontSize: 6,
							alignment: 'right',
							margin: [0, 0.5, 4, 0.5],
							noWrap: true
						}
					],
					margin: [0, 0, 0, 0]
				},
				{
					text: [
						{ text: 'Bod: ', bold: true,fontSize: 6, },
						{ text: `${p.bodega}   `,fontSize: 6, },
						{ text: 'Lot: ', bold: true,fontSize: 6, },
						{ text: `${p.lote || '-'}   `,fontSize: 6,	 },
						{ text: 'F. Vence: ', bold: true,fontSize: 6, },
						{ text: `${p.fechaVence || '-'}`, fontSize: 6 }
					],
					fontSize: 6,
					color: '#333',
					margin: [0, 0, 0, 0]
				},
				{
					text: '-'.repeat(52),
					fontSize: 5.4,
					color: '#777',
					alignment: 'center',
					margin: [0, 1, 0, 2]
				}
			]
		});
	}

	return content;
};

const buildPagareBlock = (receptor: Receptor, resumen: Resumen, dte: Dte, documento: documento): any[] => [
	separator('PAGARÉ SIN PROTESTO'),
	{
		stack: [
			{
				text: `Por medio del presente PAGARÉ yo, ${receptor.nombre}, con DUI ó NIT ${
					receptor.nit
				}, me obligo a pagar incondicionalmente, a la orden de Comercial Agropecuaria, Sociedad Anónima de Capital Variable, que se abrevia COAGRO, S.A. DE C.V., la cantidad de: ${resumen.montoTotalOperacion.toFixed(
					2
				)} dólares de los Estados Unidos de América el día estipulado según Fecha de Pago en el presente documento ${
					documento.fechaDocVence
				} a una tasa de interés mensual del 1.5%. Tasa se aplicará a partir del vencimiento del plazo de crédito otorgado.`
			},
			{
				text: 'El DEUDOR pagará todas las sumas aquí establecidas incluyendo los intereses moratorios generados sin necesidad de requerimiento previo.'
			},
			{
				text: `El presente pagaré se suscribe en la Ciudad de San Salvador, San Salvador Centro, el ${documento.fechaDocumento}.`
			}
		],
		fontSize: 6,
		lineHeight: 1.12,
		margin: [0, 2, 0, 0]
	}
];
const buildFirmasBlock = (): any[] => [
	{
		margin: [0, 14, 0, 10],
		columns: [
			{
				width: '*',
				stack: [
					{
						table: {
							widths: [78],
							body: [[{ text: '', border: [true, true, true, true], margin: [0, 30, 0, 30] }]]
						},
						layout: {
							hLineWidth: () => 0.7,
							vLineWidth: () => 0.7,
							hLineColor: () => '#666',
							vLineColor: () => '#666'
						}
					},
					{
						text: 'FIRMA DE RECIBIDO',
						alignment: 'center',
						fontSize: 6,
						margin: [0, 2, 0, 0]
					}
				]
			},
			{
				width: 12,
				text: ''
			},
			{
				width: '*',
				stack: [
					{
						table: {
							widths: [78],
							body: [[{ text: '', border: [true, true, true, true], margin: [0, 30, 0, 30] }]]
						},
						layout: {
							hLineWidth: () => 0.7,
							vLineWidth: () => 0.7,
							hLineColor: () => '#666',
							vLineColor: () => '#666'
						}
					},
					{
						text: 'SELLO',
						alignment: 'center',
						fontSize: 6,
						margin: [0, 2, 0, 0]
					}
				]
			}
		],
		columnGap: 6
	},
	{
		text: ' ',
		margin: [0, 8, 0, 6]
	}
];
const buildTotals = (
	receptor: Receptor,
	resumen: Resumen,
	iva: number,
	dte: Dte,
	vendedor: string,
	documento: documento
) => [
	separator('RESUMEN'),
	moneyRow('Ventas No Sujetas', resumen.totalNoSuj),
	moneyRow('Ventas Exentas', resumen.totalExenta),
	moneyRow('Ventas Gravadas', resumen.totalGravada),
	moneyRow('Sumatoria Ventas', resumen.subTotalVentas),
	moneyRow('Descuentos', resumen.totalDescu),
	moneyRow('Sub Total', resumen.subTotal),
	moneyRow('IVA 13%', iva),
	moneyRow('IVA Percibido', resumen.ivaPerci1),
	moneyRow('IVA Retenido', resumen.ivaRete1),
	moneyRow('Retención Renta', resumen.reteRenta),
	moneyRow('Monto Total Operación', resumen.montoTotalOperacion),
	moneyRow('TOTAL A PAGAR', resumen.montoTotalOperacion),
	{
		text: `TOTAL EN LETRAS: ${resumen.totalLetras}`,
		fontSize: 6,
		bold: true,
		margin: [0, 4, 0, 0]
	},
	{
		text: `FORMA DE PAGO: ${documento.formaPago || '-'}`,
		fontSize: 6,
		color: '#000000',
		margin: [0, 3, 0, 0]
	},
	{
		text: `DIAS DE CREDITO ASIGNADOS: ${documento.diasNeto || '-'}`,
		fontSize: 6,
		color: '#000000',
		margin: [0, 3, 0, 0]
	},
	{
		text: `CODIGO VENDEDOR: ${vendedor || '-'}`,
		fontSize: 6,
		color: '#000000',
		margin: [0, 3, 0, 0]
	},
	separator('NOTAS'),
	{
		stack: [
			{ text: '1. No se aceptan devoluciones después de 15 días de recepción del pedido.' },
			{ text: '2. Para la devolución, los productos deberán encontrarse completos, sellados y sin alteraciones.' },
			{ text: '3. Pagos con cheque, favor elaborar a nombre de Comercial Agropecuaria, S.A. de C.V.' },
			{ text: '4. Todo cheque rechazado, generará un cargo administrativo de $25.00 más IVA.' }
		],
		fontSize: 6,
		lineHeight: 1.08,
		margin: [0, 2, 0, 3]
	},
	...(documento.condicionPago !== '1' ? buildPagareBlock(receptor, resumen, dte, documento) : []),
	...buildFirmasBlock()
];

const TicketPDF = (
	empresa: Empresa[],
	receptor: Receptor[],
	products: Product[],
	resumen: Resumen[],
	dte: Dte,
	iva: number,
	cliente: string,
	vendedor: string,
	documento: documento[]
) => {
	if (!empresa?.length || !receptor?.length || !resumen?.length) return;

	const docDefinition: any = {
		pageSize: { width: PAGE_WIDTH, height: 'auto' },
		pageMargins: [PAGE_MARGIN, 40, 24, 14],
		defaultStyle: {
			font: 'Roboto',
			fontSize: 6,
			lineHeight: 1.05
		},
		styles: {
			none: {}
		},
		content: [
			...buildHeader(empresa[0], dte),
			...buildCustomer(receptor[0], cliente, vendedor),
			...buildProducts(products),
			...buildTotals(receptor[0], resumen[0], iva, dte, vendedor, documento[0])
		]
	};

	pdfMake.createPdf(docDefinition).open();
};

export default TicketPDF;

import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { SnotifyPosition, SnotifyService } from 'ng-snotify';
import { GlobalesRuteoApiService } from '../../service/globales-ruteo-api.service';
import { IGlobalesRuteo } from '../../model/globales-ruteo-model-interface';

export type CampoTipo = 'text' | 'number' | 'boolean' | 'textarea' | 'password';

export interface ICampoParametro {
	key: keyof IGlobalesRuteo;
	label: string;
	tab: string;
	type: CampoTipo;
	readOnly?: boolean;
	validators?: ValidatorFn[];
	digitsOnly?: boolean;
	maxLength?: number;
	hint?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RGB_REGEX = /^(25[0-5]|2[0-4]\d|1?\d{1,2}),\s*(25[0-5]|2[0-4]\d|1?\d{1,2}),\s*(25[0-5]|2[0-4]\d|1?\d{1,2})$/;

// Uno o más correos separados por coma o punto y coma (CORREOS_EXAC_ALDO / CORREOS_ALDO_EXAC).
function multiEmailValidator(control: AbstractControl): ValidationErrors | null {
	const value = (control.value as string | null)?.trim();
	if (!value) return null;
	const invalid = value
		.split(/[,;]/)
		.map((correo) => correo.trim())
		.filter((correo) => correo.length > 0)
		.some((correo) => !EMAIL_REGEX.test(correo));
	return invalid ? { multiEmail: true } : null;
}

// Un espacio de más al inicio o al final (muy fácil de pegar sin querer) hace fallar un regex
// anclado con ^...$. Se recorta el valor antes de evaluarlo para que ese espacio invisible no
// invalide el formato.
function patternTrimmed(regex: RegExp): ValidatorFn {
	return (control: AbstractControl): ValidationErrors | null => {
		const value = (control.value as string | null)?.trim();
		if (!value) return null;
		return regex.test(value) ? null : { pattern: { requiredPattern: regex.toString(), actualValue: control.value } };
	};
}

// Carpetas y campos según manual del usuario (pág. 35-46) más los campos
// propios de Coagro que existen en el modelo GLOBALES_RUTEO pero no están
// documentados en el manual genérico de Softland (sincronización ALDO,
// colores de mapa, rubros de jornada).
export const CAMPOS_PARAMETROS: ICampoParametro[] = [
	// General
	{ key: 'USA_RUTEO', label: 'Utilizar Ruteo', tab: 'General', type: 'boolean' },
	{ key: 'CAM_PAIS', label: 'Permitir cambiar el país (FRm)', tab: 'General', type: 'boolean' },
	{ key: 'CAM_LST_PRC', label: 'Permitir cambiar niveles de precios (FRm)', tab: 'General', type: 'boolean' },
	{ key: 'CAM_CON_PG', label: 'Permitir cambiar la condición de pago (FRm)', tab: 'General', type: 'boolean' },
	{ key: 'CAM_CLA_PED', label: 'Permitir cambiar la clase (FRm)', tab: 'General', type: 'boolean' },
	{ key: 'USA_SUG_VENTA', label: 'Forzar sugerido de venta', tab: 'General', type: 'boolean' },
	{
		key: 'RUTA_EMM',
		label: 'Ruta del Servidor Web (EMM)',
		tab: 'General',
		type: 'text',
		validators: [Validators.maxLength(254)],
		maxLength: 254
	},
	{ key: 'VERIF_TOMAFISICA', label: 'Realizar toma física de inventario', tab: 'General', type: 'boolean' },
	{ key: 'USA_ENVASES', label: 'Utiliza envases', tab: 'General', type: 'boolean' },
	{ key: 'SOPORTE_TRASIEGOS', label: 'Utiliza traspasos', tab: 'General', type: 'boolean' },
	{
		key: 'CANT_TIEMPO_TRASL',
		label: 'Cantidad tiempo de traslado',
		tab: 'General',
		type: 'text',
		validators: [Validators.maxLength(5)],
		digitsOnly: true,
		maxLength: 5,
		hint: 'Solo números (minutos), máximo 5 dígitos'
	},
	{ key: 'CARGA_EN_PROCESO', label: 'Carga en proceso (indicador de sistema)', tab: 'General', type: 'boolean', readOnly: true },

	// Opciones
	{ key: 'APLICA_RECARGO', label: 'Aplicar recargo', tab: 'Opciones', type: 'boolean' },
	{
		key: 'PORC_RECARGO',
		label: 'Porcentaje de recargo por artículo',
		tab: 'Opciones',
		type: 'number',
		validators: [Validators.min(0), Validators.max(100)],
		hint: 'Entre 0 y 100'
	},
	{ key: 'USA_RUTA_CLIENTE', label: 'Usar ruta del cliente', tab: 'Opciones', type: 'boolean' },
	{ key: 'USA_CONSIGNACION', label: 'Utilizar consignación', tab: 'Opciones', type: 'boolean' },
	{ key: 'COBRO_MAL_ESTADO', label: 'Cobrar productos en mal estado', tab: 'Opciones', type: 'boolean' },
	{ key: 'USA_BODEGA_FA', label: 'Utilizar bodega de módulo Facturación', tab: 'Opciones', type: 'boolean' },
	{ key: 'SUG_LOCALIZACION', label: 'Sugerir localizaciones', tab: 'Opciones', type: 'boolean' },
	{ key: 'SUGERIR_LOTES', label: 'Sugerir lotes en pedidos', tab: 'Opciones', type: 'boolean' },
	{ key: 'VALIDA_LOTE_DEV', label: 'Validar lote en devolución', tab: 'Opciones', type: 'boolean' },
	{ key: 'ESQUEMA_DESC', label: 'Esquema de descuento', tab: 'Opciones', type: 'boolean' },
	{ key: 'OPT_BUSQ_ARTICULO', label: 'Opción de búsqueda de artículo', tab: 'Opciones', type: 'boolean' },
	{ key: 'ENTEROS_PEDIDO', label: 'Cantidades enteras en pedido', tab: 'Opciones', type: 'boolean' },
	{ key: 'PED_TEMP', label: 'Pedidos temporales', tab: 'Opciones', type: 'boolean' },
	{ key: 'RECAL_PRECIO', label: 'Recálculo de precios', tab: 'Opciones', type: 'boolean' },
	{ key: 'VERIF_CARGAS', label: 'Validar cargas antes de sincronizar', tab: 'Opciones', type: 'boolean' },
	{ key: 'GENERAR_BITACORA', label: 'Generar bitácora de sincronización', tab: 'Opciones', type: 'boolean' },
	{ key: 'HISTORICO_PEDIDOS', label: 'Cargar histórico de pedidos', tab: 'Opciones', type: 'boolean' },
	{
		key: 'CANTIDAD_MESES',
		label: 'Cantidad de meses (histórico pedidos)',
		tab: 'Opciones',
		type: 'number',
		validators: [Validators.min(0), Validators.max(60)]
	},
	{ key: 'HISTORICO_FACTURA', label: 'Cargar histórico de facturas', tab: 'Opciones', type: 'boolean' },
	{
		key: 'CANTIDAD_MESES_FAC',
		label: 'Cantidad de meses (histórico facturas)',
		tab: 'Opciones',
		type: 'number',
		validators: [Validators.min(0), Validators.max(60)]
	},
	{ key: 'COBROS_FACTURA_CONTADO', label: 'Cobro facturas contado', tab: 'Opciones', type: 'boolean' },
	{
		key: 'SUBTIPO_RECIBO',
		label: 'Tipo generación de recibos (1 Consultar, 2 Obligar, 3 Generar Efectivo)',
		tab: 'Opciones',
		type: 'number',
		validators: [Validators.min(1), Validators.max(3)],
		hint: 'Solo 1, 2 o 3'
	},
	{ key: 'PRONTO_PAGO_TOTALES', label: 'Descuento pronto pago solo totales', tab: 'Opciones', type: 'boolean' },
	{ key: 'DESCUENTO_PRONTO_PAGO', label: 'Aplicar descuento por pronto pago', tab: 'Opciones', type: 'boolean' },
	{
		key: 'CANTIDAD_DIAS',
		label: 'Días para descuento pronto pago',
		tab: 'Opciones',
		type: 'number',
		validators: [Validators.min(0), Validators.max(365)]
	},
	{ key: 'SUBTIPO_NOTACREDITO', label: 'Subtipo de nota de crédito', tab: 'Opciones', type: 'number', validators: [Validators.min(0)] },
	{ key: 'SUBTIPO_OTROCREDITO', label: 'Subtipo de otro crédito', tab: 'Opciones', type: 'number', validators: [Validators.min(0)] },
	{
		key: 'CONSECUTIVO',
		label: 'Consecutivo de traspasos',
		tab: 'Opciones',
		type: 'text',
		digitsOnly: true,
		maxLength: 10,
		hint: 'Solo números'
	},
	{ key: 'ESQUEMA_RESOLUCIONES', label: 'Esquema de resoluciones (Guatemala)', tab: 'Opciones', type: 'boolean' },
	{
		key: 'PORCENTAJE_RESOLUCION',
		label: 'Días de vigencia de resolución',
		tab: 'Opciones',
		type: 'number',
		validators: [Validators.min(0)]
	},

	// Corporativo
	{
		key: 'CORP_NIT',
		label: 'NIT',
		tab: 'Corporativo',
		type: 'text',
		validators: [Validators.required, patternTrimmed(/^\d{14}$/)],
		digitsOnly: true,
		maxLength: 14,
		hint: 'Exactamente 14 dígitos, sin guiones (ej. 06141010101012)'
	},
	{
		key: 'CORP_NOMBRE',
		label: 'Nombre de la Corporación',
		tab: 'Corporativo',
		type: 'text',
		validators: [Validators.maxLength(40)],
		maxLength: 40,
		hint: 'Máximo 40 caracteres'
	},
	{
		key: 'CORP_SLOGAN',
		label: 'Slogan',
		tab: 'Corporativo',
		type: 'text',
		validators: [Validators.maxLength(30)],
		maxLength: 30,
		hint: 'Máximo 30 caracteres'
	},
	{
		key: 'CORP_DIRECCION',
		label: 'Dirección',
		tab: 'Corporativo',
		type: 'text',
		validators: [Validators.maxLength(60)],
		maxLength: 60,
		hint: 'Máximo 60 caracteres'
	},
	{
		key: 'CORP_TELEFONO',
		label: 'Teléfono',
		tab: 'Corporativo',
		type: 'text',
		validators: [patternTrimmed(/^\d{4}-?\d{4}$/)],
		maxLength: 9,
		hint: 'Formato: 0000-0000'
	},
	{
		key: 'CORP_FAX',
		label: 'Fax',
		tab: 'Corporativo',
		type: 'text',
		validators: [patternTrimmed(/^\d{4}-?\d{4}$/)],
		maxLength: 9,
		hint: 'Formato: 0000-0000'
	},
	{
		key: 'CORP_WEB',
		label: 'Página Web',
		tab: 'Corporativo',
		type: 'text',
		validators: [patternTrimmed(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .\-?&=]*)*\/?$/i), Validators.maxLength(30)],
		maxLength: 30,
		hint: 'Ej: www.coagro.com.sv (máx. 30 caracteres)'
	},
	{
		key: 'CORP_EMAIL',
		label: 'Correo Electrónico',
		tab: 'Corporativo',
		type: 'text',
		validators: [Validators.email, Validators.maxLength(30)],
		maxLength: 30,
		hint: 'Debe contener @ y un dominio válido (máx. 30 caracteres)'
	},
	{
		key: 'CORP_NRC',
		label: 'NRC',
		tab: 'Corporativo',
		type: 'text',
		validators: [patternTrimmed(/^\d{1,8}$/)],
		digitsOnly: true,
		maxLength: 8,
		hint: 'Solo números, máximo 8 dígitos'
	},
	{
		key: 'CORP_GIRO',
		label: 'Giro',
		tab: 'Corporativo',
		type: 'text',
		validators: [Validators.maxLength(60)],
		maxLength: 60,
		hint: 'Máximo 60 caracteres'
	},

	// Rubros de Jornada
	{ key: 'USA_RUBROS_JORNADA', label: 'Usar rubros de jornada', tab: 'Rubros de Jornada', type: 'boolean' },
	{
		key: 'Rubro1_JORNADA',
		label: 'Rubro 1',
		tab: 'Rubros de Jornada',
		type: 'text',
		validators: [Validators.maxLength(40)],
		maxLength: 40
	},
	{
		key: 'Rubro2_JORNADA',
		label: 'Rubro 2',
		tab: 'Rubros de Jornada',
		type: 'text',
		validators: [Validators.maxLength(40)],
		maxLength: 40
	},
	{
		key: 'Rubro3_JORNADA',
		label: 'Rubro 3',
		tab: 'Rubros de Jornada',
		type: 'text',
		validators: [Validators.maxLength(40)],
		maxLength: 40
	},
	{
		key: 'Rubro4_JORNADA',
		label: 'Rubro 4',
		tab: 'Rubros de Jornada',
		type: 'text',
		validators: [Validators.maxLength(40)],
		maxLength: 40
	},
	{
		key: 'Rubro5_JORNADA',
		label: 'Rubro 5',
		tab: 'Rubros de Jornada',
		type: 'text',
		validators: [Validators.maxLength(40)],
		maxLength: 40
	},

	// Sincronización (integración ALDO, específica de Coagro)
	{
		key: 'USUARIO_ALDO',
		label: 'Usuario ALDO',
		tab: 'Sincronización',
		type: 'text',
		validators: [Validators.maxLength(50)],
		maxLength: 50
	},
	{
		key: 'PASSWORD_ALDO',
		label: 'Contraseña ALDO',
		tab: 'Sincronización',
		type: 'password',
		validators: [Validators.maxLength(10)],
		maxLength: 10,
		hint: 'Máximo 10 caracteres'
	},
	{ key: 'COMPANIAS', label: 'Compañías (ALDO)', tab: 'Sincronización', type: 'textarea' },
	{
		key: 'CORREOS_EXAC_ALDO',
		label: 'Correos notificación Exactus → Aldo',
		tab: 'Sincronización',
		type: 'text',
		validators: [multiEmailValidator, Validators.maxLength(254)],
		maxLength: 254,
		hint: 'Uno o más correos separados por coma'
	},
	{
		key: 'CORREOS_ALDO_EXAC',
		label: 'Correos notificación Aldo → Exactus',
		tab: 'Sincronización',
		type: 'text',
		validators: [multiEmailValidator, Validators.maxLength(254)],
		maxLength: 254,
		hint: 'Uno o más correos separados por coma'
	},
	{ key: 'COPIAR_RUTAS', label: 'Copiar rutas', tab: 'Sincronización', type: 'boolean' },
	{ key: 'SINCRO_DESATENDIDA', label: 'Sincronización desatendida', tab: 'Sincronización', type: 'boolean' },

	// Colores de Mapa (monitoreo de rutas/visitas) — la BD guarda "R, G, B" (0-255), no hex
	{
		key: 'CLR_RUTA_PROG',
		label: 'Ruta Programada (formato: R, G, B)',
		tab: 'Colores de Mapa',
		type: 'text',
		validators: [patternTrimmed(RGB_REGEX), Validators.maxLength(15)],
		maxLength: 15,
		hint: 'Ej: 255, 0, 0 (cada valor entre 0 y 255)'
	},
	{
		key: 'CLR_RUTA_EJEC',
		label: 'Ruta Ejecutada (formato: R, G, B)',
		tab: 'Colores de Mapa',
		type: 'text',
		validators: [patternTrimmed(RGB_REGEX), Validators.maxLength(15)],
		maxLength: 15,
		hint: 'Ej: 0, 255, 0 (cada valor entre 0 y 255)'
	},
	{
		key: 'CLR_VISITA_FUERA',
		label: 'Visita Fuera de Ruta (formato: R, G, B)',
		tab: 'Colores de Mapa',
		type: 'text',
		validators: [patternTrimmed(RGB_REGEX), Validators.maxLength(15)],
		maxLength: 15,
		hint: 'Ej: 255, 165, 0 (cada valor entre 0 y 255)'
	},
	{
		key: 'CLR_TRASLADO_ADV',
		label: 'Traslado con Advertencia (formato: R, G, B)',
		tab: 'Colores de Mapa',
		type: 'text',
		validators: [patternTrimmed(RGB_REGEX), Validators.maxLength(15)],
		maxLength: 15,
		hint: 'Ej: 255, 255, 0 (cada valor entre 0 y 255)'
	},
	{
		key: 'CLR_VISITA_SIN_GPS',
		label: 'Visita sin GPS (formato: R, G, B)',
		tab: 'Colores de Mapa',
		type: 'text',
		validators: [patternTrimmed(RGB_REGEX), Validators.maxLength(15)],
		maxLength: 15,
		hint: 'Ej: 128, 128, 128 (cada valor entre 0 y 255)'
	},
	{
		key: 'CLR_VISITA_GPS_FUERA',
		label: 'Visita GPS Fuera de Rango (formato: R, G, B)',
		tab: 'Colores de Mapa',
		type: 'text',
		validators: [patternTrimmed(RGB_REGEX), Validators.maxLength(15)],
		maxLength: 15,
		hint: 'Ej: 0, 0, 255 (cada valor entre 0 y 255)'
	},

	// Cierres
	{
		key: 'PERMITIDO_FALTANTE',
		label: 'Monto permitido para faltantes',
		tab: 'Cierres',
		type: 'number',
		validators: [Validators.min(0)]
	}
];

export const TABS_PARAMETROS: string[] = [
	'General',
	'Opciones',
	'Corporativo',
	'Rubros de Jornada',
	'Sincronización',
	'Colores de Mapa',
	'Cierres'
];

const CAMPOS_BOOLEAN = new Set(CAMPOS_PARAMETROS.filter((c) => c.type === 'boolean').map((c) => c.key));

@Component({
	selector: 'app-parametros-modulo-page',
	templateUrl: './parametros-modulo-page.component.html',
	styleUrls: ['./parametros-modulo-page.component.scss']
})
export class ParametrosModuloPageComponent implements OnInit {
	constructor(
		private _formBuilder: FormBuilder,
		private _snotifyService: SnotifyService,
		private _globalesRuteoApiService: GlobalesRuteoApiService
	) {}

	parametrosForm!: FormGroup;
	tabs = TABS_PARAMETROS;
	campos = CAMPOS_PARAMETROS;
	existeConfiguracion = false;
	cargando = true;

	ngOnInit(): void {
		this._buildForm();
		this._loadGlobalesRuteo();
	}

	private _buildForm(): void {
		const controls: Record<string, unknown> = {};
		for (const campo of this.campos) {
			const valorInicial = campo.type === 'boolean' ? 'N' : '';
			controls[campo.key] = [valorInicial, campo.validators ?? []];
		}
		this.parametrosForm = this._formBuilder.group(controls);
	}

	private _loadGlobalesRuteo(): void {
		this._globalesRuteoApiService.getGlobalesRuteo().subscribe({
			next: (response) => {
				this.cargando = false;
				if (response.success && response.result && response.result.CORP_NIT) {
					this.existeConfiguracion = true;
					this.parametrosForm.patchValue(response.result);
					this.parametrosForm.get('CORP_NIT')?.disable();
				} else {
					this.existeConfiguracion = false;
				}
			},
			error: () => {
				this.cargando = false;
			}
		});
	}

	fieldsForTab(tab: string): ICampoParametro[] {
		return this.campos.filter((c) => c.tab === tab);
	}

	booleanFieldsForTab(tab: string): ICampoParametro[] {
		return this.fieldsForTab(tab).filter((c) => c.type === 'boolean');
	}

	inputFieldsForTab(tab: string): ICampoParametro[] {
		return this.fieldsForTab(tab).filter((c) => c.type !== 'boolean');
	}

	// Mismo criterio de columnas usado en Grupo de Artículo/Agente/Bodega (código angosto,
	// descripción ancha): el ancho depende del largo esperado del valor, no es fijo para todos.
	colClass(campo: ICampoParametro): string {
		if (campo.type === 'textarea') return 'col-12';
		if (campo.type === 'number') return 'col-12 col-md-30';
		const len = campo.maxLength;
		if (len && len <= 10) return 'col-12 col-md-30';
		if (len && len <= 40) return 'col-12 col-md-50';
		return 'col-12 col-md-70';
	}

	isBoolean(key: string): boolean {
		return CAMPOS_BOOLEAN.has(key as keyof IGlobalesRuteo);
	}

	toggleBoolean(key: string, checked: boolean): void {
		this.parametrosForm.get(key)?.setValue(checked ? 'S' : 'N');
	}

	// Bloquea la tecla antes de que llegue al campo, en vez de mutar el valor después del hecho:
	// así el control reactivo nunca ve un carácter inválido y no hay forma de que se desincronice.
	soloDigitos(event: KeyboardEvent): void {
		if (event.ctrlKey || event.metaKey || event.altKey || event.key.length > 1) return;
		if (!/^[0-9]$/.test(event.key)) {
			event.preventDefault();
		}
	}

	onPasteDigits(event: ClipboardEvent, key: string): void {
		event.preventDefault();
		const pegado = event.clipboardData?.getData('text') ?? '';
		this.parametrosForm.get(key)?.setValue(pegado.replace(/\D/g, ''));
	}

	errorFor(campo: ICampoParametro): string {
		const control = this.parametrosForm.get(campo.key);
		if (!control || !control.touched || control.valid) return '';
		if (control.hasError('required')) return 'Este campo es requerido';
		if (control.hasError('email') || control.hasError('multiEmail')) return 'Debe ser un correo válido (debe contener @ y un dominio)';
		if (control.hasError('pattern')) return campo.hint ?? 'El formato ingresado no es válido';
		if (control.hasError('min')) return `El valor mínimo permitido es ${(control.getError('min') as { min: number }).min}`;
		if (control.hasError('max')) return `El valor máximo permitido es ${(control.getError('max') as { max: number }).max}`;
		if (control.hasError('maxlength'))
			return `Máximo ${(control.getError('maxlength') as { requiredLength: number }).requiredLength} caracteres (límite de la base de datos)`;
		return 'Valor inválido';
	}

	guardar(): void {
		if (this.parametrosForm.invalid) {
			this.parametrosForm.markAllAsTouched();
			this._snotifyService.error('Revise los campos marcados en rojo: el formato ingresado no es válido', {
				position: SnotifyPosition.rightTop
			});
			return;
		}
		const data = this.parametrosForm.getRawValue() as IGlobalesRuteo;
		if (this.existeConfiguracion) {
			this._globalesRuteoApiService.updateGlobalesRuteo(data).subscribe({
				next: (response) => {
					if (response.success) {
						this._snotifyService.info('Los parámetros del módulo se actualizaron sin problema', { position: SnotifyPosition.rightTop });
						this._loadGlobalesRuteo();
					} else {
						this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
					}
				}
			});
		} else {
			if (!data.CORP_NIT) {
				this._snotifyService.error('El NIT es requerido para crear la configuración inicial', { position: SnotifyPosition.rightTop });
				return;
			}
			this._globalesRuteoApiService.createGlobalesRuteo(data).subscribe({
				next: (response) => {
					if (response.success) {
						this._snotifyService.info('Los parámetros del módulo se crearon sin problema', { position: SnotifyPosition.rightTop });
						this.existeConfiguracion = true;
						this.parametrosForm.get('CORP_NIT')?.disable();
					} else {
						this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
					}
				}
			});
		}
	}
}

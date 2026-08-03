export interface IResponseConsecutivoCi {
	codConsecutivo: string;
	UltimoUsuario: string;
	descripcion: string;
	Mascara: string;
	siguienteConsec: string;
	Editable: string;
	MultiplesTrans: string;
	FormatoImp: string;
	UltFechaHora: string;
	TodasTrans: string;
	Tipo: string;
	UsaTraslado: string;
	EmailCFDI: string;
	id: number;
}

export interface IResponseConsInvAjCon {
	id: number;
	consecutivoInvId: number;
	ajusteConfigId: number;
	ajusteConfig: { codAjusteConfig: string; ajusteBase: string; descripcion: string; id: number };
}
export interface ICreateConsInvAjCon {
	consecutivoInvId: number;
	ajusteConfigId: number;
}

export interface ICreateAjsutesConfig {
	CodAjusteConfig: string;
	Descripcion: string;
	AjusteBase: string;
	Activa: boolean;
	Ingreso: string;
}
export interface IResponseConsUsuario {
	id: number;
	CodCosecutivo: number;
	usuario: number;
}

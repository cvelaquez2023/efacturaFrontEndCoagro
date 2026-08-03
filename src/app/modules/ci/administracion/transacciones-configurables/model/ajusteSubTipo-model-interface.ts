export interface IResponseAjusteSubTipo {
	id: number;
	isDeleted: boolean;
	createdby: string;
	createDate: string;
	updatedby: string;
	updateDate: string;
	ajusteConfig: string;
	subTipo: string;
	ajusteConfigId: number;
	ajusteConfigPK: {
		id: number;
		isDeleted: boolean;
		createdby: string;
		createDate: string;
		updatedby: string;
		updateDate: string;
		codAjusteConfig: string;
		descripcion: string;
		ajusteBase: string;
		activa: boolean;
		ingreso: string;
	};
}

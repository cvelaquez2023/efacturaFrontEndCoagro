export interface IResponseRuta {
	codRuta: string;
	descripcion: string;
	activa: boolean;
	id: number;
	isDelete: boolean;
}

export interface IRequestCreateRuta {
	codRuta: string;
	descripcion: string;
	activa: boolean;
}
export interface IHomeRuta {
	id: number;
	codRuta: string;
	description: string;
	activa: boolean;
}

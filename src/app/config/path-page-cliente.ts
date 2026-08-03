const ModuloClientePage = 'cliente';
const documentoPage = 'listarDte';
const crearInvalidacionPage = 'crearinvalidacion';
const listarInvalidacionPage = 'listarinvalidacion';
export const PATHS_CLIENTE_PAGES = {
	cliente: {
		withSlash: `/${ModuloClientePage}`,
		onLyPath: ModuloClientePage
	},
	documento: {
		withSlash: `/${ModuloClientePage}/${documentoPage}`,
		onLyPath: documentoPage
	},
	crearInvalidaciones: {
		withSlash: `/${ModuloClientePage}/${crearInvalidacionPage}`,
		onLyPath: crearInvalidacionPage
	},
	listarInvalidaciones: {
		withSlash: `/${ModuloClientePage}/${listarInvalidacionPage}`,
		onLypath: listarInvalidacionPage
	}
};

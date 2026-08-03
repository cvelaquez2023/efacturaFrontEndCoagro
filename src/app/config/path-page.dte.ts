const ModuloPage = 'dte';
const clientePage = 'clientes';
const proveedorPage = 'proveedor';
const invalidacionPage = 'invalidaciones';
const contigenciaPage = 'contingencia';
const usuariosPage = 'usuarios';
export const PATHS_DTE_PAGES = {
	moduloDte: {
		withSlash: `/${ModuloPage}`,
		onLyPath: ModuloPage
	},
	clienteDte: {
		withSlash: `/${ModuloPage}/${clientePage}`,
		onLyPath: clientePage
	},
	proveedorDte: {
		withSlash: `/${ModuloPage}/${proveedorPage}`,
		onLyPath: proveedorPage
	},
	contingenciaDte: {
		withSlash: `/${ModuloPage}/${contigenciaPage}`,
		onLypath: contigenciaPage
	},
	usuarioDte: {
		withSlash: `/${ModuloPage}/${usuariosPage}`,
		onLypath: usuariosPage
	},
	invalidacionDte: {
		withSlash: `/${ModuloPage}/${invalidacionPage}`,
		onLypath: invalidacionPage
	}
};

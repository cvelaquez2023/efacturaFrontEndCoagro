const ModuloClientePage = 'proveedor';
const dtesPage = 'listadte';
const sujetoExcludioPage = 'sujetoexcluido';
const invalidacionPage = 'invalidacion';
const retencionesPage = 'retenciones';

export const PATHS_PROVEE_PAGES = {
	moduloprovee: {
		withSlash: `/${ModuloClientePage}`,
		onLyPath: ModuloClientePage
	},
	listadte: {
		withSlash: `/${ModuloClientePage}/${dtesPage}`,
		onLyPath: dtesPage
	},
	retenciones: {
		withSlash: `/${ModuloClientePage}/${retencionesPage}`,
		onLyPath: retencionesPage
	},
	sujetoexcluido: {
		withSlash: `/${ModuloClientePage}/${sujetoExcludioPage}`,
		onLypath: sujetoExcludioPage
	},
	invalidacion: {
		withSlash: `/${ModuloClientePage}/${invalidacionPage}`,
		onLypath: invalidacionPage
	}
};

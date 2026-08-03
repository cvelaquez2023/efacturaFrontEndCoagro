const ModuloCIPage = 'proveedor';
const parametrosModuloPage = 'parametrosModulo';
const unidadMedidaPage = 'unidadMedida';
const consecutivosPage = 'consecutivos';
const clasificacionesPage = 'clasificaciones';
const transaccionesConfigurablesPage = 'transaccionesConfigurables';
const articuloPage = 'documentos';
const lotePage = 'lote';
const paqueteCIPage = 'paqueteCI';
const enLineaPage = 'enLinea';
const consecutivoCIPage = 'consecutivoCI';
export const PATHS_CI_PAGES = {
	moduloCI: {
		withSlash: `/${ModuloCIPage}`,
		onLyPath: ModuloCIPage
	},
	parametrosModulo: {
		withSlash: `/${ModuloCIPage}/${parametrosModuloPage}`,
		onLyPath: parametrosModuloPage
	},
	unidadMedida: {
		withSlash: `/${ModuloCIPage}/${unidadMedidaPage}`,
		onLyPath: unidadMedidaPage
	},
	consecutivos: {
		withSlash: `/${ModuloCIPage}/${consecutivosPage}`,
		onLypath: consecutivosPage
	},
	clasificaciones: {
		withSlash: `/${ModuloCIPage}/${clasificacionesPage}`,
		onLypath: clasificacionesPage
	},
	transaccionesConfigurables: {
		withSlash: `/${ModuloCIPage}/${transaccionesConfigurablesPage}`,
		onLypath: transaccionesConfigurablesPage
	},
	articulo: {
		withSlash: `/${ModuloCIPage}/${articuloPage}`,
		onLypath: articuloPage
	},
	lote: {
		withSlash: `/${ModuloCIPage}/${lotePage}`,
		onLypath: lotePage
	},
	paqueteCI: {
		withSlash: `/${ModuloCIPage}/${paqueteCIPage}`,
		onLypath: paqueteCIPage
	},
	enLinea: {
		withSlash: `/${ModuloCIPage}/${enLineaPage}`,
		onLypath: enLineaPage
	},

	consecutivoCI: {
		withSlash: `/${ModuloCIPage}/${consecutivoCIPage}`,
		onLypath: consecutivoCIPage
	}
};

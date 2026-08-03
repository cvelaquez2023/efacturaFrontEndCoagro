const ModuloCGPage = 'cg';

const parametrosModulePage = 'administracion/parametromodulo';
const cuentaContablepage = 'cuenta';
const centroCuentapage = 'centrocuenta';
export const PATHS_CG_PAGES = {
	moduloCG: {
		withSlash: `/${ModuloCGPage}`,
		onLyPath: ModuloCGPage
	},
	parametrosModulo: {
		withSlash: `/${ModuloCGPage}/${parametrosModulePage}`,
		onLyPath: parametrosModulePage
	},
	cuentaContable: {
		withSlash: `/${ModuloCGPage}/${cuentaContablepage}`,
		onLyPath: cuentaContablepage
	},
	centroCuenta: {
		withSlash: `/${ModuloCGPage}/${centroCuentapage}`,
		onLyPath: centroCuentapage
	}
};

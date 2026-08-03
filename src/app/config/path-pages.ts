//#region  PATH AUTH
const loginPage = 'login';
const registerPage = 'register';
const recoverPasswordPage = 'recovery';

export const PATHS_AUTH_PAGES = {
	LoginPage: {
		withSlash: `/${loginPage}`,
		onLyPath: loginPage
	},
	registerPage: {
		withSlash: `/${registerPage}`,
		onLyPath: registerPage
	},
	recoverPasswordPage: {
		withSlash: `/${recoverPasswordPage}`,
		onLypath: recoverPasswordPage
	}
};
//#endregion

const homePage = 'home';

export const PATHS_HOME_PAGES = {
	homePage: {
		withSlash: `/${homePage}`,
		onLyPath: homePage
	}
};

//#region Modulo de Administracion del Sistema
const modulo_AS = 'dte';
const documentoPage = 'listar';
const crearInvalidacionPage = 'crearInvalidacion';
const listarInvalidacionPage = 'listarInvalidadcion';
const listarDtePage = 'listarDte';
export const PATH_AS_PAGES = {
	withSlash: `/${modulo_AS}`,
	onlyPath: modulo_AS,
	//Seguridad
	documento: { withSlash: `/${modulo_AS}/${documentoPage}`, onlyPath: documentoPage },
	crearInvalidacion: { withSlash: `/${modulo_AS}/${crearInvalidacionPage}`, onlyPath: crearInvalidacionPage },
	listarInvalidacion: { withSlash: `/${modulo_AS}/${listarInvalidacionPage}`, onlyPath: listarInvalidacionPage },
	listarDte: { withSlash: `/${modulo_AS}/${listarDtePage}`, onlyPath: listarDtePage }
};

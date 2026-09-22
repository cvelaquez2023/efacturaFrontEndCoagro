export interface IResponseListarUsuario {
  usuario_id: number;
  email: string;
  nombre: string;
  activo: boolean;
  rol: string;
  confirm: boolean;
}
export interface IRequestLogin {
  email: string;
  password: string;
  empresa: string;
}
export interface IRequestConjunto {
  email: string;
}

export interface IResponseConjuntoLogin {
  conjunto: string;
  nombre: string;
}
export interface IResponseConjunto {
  accionId: number;
  accion: string;
  activo: boolean;
  conjunto: {
    compania: string;
    nombre: string;
    direccion: string;
    telefono: string;
    logo: string;
    dobleMoneda: boolean;
    dobleContabilidad: boolean;
    usaLotes: boolean;
    usaCentroCosto: boolean;
    usuarioUltMod: string;
    fechaUltMod: Date;
    notas: string;
    versionBD: number;
    usuarioModBd: string;
    fechaHoraModBd: boolean;
    versionInstalada: number;
    docTributario: string;
    pais: string;
    usaSucursales: boolean;
    mascaraSucursal: string;
    direccionWeb: string;
    correoDocElectronico: string;
    numeroRegistro: string;
    actividadComercial: string;
    agentePercepcion: boolean;
    calPercepVentas: boolean;
    agenteRetencion: boolean;
    fechaVence: Date;
    activa: boolean;
    updatedby: string;
    updateDate: Date;
    id: number;
    isDeleted: boolean;
    createdby: string;
    createDate: Date;
  };
  conjuntoId: number;
  createdby: string;
  createDate: Date;
  id: number;
  isDeleted: boolean;
  updateDate: Date;
  updatedby: string;
  usuarioId: string;
}

export interface IResponseLogin {
  token: string;
  usuario: {
    email: string;
    nombres: string;
    rol: string;
    empresa: string;
    empresaNombre: string;
  };
  //token: string;
  //fullName: string;
  //email: string;
  roles: string[];
  success: boolean;
  errors: string[];
}
//#region  REGISTER
export interface IRequestRegister {
  firstName: string;
  lastName: string;
  typeDocument: number;
  documentoNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  age?: number;
}
export interface IRequestGuardarUser {
  email: string;
  nombres: string;
  password: string;
  activo: boolean;
  rol: string;
}
//#endregion

//#region  RESET PASWWORD
export interface IRequestResetPassword {
  email: string;
  token: string;
  password: string;
}
//#endregion

//#region  CHANGE PASWWORD
export interface IRequestChangePassword {
  email: string;
  oldPassword: string;
  newPassword: string;
}
//#endregion
//#region  CHANGE PASWWORD
export interface IRequestChangePassword {
  email: string;
  oldPassword: string;
  newPassword: string;
}
//#endregion

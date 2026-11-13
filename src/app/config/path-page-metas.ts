const ModuloMetasPage = "metas";

const metasPage = "metas";
const lideresPage = "lideres";
const proveedoresPage = "proveedores";
const lineasNegocioPage = "lineas-negocio";
const incentivoMetasPage = "incentivo-metas";
const ventasDiariasPage = "ventas-diarias";
const dashboardPage = "dashboard";

export const PATHS_METAS_PAGES = {
  moduloMetas: {
    withSlash: `/${ModuloMetasPage}`,
    onLyPath: ModuloMetasPage,
  },
  metas: {
    withSlash: `/${ModuloMetasPage}/${metasPage}`,
    onLyPath: metasPage,
  },
  lideres: {
    withSlash: `/${ModuloMetasPage}/${lideresPage}`,
    onLyPath: lideresPage,
  },
  lineasNegocio: {
    withSlash: `/${ModuloMetasPage}/${lineasNegocioPage}`,
    onLyPath: lineasNegocioPage,
  },
  incentivoMetas: {
    withSlash: `/${ModuloMetasPage}/${incentivoMetasPage}`,
    onLyPath: incentivoMetasPage,
  },
  ventasDiarias: {
    withSlash: `/${ModuloMetasPage}/${ventasDiariasPage}`,
    onLyPath: ventasDiariasPage,
  },
  dashboard: {
    withSlash: `/${ModuloMetasPage}/${dashboardPage}`,
    onLyPath: dashboardPage,
  },
  proveedores: {
    withSlash: `/${ModuloMetasPage}/${proveedoresPage}`,
    onLyPath: proveedoresPage,
  },
};

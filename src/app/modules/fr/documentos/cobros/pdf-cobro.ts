import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { CobrosApiService } from "./cobros-api.service";

/**
 * Abre el PDF del recibo en otra pestaña. El endpoint pide sesión (por eso se descarga como Blob con
 * el token y no con un enlace). Si el backend responde JSON (error), se muestra el mensaje.
 */
export const abrirPdfCobro = (
  api: CobrosApiService,
  snotify: SnotifyService,
  consecDep: number,
  numDoc: string | undefined | null,
  alTerminar: () => void
): void => {
  // Se abre la pestaña antes de la petición para que el navegador no la bloquee como ventana emergente.
  const ventana = window.open("", "_blank");
  api.pdf(consecDep, numDoc).subscribe({
    next: async (blob) => {
      alTerminar();
      if (blob.type.includes("json")) {
        ventana?.close();
        try {
          const r = JSON.parse(await blob.text()) as { errors?: string[] };
          snotify.error((r.errors || []).join(", ") || "No se pudo generar el PDF", { position: SnotifyPosition.rightTop });
        } catch {
          snotify.error("No se pudo generar el PDF", { position: SnotifyPosition.rightTop });
        }
        return;
      }
      const url = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
      if (ventana) ventana.location.href = url;
      else window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    },
    error: () => {
      alTerminar();
      ventana?.close();
      snotify.error("No se pudo generar el PDF del recibo", { position: SnotifyPosition.rightTop });
    },
  });
};

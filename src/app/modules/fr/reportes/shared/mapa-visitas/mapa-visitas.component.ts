import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import type * as Leaflet from "leaflet";
import { fmtFecha, fmtHora } from "../reporte-utils";

/** Punto que dibuja el mapa: misma forma que las filas de Ubicaciones por Visita. */
export interface IPuntoVisitaMapa {
  ruta: string;
  cliente: string;
  nombre: string;
  inicio: string;
  razon: string;
  latVisita: number | null;
  lonVisita: number | null;
  latCliente: number | null;
  lonCliente: number | null;
  distancia: number | null;
  estado: string;
}

const COLOR_ESTADO: Record<string, string> = {
  "Dentro GPS": "#2e7d32",
  "Fuera GPS": "#c62828",
};
const COLOR_NEUTRO = "#607d8b";
// Un color por ruta para distinguir los recorridos cuando se consultan varias a la vez.
const COLORES_RUTA = [
  "#1565c0",
  "#6a1b9a",
  "#ef6c00",
  "#00838f",
  "#ad1457",
  "#4e342e",
  "#283593",
  "#558b2f",
];
const SEGUNDOS_VIVO = 60;
// Centro por defecto (El Salvador) mientras no hay puntos que encuadrar.
const CENTRO_INICIAL: [number, number] = [13.7, -89.2];

const escapar = (texto: string): string =>
  texto.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/**
 * Mapa de las visitas (Leaflet + OpenStreetMap/Esri, sin API key). Dibuja el punto GPS de cada
 * visita coloreado por estado, la ubicación registrada del cliente, una línea punteada visita ->
 * cliente cuando quedó fuera del radio y el recorrido de cada ruta por día en orden de hora.
 *
 * Rendimiento: Leaflet se carga bajo demanda (chunk aparte), corre fuera de la zona de Angular
 * para que arrastrar/zoom no dispare detección de cambios, y usa un solo renderer canvas (miles
 * de puntos sin crear un nodo DOM por marcador). Los popups se arman solo al abrirlos.
 */
@Component({
  selector: "app-mapa-visitas",
  templateUrl: "./mapa-visitas.component.html",
  styleUrls: ["./mapa-visitas.component.scss"],
  // Sin encapsulación: los estilos de Leaflet aplican a nodos que crea la librería.
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapaVisitasComponent implements OnInit, OnChanges, OnDestroy {
  constructor(private _zone: NgZone, private _cdr: ChangeDetectorRef) {}

  @Input() puntos: IPuntoVisitaMapa[] = [];
  /** Radio permitido en metros, para el círculo alrededor del cliente seleccionado. */
  @Input() radio = 100;
  /** Se emite cada SEGUNDOS_VIVO con el modo En vivo activo, para que la página reconsulte. */
  @Output() refrescar = new EventEmitter<void>();

  @ViewChild("contenedor", { static: true }) contenedor!: ElementRef<HTMLDivElement>;

  cargando = true;
  vivo = false;

  /** Visitas que traen punto GPS (las demás no se pueden dibujar en el mapa). */
  get puntosConGps(): number {
    return this.puntos.filter((p) => p.latVisita !== null && p.lonVisita !== null).length;
  }
  actualizado: Date | null = null;
  readonly segundosVivo = SEGUNDOS_VIVO;

  private _L?: typeof Leaflet;
  private _mapa?: Leaflet.Map;
  private _renderer?: Leaflet.Canvas;
  private _capaRecorrido?: Leaflet.LayerGroup;
  private _capaVisitas?: Leaflet.LayerGroup;
  private _capaClientes?: Leaflet.LayerGroup;
  private _capaRadio?: Leaflet.LayerGroup;
  private _timer?: ReturnType<typeof setInterval>;
  private _resize?: ResizeObserver;
  private _destruido = false;
  // En vivo se conserva el encuadre que el usuario haya elegido en lugar de reencuadrar.
  private _conservarVista = false;

  ngOnChanges(changes: SimpleChanges): void {
    // El radio solo se usa al abrir un popup: cambiarlo no amerita redibujar.
    if (changes["puntos"] && this._mapa) this._zone.runOutsideAngular(() => this._dibujar());
  }

  ngOnInit(): void {
    this._iniciar();
  }

  ngOnDestroy(): void {
    this._destruido = true;
    this._detenerVivo();
    this._resize?.disconnect();
    this._mapa?.remove();
  }

  alternarVivo(): void {
    this.vivo = !this.vivo;
    if (this.vivo) {
      this._timer = setInterval(() => {
        // Pestaña oculta: no se consulta al backend en segundo plano.
        if (document.hidden) return;
        this._conservarVista = true;
        this.refrescar.emit();
      }, SEGUNDOS_VIVO * 1000);
    } else {
      this._detenerVivo();
    }
  }

  encuadrar(): void {
    this._zone.runOutsideAngular(() => this._encuadrar());
  }

  private _detenerVivo(): void {
    if (this._timer) clearInterval(this._timer);
    this._timer = undefined;
  }

  private async _iniciar(): Promise<void> {
    const L = await import("leaflet");
    if (this._destruido) return;
    this._L = L;
    this._zone.runOutsideAngular(() => {
      this._renderer = L.canvas({ padding: 0.5 });
      // Capas gratuitas sin API key (CARTO ya exige key). Si OpenStreetMap rechaza los tiles,
      // se cambia sola a Esri Calles.
      const calles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      });
      const callesEsri = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 19, attribution: "Tiles &copy; Esri" }
      );
      let erroresOsm = 0;
      calles.on("tileerror", () => {
        if (++erroresOsm !== 4 || !this._mapa?.hasLayer(calles)) return;
        this._mapa.removeLayer(calles);
        callesEsri.addTo(this._mapa);
      });
      const satelite = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 19, attribution: "Tiles &copy; Esri" }
      );
      this._mapa = L.map(this.contenedor.nativeElement, {
        center: CENTRO_INICIAL,
        zoom: 8,
        preferCanvas: true,
        layers: [calles],
      });
      this._capaRecorrido = L.layerGroup().addTo(this._mapa);
      this._capaClientes = L.layerGroup().addTo(this._mapa);
      this._capaVisitas = L.layerGroup().addTo(this._mapa);
      this._capaRadio = L.layerGroup().addTo(this._mapa);
      L.control
        .layers(
          { Calles: calles, "Calles (Esri)": callesEsri, Satélite: satelite },
          {
            Recorrido: this._capaRecorrido,
            Visitas: this._capaVisitas,
            Clientes: this._capaClientes,
          },
          { collapsed: true }
        )
        .addTo(this._mapa);
      this._mapa.on("popupclose", () => this._capaRadio?.clearLayers());
      // El contenedor cambia de tamaño al apilar/desapilar columnas: Leaflet debe recalcular.
      this._resize = new ResizeObserver(() => this._mapa?.invalidateSize());
      this._resize.observe(this.contenedor.nativeElement);
      this._dibujar();
    });
    this.cargando = false;
    this._cdr.markForCheck();
  }

  private _dibujar(): void {
    const L = this._L;
    if (!L || !this._mapa) return;
    this._capaRecorrido!.clearLayers();
    this._capaVisitas!.clearLayers();
    this._capaClientes!.clearLayers();
    this._capaRadio!.clearLayers();

    const renderer = this._renderer!;
    const clientesDibujados = new Set<string>();
    const recorridos = new Map<string, Leaflet.LatLngTuple[]>();
    const coloresRuta = new Map<string, string>();

    for (const p of this.puntos) {
      if (p.latCliente !== null && p.lonCliente !== null && !clientesDibujados.has(p.cliente)) {
        clientesDibujados.add(p.cliente);
        L.circleMarker([p.latCliente, p.lonCliente], {
          renderer,
          radius: 6,
          color: "#37474f",
          weight: 2,
          fillColor: "#ffffff",
          fillOpacity: 1,
        })
          .bindTooltip(escapar(`${p.cliente} · ${p.nombre}`))
          .addTo(this._capaClientes!);
      }
      if (p.latVisita === null || p.lonVisita === null) continue;

      const color = COLOR_ESTADO[p.estado] ?? COLOR_NEUTRO;
      const marcador = L.circleMarker([p.latVisita, p.lonVisita], {
        renderer,
        radius: 7,
        color: "#ffffff",
        weight: 1.5,
        fillColor: color,
        fillOpacity: 0.9,
      })
        .bindPopup(() => this._popup(p))
        .addTo(this._capaVisitas!);
      marcador.on("popupopen", () => this._mostrarRadio(p));

      // Alarma: aro rojo que late sobre la visita hecha fuera del radio del cliente.
      if (p.estado === "Fuera GPS") {
        L.marker([p.latVisita, p.lonVisita], {
          icon: L.divIcon({
            className: "mapa-alarma",
            html: '<span class="mapa-alarma-aro"></span><span class="mapa-alarma-signo">!</span>',
            iconSize: [34, 34],
            iconAnchor: [17, 17],
          }),
          zIndexOffset: 1000,
          keyboard: false,
        })
          .bindPopup(() => this._popup(p))
          .on("popupopen", () => this._mostrarRadio(p))
          .addTo(this._capaVisitas!);
      }

      if (p.estado === "Fuera GPS" && p.latCliente !== null && p.lonCliente !== null) {
        L.polyline(
          [
            [p.latVisita, p.lonVisita],
            [p.latCliente, p.lonCliente],
          ],
          { renderer, color: COLOR_ESTADO["Fuera GPS"], weight: 1.5, dashArray: "4 4", opacity: 0.8 }
        ).addTo(this._capaVisitas!);
      }

      // Recorrido: puntos de la misma ruta y día; las filas ya vienen ordenadas por ruta + hora.
      const clave = `${p.ruta}|${p.inicio.slice(0, 10)}`;
      const linea = recorridos.get(clave) ?? [];
      linea.push([p.latVisita, p.lonVisita]);
      recorridos.set(clave, linea);
      if (!coloresRuta.has(p.ruta)) {
        coloresRuta.set(p.ruta, COLORES_RUTA[coloresRuta.size % COLORES_RUTA.length]);
      }
    }

    recorridos.forEach((linea, clave) => {
      if (linea.length < 2) return;
      const ruta = clave.split("|")[0];
      L.polyline(linea, {
        renderer,
        color: coloresRuta.get(ruta),
        weight: 3,
        opacity: 0.55,
      })
        .bindTooltip(escapar(`Ruta ${ruta} · ${fmtFecha(clave.split("|")[1] + "T00:00")}`), {
          sticky: true,
        })
        .addTo(this._capaRecorrido!);
    });

    if (!this._conservarVista) this._encuadrar();
    this._conservarVista = false;

    this._zone.run(() => {
      this.actualizado = new Date();
      this._cdr.markForCheck();
    });
  }

  private _encuadrar(): void {
    const L = this._L;
    if (!L || !this._mapa) return;
    const coords: Leaflet.LatLngTuple[] = [];
    for (const p of this.puntos) {
      if (p.latVisita !== null && p.lonVisita !== null) coords.push([p.latVisita, p.lonVisita]);
      if (p.latCliente !== null && p.lonCliente !== null) coords.push([p.latCliente, p.lonCliente]);
    }
    if (coords.length) {
      this._mapa.fitBounds(L.latLngBounds(coords), { padding: [24, 24], maxZoom: 16 });
    } else {
      this._mapa.setView(CENTRO_INICIAL, 8);
    }
  }

  private _mostrarRadio(p: IPuntoVisitaMapa): void {
    this._capaRadio!.clearLayers();
    if (!this._L || p.latCliente === null || p.lonCliente === null) return;
    this._L.circle([p.latCliente, p.lonCliente], {
      renderer: this._renderer,
      radius: this.radio,
      color: "#1565c0",
      weight: 1,
      fillOpacity: 0.08,
      interactive: false,
    }).addTo(this._capaRadio!);
  }

  private _popup(p: IPuntoVisitaMapa): string {
    const distancia = p.distancia === null ? "—" : `${p.distancia} m`;
    return `
      <div class="mapa-popup">
        <strong>${escapar(p.cliente)} · ${escapar(p.nombre)}</strong>
        <div>Ruta ${escapar(p.ruta)} · ${fmtFecha(p.inicio)} ${fmtHora(p.inicio)}</div>
        <div>Razón: ${escapar(p.razon || "—")}</div>
        <div>Distancia al cliente: ${distancia}</div>
        <span class="mapa-estado" style="background:${COLOR_ESTADO[p.estado] ?? COLOR_NEUTRO}">${escapar(p.estado)}</span>
      </div>`;
  }
}

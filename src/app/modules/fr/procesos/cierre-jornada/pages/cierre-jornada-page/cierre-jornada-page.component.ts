import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { SnotifyPosition, SnotifyService } from "ng-snotify";

interface IJornadaRuta {
  ruta: string;
  agente: string;
  visitasRealizadas: number;
  totalVendido: number;
  totalCobrado: number;
  estado: "Abierta" | "Cerrada";
}

// Pantalla solo visual: no existe endpoint real. Los datos son de muestra.
const MOCK_JORNADAS: IJornadaRuta[] = [
  {
    ruta: "R001",
    agente: "AG01",
    visitasRealizadas: 8,
    totalVendido: 640.5,
    totalCobrado: 210.0,
    estado: "Abierta",
  },
  {
    ruta: "R002",
    agente: "AG02",
    visitasRealizadas: 6,
    totalVendido: 410.0,
    totalCobrado: 150.0,
    estado: "Abierta",
  },
];

@Component({
  selector: "app-cierre-jornada-page",
  templateUrl: "./cierre-jornada-page.component.html",
  styleUrls: ["./cierre-jornada-page.component.scss"],
})
export class CierreJornadaPageComponent implements OnInit, AfterViewInit {
  constructor(
    private _formBuilder: FormBuilder,
    private _snotifyService: SnotifyService
  ) {}

  filtroForm!: FormGroup;
  listJornadas = new MatTableDataSource<IJornadaRuta>();
  displayedColumns: string[] = [
    "ruta",
    "agente",
    "visitasRealizadas",
    "totalVendido",
    "totalCobrado",
    "estado",
    "actions",
  ];
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private _data: IJornadaRuta[] = [...MOCK_JORNADAS];

  ngOnInit(): void {
    this.filtroForm = this._formBuilder.group({
      fecha: [new Date().toISOString().slice(0, 10)],
    });
    this.listJornadas.data = this._data;
  }

  ngAfterViewInit(): void {
    this.listJornadas.paginator = this.paginator;
    this.listJornadas.sort = this.sort;
  }

  cerrarJornada(element: IJornadaRuta): void {
    this._data = this._data.map((item) =>
      item.ruta === element.ruta
        ? { ...item, estado: "Cerrada" as const }
        : item
    );
    this.listJornadas.data = this._data;
    this._snotifyService.info(
      "La jornada de la ruta " + element.ruta + " ha sido cerrada",
      { position: SnotifyPosition.rightTop }
    );
  }
}

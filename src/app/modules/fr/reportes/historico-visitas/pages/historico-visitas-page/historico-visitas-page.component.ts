import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";

interface IHistoricoVisita {
  agente: string;
  cliente: string;
  ruta: string;
  inicio: string;
  fin: string;
}

// Reporte solo visual (manual pag. 78): no existe endpoint real, se usan datos de muestra.
const MOCK_DATA: IHistoricoVisita[] = [
  {
    agente: "AG01",
    cliente: "CL001",
    ruta: "R001",
    inicio: "2026-08-08T08:00:00",
    fin: "2026-08-08T08:25:00",
  },
  {
    agente: "AG02",
    cliente: "CL003",
    ruta: "R002",
    inicio: "2026-08-09T09:10:00",
    fin: "2026-08-09T09:30:00",
  },
];

@Component({
  selector: "app-historico-visitas-page",
  templateUrl: "./historico-visitas-page.component.html",
  styleUrls: ["./historico-visitas-page.component.scss"],
})
export class HistoricoVisitasPageComponent implements OnInit, AfterViewInit {
  constructor(private _formBuilder: FormBuilder) {}

  filtroForm!: FormGroup;
  resultados = new MatTableDataSource<IHistoricoVisita>();
  displayedColumns: string[] = ["agente", "cliente", "ruta", "inicio", "fin"];
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.filtroForm = this._formBuilder.group({
      compania: ["COAGRO2"],
      agentes: [""],
      fechaDesde: [""],
      fechaHasta: [""],
    });
    this.resultados.data = MOCK_DATA;
  }

  ngAfterViewInit(): void {
    this.resultados.paginator = this.paginator;
    this.resultados.sort = this.sort;
  }

  generar(): void {
    this.resultados.data = MOCK_DATA;
  }
}

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ListaObservacionesComponent } from "./lista-observaciones.component";

describe("ListaObservacionesComponent", () => {
  let component: ListaObservacionesComponent;
  let fixture: ComponentFixture<ListaObservacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListaObservacionesComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaObservacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

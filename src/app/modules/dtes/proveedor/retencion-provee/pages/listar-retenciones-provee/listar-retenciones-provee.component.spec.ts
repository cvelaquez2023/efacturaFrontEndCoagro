import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ListarRetencionesProveeComponent } from "./listar-retenciones-provee.component";

describe("ListarRetencionesProveeComponent", () => {
  let component: ListarRetencionesProveeComponent;
  let fixture: ComponentFixture<ListarRetencionesProveeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListarRetencionesProveeComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListarRetencionesProveeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { FacturacionRutasPageComponent } from "./facturacion-rutas-page.component";

describe("FacturacionRutasPageComponent", () => {
  let component: FacturacionRutasPageComponent;
  let fixture: ComponentFixture<FacturacionRutasPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FacturacionRutasPageComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FacturacionRutasPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

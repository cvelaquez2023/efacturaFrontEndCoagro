import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AsignacionRutasPageComponent } from "./asignacion-rutas-page.component";

describe("AsignacionRutasPageComponent", () => {
  let component: AsignacionRutasPageComponent;
  let fixture: ComponentFixture<AsignacionRutasPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AsignacionRutasPageComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AsignacionRutasPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

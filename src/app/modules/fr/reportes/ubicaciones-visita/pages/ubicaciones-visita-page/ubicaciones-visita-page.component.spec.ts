import { ComponentFixture, TestBed } from "@angular/core/testing";

import { UbicacionesVisitaPageComponent } from "./ubicaciones-visita-page.component";

describe("UbicacionesVisitaPageComponent", () => {
  let component: UbicacionesVisitaPageComponent;
  let fixture: ComponentFixture<UbicacionesVisitaPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UbicacionesVisitaPageComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UbicacionesVisitaPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

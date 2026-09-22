import { ComponentFixture, TestBed } from "@angular/core/testing";

import { BitacoraSincronizacionPageComponent } from "./bitacora-sincronizacion-page.component";

describe("BitacoraSincronizacionPageComponent", () => {
  let component: BitacoraSincronizacionPageComponent;
  let fixture: ComponentFixture<BitacoraSincronizacionPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BitacoraSincronizacionPageComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BitacoraSincronizacionPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

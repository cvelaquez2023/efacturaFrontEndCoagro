import { ComponentFixture, TestBed } from "@angular/core/testing";

import { CargaArchivoPageComponent } from "./carga-archivo-page.component";

describe("CargaArchivoPageComponent", () => {
  let component: CargaArchivoPageComponent;
  let fixture: ComponentFixture<CargaArchivoPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CargaArchivoPageComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CargaArchivoPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

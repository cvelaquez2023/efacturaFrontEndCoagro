import { ComponentFixture, TestBed } from "@angular/core/testing";

import { CargaErpPageComponent } from "./carga-erp-page.component";

describe("CargaErpPageComponent", () => {
  let component: CargaErpPageComponent;
  let fixture: ComponentFixture<CargaErpPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CargaErpPageComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CargaErpPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

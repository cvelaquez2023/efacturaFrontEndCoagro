import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SugeridosVentaPageComponent } from "./sugeridos-venta-page.component";

describe("SugeridosVentaPageComponent", () => {
  let component: SugeridosVentaPageComponent;
  let fixture: ComponentFixture<SugeridosVentaPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SugeridosVentaPageComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SugeridosVentaPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

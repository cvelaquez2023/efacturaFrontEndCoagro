import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AddLineaAsientosComponent } from "./add-linea-asientos.component";

describe("AddLineaAsientosComponent", () => {
  let component: AddLineaAsientosComponent;
  let fixture: ComponentFixture<AddLineaAsientosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddLineaAsientosComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddLineaAsientosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

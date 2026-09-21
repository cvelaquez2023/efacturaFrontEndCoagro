import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AddRazonVisitaComponent } from "./add-razon-visita.component";

describe("AddRazonVisitaComponent", () => {
  let component: AddRazonVisitaComponent;
  let fixture: ComponentFixture<AddRazonVisitaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddRazonVisitaComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddRazonVisitaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

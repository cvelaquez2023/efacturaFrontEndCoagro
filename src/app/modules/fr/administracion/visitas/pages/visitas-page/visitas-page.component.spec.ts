import { ComponentFixture, TestBed } from "@angular/core/testing";

import { VisitasPageComponent } from "./visitas-page.component";

describe("VisitasPageComponent", () => {
  let component: VisitasPageComponent;
  let fixture: ComponentFixture<VisitasPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VisitasPageComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VisitasPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

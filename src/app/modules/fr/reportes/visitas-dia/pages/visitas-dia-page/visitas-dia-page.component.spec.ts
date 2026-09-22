import { ComponentFixture, TestBed } from "@angular/core/testing";

import { VisitasDiaPageComponent } from "./visitas-dia-page.component";

describe("VisitasDiaPageComponent", () => {
  let component: VisitasDiaPageComponent;
  let fixture: ComponentFixture<VisitasDiaPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VisitasDiaPageComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VisitasDiaPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { RazonesVisitaPageComponent } from "./razones-visita-page.component";

describe("RazonesVisitaPageComponent", () => {
  let component: RazonesVisitaPageComponent;
  let fixture: ComponentFixture<RazonesVisitaPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RazonesVisitaPageComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RazonesVisitaPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

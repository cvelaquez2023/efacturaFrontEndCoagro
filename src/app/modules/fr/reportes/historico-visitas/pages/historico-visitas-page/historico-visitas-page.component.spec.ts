import { ComponentFixture, TestBed } from "@angular/core/testing";

import { HistoricoVisitasPageComponent } from "./historico-visitas-page.component";

describe("HistoricoVisitasPageComponent", () => {
  let component: HistoricoVisitasPageComponent;
  let fixture: ComponentFixture<HistoricoVisitasPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HistoricoVisitasPageComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoricoVisitasPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { CierreJornadaPageComponent } from "./cierre-jornada-page.component";

describe("CierreJornadaPageComponent", () => {
  let component: CierreJornadaPageComponent;
  let fixture: ComponentFixture<CierreJornadaPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CierreJornadaPageComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CierreJornadaPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

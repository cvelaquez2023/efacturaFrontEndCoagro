import { ComponentFixture, TestBed } from "@angular/core/testing";

import { RutasPageComponent } from "./rutas-page.component";

describe("RutasPageComponent", () => {
  let component: RutasPageComponent;
  let fixture: ComponentFixture<RutasPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RutasPageComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RutasPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

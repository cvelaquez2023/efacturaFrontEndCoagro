import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DevolucionesPageComponent } from "./devoluciones-page.component";

describe("DevolucionesPageComponent", () => {
  let component: DevolucionesPageComponent;
  let fixture: ComponentFixture<DevolucionesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DevolucionesPageComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DevolucionesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

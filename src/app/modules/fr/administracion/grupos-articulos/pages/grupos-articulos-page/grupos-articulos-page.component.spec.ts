import { ComponentFixture, TestBed } from "@angular/core/testing";

import { GruposArticulosPageComponent } from "./grupos-articulos-page.component";

describe("GruposArticulosPageComponent", () => {
  let component: GruposArticulosPageComponent;
  let fixture: ComponentFixture<GruposArticulosPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GruposArticulosPageComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GruposArticulosPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

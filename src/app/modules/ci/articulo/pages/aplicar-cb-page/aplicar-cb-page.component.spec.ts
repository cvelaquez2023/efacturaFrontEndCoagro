import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AplicarCbPageComponent } from "./aplicar-cb-page.component";

describe("AplicarCbPageComponent", () => {
  let component: AplicarCbPageComponent;
  let fixture: ComponentFixture<AplicarCbPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AplicarCbPageComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AplicarCbPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AplicarCPPageComponent } from "./aplicar-cppage.component";

describe("AplicarCPPageComponent", () => {
  let component: AplicarCPPageComponent;
  let fixture: ComponentFixture<AplicarCPPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AplicarCPPageComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AplicarCPPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

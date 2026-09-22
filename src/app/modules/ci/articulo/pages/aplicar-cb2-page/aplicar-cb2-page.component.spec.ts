import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AplicarCb2PageComponent } from "./aplicar-cb2-page.component";

describe("AplicarCb2PageComponent", () => {
  let component: AplicarCb2PageComponent;
  let fixture: ComponentFixture<AplicarCb2PageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AplicarCb2PageComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AplicarCb2PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

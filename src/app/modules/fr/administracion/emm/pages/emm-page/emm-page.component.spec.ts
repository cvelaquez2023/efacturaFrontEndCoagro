import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EmmPageComponent } from "./emm-page.component";

describe("EmmPageComponent", () => {
  let component: EmmPageComponent;
  let fixture: ComponentFixture<EmmPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmmPageComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmmPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

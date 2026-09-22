import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DashboardGeneralPageComponent } from "./dashboard-general-page.component";

describe("DashboardGeneralPageComponent", () => {
  let component: DashboardGeneralPageComponent;
  let fixture: ComponentFixture<DashboardGeneralPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardGeneralPageComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardGeneralPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

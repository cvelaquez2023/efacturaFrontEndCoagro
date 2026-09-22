import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AgentesPageComponent } from "./agentes-page.component";

describe("AgentesPageComponent", () => {
  let component: AgentesPageComponent;
  let fixture: ComponentFixture<AgentesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AgentesPageComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AgentesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

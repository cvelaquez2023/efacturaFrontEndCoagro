import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ConfiguracionHhPageComponent } from "./configuracion-hh-page.component";

describe("ConfiguracionHhPageComponent", () => {
  let component: ConfiguracionHhPageComponent;
  let fixture: ComponentFixture<ConfiguracionHhPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConfiguracionHhPageComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfiguracionHhPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

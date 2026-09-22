import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ListarInvalidacionesPagesComponent } from "./listar-invalidaciones-pages.component";

describe("ListarInvalidacionesPagesComponent", () => {
  let component: ListarInvalidacionesPagesComponent;
  let fixture: ComponentFixture<ListarInvalidacionesPagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListarInvalidacionesPagesComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListarInvalidacionesPagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ListaUsuariosPagesComponent } from "./lista-usuarios-pages.component";

describe("ListaUsuariosPagesComponent", () => {
  let component: ListaUsuariosPagesComponent;
  let fixture: ComponentFixture<ListaUsuariosPagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListaUsuariosPagesComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaUsuariosPagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

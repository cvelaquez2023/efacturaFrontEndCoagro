import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ListarSujetoExcluidoComponent } from "./listar-sujeto-excluido.component";

describe("ListarSujetoExcluidoComponent", () => {
  let component: ListarSujetoExcluidoComponent;
  let fixture: ComponentFixture<ListarSujetoExcluidoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListarSujetoExcluidoComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListarSujetoExcluidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

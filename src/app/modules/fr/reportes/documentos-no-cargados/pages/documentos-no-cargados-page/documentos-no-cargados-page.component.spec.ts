import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DocumentosNoCargadosPageComponent } from "./documentos-no-cargados-page.component";

describe("DocumentosNoCargadosPageComponent", () => {
  let component: DocumentosNoCargadosPageComponent;
  let fixture: ComponentFixture<DocumentosNoCargadosPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DocumentosNoCargadosPageComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentosNoCargadosPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

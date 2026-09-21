import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ClientesAbandonoPageComponent } from "./clientes-abandono-page.component";

describe("ClientesAbandonoPageComponent", () => {
  let component: ClientesAbandonoPageComponent;
  let fixture: ComponentFixture<ClientesAbandonoPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClientesAbandonoPageComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientesAbandonoPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

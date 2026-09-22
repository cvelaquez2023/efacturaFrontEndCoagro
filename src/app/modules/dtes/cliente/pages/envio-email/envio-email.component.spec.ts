import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EnvioEmailComponent } from "./envio-email.component";

describe("EnvioEmailComponent", () => {
  let component: EnvioEmailComponent;
  let fixture: ComponentFixture<EnvioEmailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EnvioEmailComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnvioEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AddSujetoExcluidoCHComponent } from "./add-sujeto-excluido-ch.component";

describe("AddSujetoExcluidoCHComponent", () => {
  let component: AddSujetoExcluidoCHComponent;
  let fixture: ComponentFixture<AddSujetoExcluidoCHComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddSujetoExcluidoCHComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSujetoExcluidoCHComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { TreeFrComponent } from "./tree-fr.component";

describe("TreeFrComponent", () => {
  let component: TreeFrComponent;
  let fixture: ComponentFixture<TreeFrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TreeFrComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeFrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

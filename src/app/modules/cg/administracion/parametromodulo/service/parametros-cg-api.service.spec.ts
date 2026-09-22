import { TestBed } from "@angular/core/testing";

import { ParametrosCgApiService } from "./parametros-cg-api.service";

describe("ParametrosCgApiService", () => {
  let service: ParametrosCgApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ParametrosCgApiService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});

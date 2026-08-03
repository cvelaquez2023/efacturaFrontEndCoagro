import { environment } from 'src/environments/environment';
import { TestBed } from '@angular/core/testing';

import { UnidadMedidaApiService } from './unidad-medida-api.service';

describe('UnidadMedidaApiService', () => {
	let service: UnidadMedidaApiService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(UnidadMedidaApiService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});

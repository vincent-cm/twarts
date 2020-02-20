import { TestBed } from '@angular/core/testing';

import { FetchPalaceHttpService } from './fetch-palace-http.service';

describe('FetchPalaceHttpService', () => {
  let service: FetchPalaceHttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FetchPalaceHttpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

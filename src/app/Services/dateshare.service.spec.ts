import { TestBed } from '@angular/core/testing';

import { DateshareService } from './dateshare.service';

describe('DateshareService', () => {
  let service: DateshareService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DateshareService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { OSMService } from './osm.service';

describe('OSMService', () => {
  let service: OSMService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OSMService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

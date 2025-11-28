import { TestBed } from '@angular/core/testing';

import { SqliteDbService } from './sqlite-db.service';

describe('SqliteDbService', () => {
  let service: SqliteDbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SqliteDbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GcreatorPage } from './gcreator.page';

describe('GcreatorPage', () => {
  let component: GcreatorPage;
  let fixture: ComponentFixture<GcreatorPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GcreatorPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GcreatorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

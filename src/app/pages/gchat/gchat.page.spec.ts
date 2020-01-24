import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GchatPage } from './gchat.page';

describe('GchatPage', () => {
  let component: GchatPage;
  let fixture: ComponentFixture<GchatPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GchatPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GchatPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

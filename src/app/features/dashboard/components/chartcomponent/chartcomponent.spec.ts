import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Chartcomponent } from './chartcomponent';

describe('Chartcomponent', () => {
  let component: Chartcomponent;
  let fixture: ComponentFixture<Chartcomponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Chartcomponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Chartcomponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

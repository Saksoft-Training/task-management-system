import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DilogDeleteComponent } from './dilog-delete-component';

describe('DilogDeleteComponent', () => {
  let component: DilogDeleteComponent;
  let fixture: ComponentFixture<DilogDeleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DilogDeleteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DilogDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

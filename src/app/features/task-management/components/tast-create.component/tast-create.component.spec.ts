import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TastCreateComponent } from './task-create.component';



describe('TastCreateComponent', () => {
  let component: TastCreateComponent;
  let fixture: ComponentFixture<TastCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TastCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TastCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

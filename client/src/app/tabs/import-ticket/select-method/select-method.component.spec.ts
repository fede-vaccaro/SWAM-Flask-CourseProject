import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SelectMethodComponent } from './select-method.component';

describe('SelectMethodComponent', () => {
  let component: SelectMethodComponent;
  let fixture: ComponentFixture<SelectMethodComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectMethodComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectMethodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

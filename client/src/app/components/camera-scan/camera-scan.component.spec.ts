import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CameraScanComponent } from './camera-scan.component';

describe('CameraScanComponent', () => {
  let component: CameraScanComponent;
  let fixture: ComponentFixture<CameraScanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CameraScanComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CameraScanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

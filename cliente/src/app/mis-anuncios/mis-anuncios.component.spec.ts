import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisAnunciosComponent } from './mis-anuncios.component';

describe('MisAnunciosComponent', () => {
  let component: MisAnunciosComponent;
  let fixture: ComponentFixture<MisAnunciosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisAnunciosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisAnunciosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MostReadArticlesComponent } from './most-read-articles.component';

describe('MostReadArticlesComponent', () => {
  let component: MostReadArticlesComponent;
  let fixture: ComponentFixture<MostReadArticlesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MostReadArticlesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MostReadArticlesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

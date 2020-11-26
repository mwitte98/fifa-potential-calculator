import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let comp: AppComponent;

  beforeEach(() => {
    comp = new AppComponent();
  });

  it('component is created', () => {
    expect(comp).toBeTruthy();
  });
});

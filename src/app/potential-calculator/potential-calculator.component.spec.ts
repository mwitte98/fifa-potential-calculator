import { PotentialCalculatorComponent } from './potential-calculator.component';

describe('PotentialCalculatorComponent', () => {
  let comp: PotentialCalculatorComponent;

  beforeEach(() => {
    comp = new PotentialCalculatorComponent({} as any);
  });

  it('component is created', () => {
    expect(comp).toBeTruthy();
  });
});

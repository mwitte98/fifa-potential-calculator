import { FormGroup } from '@angular/forms';

export interface PlayerForm {
  name: string;
  positions: string[];
  age: string;
  overall: string;
  value: string;
  calculatedPositions: CalculatedPosition[];
}

export interface Factor {
  min: number;
  max: number;
  factor: number;
}

export interface Position {
  abbr: string;
  factor: number;
}

export interface Section {
  name: string;
  playerCount: number;
  displayDetails: boolean;
  forms: FormGroup[];
}

export interface SavedSection {
  name: string;
  playerCount: number;
  displayDetails: boolean;
  formValues: PlayerForm[];
}

export interface CalculatedPosition {
  position: string;
  strikethrough: boolean;
  calculations: Calculation[];
}

export interface Calculation {
  overall: number;
  minPotential: number;
  maxPotential: number;
  strikethrough: boolean;
}

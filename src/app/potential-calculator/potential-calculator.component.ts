import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import {
  AGE_FACTORS,
  CURRENCY_USD,
  OVERALL_FACTORS,
  POSITIONS,
  POTENTIAL_FACTORS
} from '../shared/constants/constants';
import {
  CalculatedPosition,
  Calculation,
  Factor,
  PlayerForm,
  Position,
  SavedSection,
  Section
} from '../shared/types/interfaces';

@Component({
  templateUrl: './potential-calculator.component.html',
  styleUrls: ['./potential-calculator.component.scss']
})
export class PotentialCalculatorComponent implements OnInit {
  POSITIONS = POSITIONS;
  defaultSections: Section[] = [
    { name: 'Youth Academy', playerCount: 16, multiplePositions: false, forms: [] },
    { name: 'Scout 1', playerCount: 16, multiplePositions: true, forms: [] },
    { name: 'Scout 2', playerCount: 16, multiplePositions: true, forms: [] },
    { name: 'Scout 3', playerCount: 16, multiplePositions: true, forms: [] },
    { name: 'Team', playerCount: 52, multiplePositions: false, forms: [] }
  ];
  sections: Section[] = [];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    const savedSections = this.loadSections();
    for (const savedSection of savedSections) {
      const section: Section = {
        name: savedSection.name,
        playerCount: savedSection.playerCount,
        multiplePositions: savedSection.multiplePositions,
        forms: []
      };
      for (let i = 0; i < savedSection.playerCount; i++) {
        const formValue = savedSection.formValues[i];
        const form = this.createForm(formValue);
        section.forms.push(form);
      }
      this.sections.push(section);
    }
  }

  createForm(formValue: PlayerForm): FormGroup {
    const form = this.fb.group({
      name: [formValue?.name ?? null],
      position: [formValue?.position ?? null],
      positions: [formValue?.positions ?? null],
      age: [formValue?.age ?? null],
      overall: [formValue?.overall ?? null],
      value: [formValue?.value ?? null],
      calculatedPositions: [formValue?.calculatedPositions ?? []]
    });
    form.valueChanges.subscribe((player: PlayerForm) => {
      this.calculatePotential(player);
      this.saveSections();
    });
    return form;
  }

  loadSections(): SavedSection[] {
    const savedSections = localStorage.getItem('sections');
    let parsedSections: SavedSection[] = [];
    if (savedSections != null) {
      parsedSections = JSON.parse(savedSections);
    }

    return this.defaultSections.map((defaultSection: Section) => {
      const parsedSection = parsedSections.find((section: SavedSection) => section.name === defaultSection.name);
      return {
        name: defaultSection.name,
        playerCount: defaultSection.playerCount,
        multiplePositions: defaultSection.multiplePositions,
        formValues: parsedSection?.formValues ?? []
      };
    });
  }

  saveSections(): void {
    const savedSections: SavedSection[] = this.sections.map((section: Section) => {
      return {
        name: section.name,
        playerCount: section.playerCount,
        multiplePositions: section.multiplePositions,
        formValues: section.forms.map((form: FormGroup) => form.value)
      };
    });
    localStorage.setItem('sections', JSON.stringify(savedSections));
  }

  trackBySection(_index: number, section: Section): string {
    return section.name;
  }

  trackByForm(_index: number, form: FormGroup): FormGroup {
    return form;
  }

  trackByPosition(_index: number, position: Position): string {
    return position.abbr;
  }

  trackByCalculatedPosition(_index: number, calculatedPosition: CalculatedPosition): string {
    return calculatedPosition.position;
  }

  trackByCalculation(_index: number, calculation: Calculation): number {
    return calculation.overall;
  }

  drop(event: CdkDragDrop<FormGroup[]>, section: Section): void {
    moveItemInArray(section.forms, event.previousIndex, event.currentIndex);
    this.saveSections();
  }

  toggleStrikethrough(clickedObject: CalculatedPosition | Calculation): void {
    clickedObject.strikethrough = !clickedObject.strikethrough;
    this.saveSections();
  }

  clearForm(form: FormGroup): void {
    form.patchValue({
      name: null,
      position: null,
      positions: null,
      age: null,
      overall: null,
      value: null,
      calculatedPositions: []
    });
  }

  getPotential(calculation: Calculation): string {
    let potentialString = String(calculation.minPotential);
    if (calculation.minPotential !== calculation.maxPotential) {
      potentialString += `-${calculation.maxPotential}`;
    }
    return potentialString;
  }

  calculatePotential(player: PlayerForm): void {
    player.calculatedPositions = [];
    const overalls = player.overall == null ? ['0'] : player.overall.split('-');
    const minOverall = Number(overalls[0]);
    const maxOverall =
      overalls.length > 1 && Number(overalls[1]) > Number(overalls[0]) ? Number(overalls[1]) : Number(overalls[0]);
    const positions = player.position ? [player.position] : player.positions ?? [];

    for (const position of positions) {
      const calculatedPosition: CalculatedPosition = { position, calculations: [], strikethrough: false };
      for (let overall = minOverall; overall <= maxOverall; overall++) {
        const potentials = this.calculatePotentials(player, position, overall);
        if (potentials.length > 0) {
          calculatedPosition.calculations.push({
            overall,
            minPotential: potentials[0],
            maxPotential: potentials[potentials.length - 1],
            strikethrough: false
          });
        }
      }
      if (calculatedPosition.calculations.length > 0) {
        player.calculatedPositions.push(calculatedPosition);
      }
    }
  }

  calculatePotentials(player: PlayerForm, position: string, overall: number): number[] {
    const positionFactor = POSITIONS.find((pos: Position) => pos.abbr === position)?.factor ?? 0;
    const playerValue = this.convertPlayerValue(player.value);
    const baseValue = this.findFactor(OVERALL_FACTORS, overall) * CURRENCY_USD;
    const positionMod = (positionFactor * baseValue) / 100;
    const ageMod = (this.findFactor(AGE_FACTORS, this.offsetAge(position, Number(player.age))) * baseValue) / 100;

    const potentials: number[] = [];
    for (let potential = overall; potential <= 100; potential++) {
      const potentialMod = (this.findFactor(POTENTIAL_FACTORS, potential - overall) * baseValue) / 100;

      const summedValue = baseValue + positionMod + potentialMod + ageMod;
      const roundedValue = this.roundValue(summedValue);

      if (roundedValue === playerValue) {
        potentials.push(potential);
      }
    }
    return potentials;
  }

  convertPlayerValue(inputValue: string): number {
    if (inputValue == null || inputValue.length === 0) {
      return 0;
    }
    if (!Number.isNaN(Number(inputValue))) {
      return Number(inputValue);
    }
    const lastCharacter = inputValue[inputValue.length - 1];
    const numericalCharacters = Number(inputValue.slice(0, -1));
    if (lastCharacter === 'M') {
      return numericalCharacters * 1_000_000;
    }
    if (lastCharacter === 'K') {
      return numericalCharacters * 1000;
    }
    return 0;
  }

  offsetAge(positionAbbr: string, age: number): number {
    let updatedAge = age;
    if (positionAbbr === 'GK') {
      if (age >= 40) {
        updatedAge = 36;
      } else if (age >= 37) {
        updatedAge = 35;
      } else if (age >= 28) {
        updatedAge = age - 2;
      }
    }
    return updatedAge;
  }

  findFactor(factors: Factor[], value: number): number {
    let factorValue = factors[0].factor;
    for (const factor of factors) {
      if (value >= factor.min && value <= factor.max) {
        factorValue = factor.factor;
        break;
      }
    }
    return factorValue;
  }

  findDivisor(value: number): number {
    let divisor = 0;
    if (value <= 5000) {
      divisor = 50;
    } else if (value <= 10_000) {
      divisor = 1000;
    } else if (value <= 50_000) {
      divisor = 5000;
    } else if (value <= 250_000) {
      divisor = 10_000;
    } else if (value <= 1_000_000) {
      divisor = 25_000;
    } else if (value <= 5_000_000) {
      divisor = 100_000;
    } else {
      divisor = 500_000;
    }
    return divisor;
  }

  roundValue(value: number): number {
    const divisor = this.findDivisor(value);
    const remainder = value % divisor;
    let roundedValue = value - remainder;
    if (remainder > divisor / 2) {
      roundedValue += divisor;
    }
    return roundedValue;
  }
}

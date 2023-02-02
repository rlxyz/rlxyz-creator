import { _testContractClaimBasic } from './sale/_testContractClaimBasic';
import { _testContractClaimGenerative } from './sale/_testContractClaimGenerative';
import { _testContractGenerative } from './sale/_testContractGenerative';
import { _testContractPresale } from './sale/_testContractPresale';
import { _testContractPublic } from './sale/_testContractPublic';
import {
  ElevatCreatorSaleType,
  ElevateCreatorBeforeEach,
  ElevateCreatorConstructor,
  ElevateCreatorVariation,
} from './type';

export const testContractSale = (
  _beforeEach: ElevateCreatorBeforeEach,
  variation: ElevateCreatorVariation,
  types: ElevatCreatorSaleType[],
  params: ElevateCreatorConstructor
) => {
  describe('sale', () => {
    types.forEach((type) => {
      switch (type) {
        case 'claim':
          if (variation === 'basic') _testContractClaimBasic(_beforeEach);
          else if (variation === 'generative') _testContractClaimGenerative(_beforeEach, params);
          break;
        case 'presale':
          _testContractPresale(_beforeEach, params);
          break;
        case 'public':
          _testContractPublic(_beforeEach, params);
          break;
      }
    });
  });

  describe('extra', () => {
    switch (variation) {
      case 'generative':
        _testContractGenerative(_beforeEach, params);
        break;
    }
  });
};

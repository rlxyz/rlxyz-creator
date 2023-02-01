export declare type Merklized = {
  root: string;
  tree: any;
};

export declare type ElevateCreatorBeforeEach = (args: ElevateCreatorConstructor) => Promise<any>;

export type ElevateCreatorConstructor = {
  name: string;
  symbol: string;
  mintRandomizerContract: string;
  collectionSize: number;
  maxMintPerAddress: number;
  amountForPromotion: number;
  mintPrice: string;
  claimTime: number;
  presaleTime: number;
  publicTime: number;
};

export declare type ElevateCreatorVariation = 'generative' | 'claim' | 'basic';
export declare type ElevateCreatorSaleType = 'claim' | 'presale' | 'public';

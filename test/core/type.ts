export declare type Merklized = {
  root: string;
  tree: any;
};

export declare type RhapsodyCreatorBeforeEach = (args: RhapsodyCreatorConstructor) => Promise<any>;

export type RhapsodyCreatorConstructor = {
  name: string;
  symbol: string;
  collectionSize: number;
  maxMintPerAddress: number;
  amountForPromotion: number;
  mintPrice: string;
  claimTime: number;
  presaleTime: number;
  publicTime: number;
};

export declare type RhapsodyCreatorVariation = 'generative' | 'claim' | 'basic';
export declare type RhapsodyCreatorSaleType = 'claim' | 'presale' | 'public';

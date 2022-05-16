export declare type Merklized = {
  root: string;
  tree: any;
};

export declare type RhapsodyCreatorBeforeEach = (args: RhapsodyCreatorConstructor) => Promise<any>;

export declare type RhapsodyCreatorConstructor = {
  collectionSize: number;
  maxPublicBatchPerAddress?: number;
  amountForPromotion?: number;
  mintPrice?: number;
};

export declare type RhapsodyCreatorVariation = 'generative' | 'claim' | 'basic';
export declare type RhapsodyCreatorSaleType = 'claim' | 'presale' | 'public';

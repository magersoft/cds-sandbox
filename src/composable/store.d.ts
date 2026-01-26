export interface IInitial {
  shortId?: string;
  serializedState?: string;
  initialized?: () => void;
}

export interface IUserOptions {
  styleSource?: string;
  showHidden?: boolean;
}

export type TVersionKey = 'vue' | 'cds' | 'typescript';
export type TVersions = Record<TVersionKey, string>;

export type TSerializeState = Record<string, string> & {
  _o?: IUserOptions;
};

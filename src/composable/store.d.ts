import type { Store } from '@vue/repl';
import type { Ref } from 'vue';
import type { ReactiveVariable } from 'vue/macros';

export interface IInitial {
  serializedState?: string;
  versions?: TVersions;
  userOptions?: IUserOptions;
  pr?: string | null;
}

export interface IUserOptions {
  styleSource?: string;
  showHidden?: boolean;
}

export type TVersionKey = 'vue' | 'cds';
export type TVersions = Record<TVersionKey, string>;

export type TSerializeState = Record<string, string> & {
  _o?: IUserOptions;
};

export interface IUseStore extends Store {
  versions: TVersions;
  userOptions: Ref<{ styleSource?: string | undefined, showHidden?: boolean | undefined }>;
  init: () => void;
  serialize: () => string;
  setVersion: (key: TVersionsKey, version: string) => void;
  pr?: string | null;
}

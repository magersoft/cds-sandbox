export interface IImportMap {
  imports?: Record<string, string>;
  scopes?: Record<string, string>;
}

export const mergeImportMap = (a: IImportMap, b: IImportMap): IImportMap => {
  return {
    imports: {
      ...(a.imports || {}),
      ...(b.imports || {})
    },
    scopes: {
      ...(a.scopes || {}),
      ...(b.scopes || {})
    }
  };
};

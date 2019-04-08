export interface ProjectOptions {
  name?: string;
  outputDir?: string;
  formats?: Array<string>;
  transpileDependencies?: Array<string | RegExp>;
  productionSourceMap?: boolean;

  lintOnSave?: boolean;
  lintFomatter?: string;
  banner?: string;
  footer?: string;

  changeRollup?: (config: any) => void;
}

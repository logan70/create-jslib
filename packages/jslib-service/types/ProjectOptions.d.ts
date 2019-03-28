export interface ProjectOptions {
  name?: string;
  outputDir?: string;
  formats?: Array<string>;
  transpileDependencies?: Array<string | RegExp>;
  productionSourceMap?: boolean;

  lintOnSave?: boolean;
  lingFomatter?: string;
  banner?: string;
  footer?: string;
}

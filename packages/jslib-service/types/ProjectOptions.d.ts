export interface ProjectOptions {
  name?: string;
  outputDir?: string;
  formats?: Array<string>;
  transpileDependencies?: Array<string | RegExp>;
  productionSourceMap?: boolean;

  lintOnSave?: boolean;
  lintConfig?: object;
  banner?: string;
  footer?: string;

  configureRollup?: (config: any) => void;
}

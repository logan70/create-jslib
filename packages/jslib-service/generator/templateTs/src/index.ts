<%_ if (doesCompile) { _%>
export const foo: number = 1
export const bar: number = 2
<%_ if (doesGenerateDocs) { _%>
/**
 * @description get the sum of foo and bar
 * @return the sum of foo and bar
 * @example
 * ```js
 *
 * const result = add()
 * ```
 */
<%_ } _%>
export const add: () => number = (): number => foo + bar
<%_ } else { _%>
export var foo:number = 1
export var bar:number = 2
<%_ if (doesGenerateDocs) { _%>
/**
 * @description get the sum of foo and bar
 * @return the sum of foo and bar
 * @example
 * ```js
 *
 * var result = add()
 * ```
 */
<%_ } _%>
export function add(): number {
  return foo + bar
}
<%_ } _%>

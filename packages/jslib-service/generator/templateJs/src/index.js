<%_ if (doesCompile) { _%>
export const foo = 1
export const bar = 2
<%_ if (doesGenerateDocs) { _%>
/**
 * @description get the sum of foo and bar
 * @method add
 * @return {Number} - the sum of foo and bar
 * @example
 * const result = add()
 */
<%_ } _%>
export const add = () => foo + bar
<%_ } else { _%>
export var foo = 1
export var bar = 2
<%_ if (doesGenerateDocs) { _%>
/**
 * @description get the sum of foo and bar
 * @method add
 * @return {Number} - the sum of foo and bar
 * @example
 * var result = add()
 */
<%_ } _%>
export var add = function () {
  return foo + bar
}
<%_ } _%>

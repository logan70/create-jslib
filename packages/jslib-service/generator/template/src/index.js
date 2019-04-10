<%_ if (!useTS) { _%>
<%_ if (doesGenerateDocs) { _%>
/**
 * @description Hello world!
 * @method hello
 * @returns {String} `Hello world!` string.
 * @example
 * const helloStr = hello() // 'Hello world!'
 */
<%_ } _%>
export function hello() {
  return 'Hello world!'
}

<%_ if (doesCompile) { _%>
export const foo = 'foo'
<%_ } else { _%>
export var foo = 1
<%_ } _%>

<%_ } _%>

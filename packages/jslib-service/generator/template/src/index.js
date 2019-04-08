<%_ if (!useTS) { _%>
<%_ if (doesGenerateDocs) { _%>
/**
 * @description Hello world!
 * @method hello
 * @return
 * @example
 * hello() // output: Hello world!
 */
<%_ } _%>
export function hello() {
  console.log('Hello world!')
}

<%_ if (doesCompile) { _%>
export const foo = 'foo'
<%_ } else { _%>
export var foo = 1
<%_ } _%>

<%_ } _%>

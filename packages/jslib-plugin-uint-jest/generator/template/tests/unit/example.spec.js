<%_ if (!hasTS) { _%>
import { hello } from '../../src/index'

describe('index.js', () => {
  it('should return `Hello world!`', () => {
    expect(hello()).toBe('Hello world!')
  })
})
<%_ } _%>

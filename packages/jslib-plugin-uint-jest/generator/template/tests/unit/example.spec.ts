<%_ if (hasTS) { _%>
import { hello } from '../../src/index'
  
describe('index.js', (): void => {
  it('should return `Hello world!`', (): void => {
    expect(hello()).toBe('Hello world!')
  })
})
  <%_ } _%>

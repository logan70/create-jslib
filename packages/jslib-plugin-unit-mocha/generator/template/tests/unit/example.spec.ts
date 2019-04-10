<%_ if (hasTS) { _%>
import { expect } from 'chai'
import { hello } from '../../src/index'
  
describe('index.js', (): void => {
  it('should return `Hello world!`', (): void => {
    expect(hello()).to.equal('Hello world!')
  })
})

<%_ } _%>

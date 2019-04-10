<%_ if (!hasTS) { _%>
import { expect } from 'chai'
import { hello } from '../../src/index'

describe('index.js', () => {
  it('should return `Hello world!`', () => {
    expect(hello()).to.equal('Hello world!')
  })
})
<%_ } _%>

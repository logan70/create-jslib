<%_ if (!hasTS) { _%>
import { hello } from '../../src/index'

let outputData = ''
const storeLog = input => {
  outputData += input
}

describe('index.js', () => {
  it('console log `Hello world!`', () => {
    console.log = jest.fn(storeLog)
    hello()
    expect(outputData).toBe('Hello world!')
  })
})
<%_ } _%>

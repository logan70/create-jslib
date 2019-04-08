<%_ if (hasTS) { _%>
import { hello } from '../../src/index'
  
let outputData: string = ''
const storeLog = (input): string => {
  outputData += input
  return outputData
}
  
describe('index.js', (): void => {
  it('console log `Hello world!`', (): void => {
    console.log = jest.fn(storeLog)
    hello()
    expect(outputData).toBe('Hello world!')
  })
})
  <%_ } _%>
  
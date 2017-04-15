import { Component, createElement } from 'react'

export default function makeContainer (fetcher) {
  return {
    create (Component, params) {
      const container = class SecondContainer extends Component {
        constructor(props) {
          super(props)

          this.displayName = `SecondContainer/${Component.displayName}`
          this.state = {
            data: fetcher.request(params.data(props))
          }
        }

        render () {
          return createElement(Component, Object.assign({}, this.props, this.state.data))
        }
      }

      return container
    }
  }
}

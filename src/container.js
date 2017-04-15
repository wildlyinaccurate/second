import { createElement } from 'react'
import createReactClass from 'create-react-class'

export default function makeContainer (fetcher) {
  return {
    create (Component, params) {
      return createReactClass({
        displayName: `SecondContainer/${Component.displayName}`,

        getInitialState: function getInitialState () {
          return {
            data: fetcher.request(params.data(this.props))
          }
        },

        render: function render () {
          return createElement(Component, Object.assign({}, this.props, this.state.data))
        }
      })
    }
  }
}

import { Component, h } from 'preact'
import fetcher from '../global-fetcher'

export default function createContainer (WrappedComponent, params) {
  const container = class Container extends Component {
    constructor (props) {
      super(props)

      this.state = {
        data: fetcher.request(params.data(props))
      }
    }

    render () {
      return h(
        WrappedComponent,
        Object.assign({}, this.props, this.state.data)
      )
    }
  }

  container.displayName = `Container/${WrappedComponent.displayName}`

  return container
}

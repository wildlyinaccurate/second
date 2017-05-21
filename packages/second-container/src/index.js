export default function containerFactory ({ fetcher, Component, createElement }) {
  return function createContainer (WrappedComponent, params) {
    const container = class Container extends Component {
      constructor (props) {
        super(props)

        this.state = {
          data: fetcher.request(params.data(props))
        }
      }

      render () {
        return createElement(
          WrappedComponent,
          Object.assign({}, this.props, this.state.data)
        )
      }
    }

    container.displayName = `SecondContainer[${WrappedComponent.displayName}]`

    return container
  }
}

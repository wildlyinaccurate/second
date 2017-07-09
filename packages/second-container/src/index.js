export default function containerFactory ({ fetcher, Component, createElement }) {
  return function createContainer (WrappedComponent, params) {
    const wrappedName = WrappedComponent.displayName || WrappedComponent.name

    const container = class Container extends Component {
      constructor (props) {
        super(props)

        this.state = {
          data: fetcher.request(params.data(props))
        }
      }

      render () {
        if (!fetcher.hasPendingMandatoryRequests()) {
          return createElement(
            WrappedComponent,
            Object.assign({}, this.props, this.state.data)
          )
        }
      }
    }

    container.displayName = `SecondContainer[${wrappedName}]`

    return container
  }
}

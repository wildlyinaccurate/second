export default function makeContainer (React, fetcher) {
  return {
    create (Component, params) {
      const container = class SecondContainer extends React.Component {
        constructor(props) {
          super(props)

          this.displayName = `SecondContainer/${Component.displayName}`
          this.state = {
            data: fetcher.request(params.data(props))
          }
        }

        render () {
          return React.createElement(
            Component,
            Object.assign({}, this.props, this.state.data)
          )
        }
      }

      return container
    }
  }
}

import React, { createElement } from 'react'
import createReactClass from 'create-react-class'
import { mapValues } from 'lodash/fp'

import { fetch } from './data'

const fetchData = mapValues(fetch)

export function create (element, params) {
  return createReactClass({
    displayName: `SecondContainer/${element.displayName}`,

    getInitialState: function getInitialState () {
      return {
        data: fetchData(params.data(this.props))
      }
    },

    render: function render () {
      return createElement(element, Object.assign({}, this.props, this.state.data))
    }
  })
}

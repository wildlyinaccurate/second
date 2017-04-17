type VDOMElement = any

interface VDOMLibrary {
  createElement(type: any, props: object, children?: any): VDOMElement
}

interface VDOMRenderer {
  renderToString(VDOMElement)
}

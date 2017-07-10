export default function createDehydrator (createElement) {
  return function dehydrate (Component) {
    if (typeof DISABLE_DEHYDRATOR === 'undefined') {
      return function DehydratedLeaf (props) {
        const crypto = require('crypto')
        const serialisedProps = JSON.stringify(props)
        const componentId = crypto.createHash('sha256').update(serialisedProps).digest('hex')
        const componentName = Component.displayName || Component.name

        return createElement(
          'span',
          null,
          createElement(
            'span',
            { 'data-component-name': componentName, 'data-hydration-id': componentId },
            createElement(Component, props)
          ),
          renderSerialisedProps(componentId, serialisedProps)
        )
      }
    }

    return Component
  }

  function renderSerialisedProps (componentId, serialisedProps) {
    return createElement('script', {
      'data-hydration-id': componentId,
      type: 'application/hydration-data',
      dangerouslySetInnerHTML: { __html: serialisedProps }
    })
  }
}

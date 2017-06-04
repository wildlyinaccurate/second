/** @jsx createElement */
export default function createDehydrator (createElement) {
  return function dehydrate (Component) {
    if (typeof DISABLE_DEHYDRATOR === 'undefined') {
      return function DehydratedLeaf (props) {
        const crypto = require('crypto')
        const serialisedProps = JSON.stringify(props)
        const componentId = crypto.createHash('sha256').update(serialisedProps).digest('hex')

        return (
          <span>
            <span data-component-name={Component.displayName} data-hydration-id={componentId}>
              <Component {...props} />
            </span>

            {renderSerialisedProps(componentId, serialisedProps)}
          </span>
        )
      }
    }

    return Component
  }

  function renderSerialisedProps (componentId, serialisedProps) {
    return (
      <script
        data-hydration-id={componentId}
        type='application/hydration-data'
        dangerouslySetInnerHTML={{ __html: serialisedProps }}
      />
    )
  }
}

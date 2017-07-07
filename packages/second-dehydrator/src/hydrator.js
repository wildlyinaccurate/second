export default function hydrate (createElement, render, componentMap) {
  Object.keys(componentMap).forEach(component => {
    const loadComponent = componentMap[component]
    const componentElements = [].slice.call(
      document.querySelectorAll(`[data-component-name="${component}"]`)
    )

    loadComponent().then(Component => {
      componentElements.forEach(el => hydrateComponent(Component, el))
    })
  })

  function hydrateComponent (Component, componentEl) {
    const componentDataId = componentEl.getAttribute('data-hydration-id')
    const dataEl = document.querySelector(
      `script[data-hydration-id="${componentDataId}"]`
    )
    const props = JSON.parse(dataEl.innerHTML)

    render(createElement(Component, props), componentEl)
  }
}

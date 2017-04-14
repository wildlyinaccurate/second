export function fetch (params) {
  return {
    meta: {
      responseCode: 200
    },
    body: {
      items: [
        fake(),
        fake(),
        fake(),
        fake(),
        fake()
      ]
    }
  }
}

function fake () {
  return {
    title: 'Fake!'
  }
}

import Promise from 'bluebird'
import { filter, mapValues } from 'lodash/fp'

export default class Fetcher {
  constructor () {
    this.requests = {}
  }

  hasOutstandingRequests () {
    return this.outstandingRequests().length > 0
  }

  outstandingRequests () {
    return filter(req => !req.isFulfilled(), this.requests)
  }

  // Called by clients; queues requests for fetching or returns responses if
  // the request has already been fulfilled
  request (requests) {
    return mapValues((params, name) => {
      const key = params

      if (!this.requests.hasOwnProperty(key)) {
        this.requests[key] = this.fetch(params)
      }

      const request = this.requests[key]

      if (request.isFulfilled()) {
        return request.value()
      }

      return {}

    }, requests)
  }

  // Make an external call to fetch data
  fetch (params) {
    return Promise.delay(200).then(() => Promise.resolve({
      meta: {
        responseCode: 200
      },
      body: {
        items: [
          fake(1),
          fake(2),
          fake(3),
          fake(4),
          fake(5),
          fake(6),
          fake(7),
          fake(8),
          fake(9),
          fake(10),
          fake(11),
          fake(12),
          fake(13)
        ]
      }
    }))
  }
}

function fake (n) {
  return {
    title: `Fake ${n}`
  }
}

import Promise from 'bluebird'
import fp, { clone, filter, propOr } from 'lodash/fp'
import request from 'request-promise'
import debug from 'debug'

const mapValuesWithKey = fp.mapValues.convert({ cap: false })

const REFETCH_DELAY = 100
const log = debug('second:fetcher')

export default class Fetcher {
  constructor ({ handlers = [], request = this._makeRequest } = {}) {
    this.requests = {}
    this.unreadResponses = false
    this.handlers = handlers
    this.makeRequest = request
  }

  getUrlFor (_params) {
    const params = clone(_params)

    for (const handler of this.handlers) {
      log(`Checking ${handler.name}`)
      const returnVal = handler(params)

      if (returnVal) {
        log(`Using ${handler.name}`)

        return returnVal
      }
    }

    throw new Error(`No handler could be found for data parameters ${JSON.stringify(params)}`)
  }

  hasOutstandingRequests () {
    return this.outstandingRequests().length > 0
  }

  outstandingRequests () {
    return filter(req => req.promise.isPending() || !req.read, this.requests)
  }

  hasPendingMandatoryRequests () {
    return this.pendingMandatoryRequests().length > 0
  }

  pendingMandatoryRequests () {
    return filter(req => req.mustSucceed && req.promise.isPending(), this.requests)
  }

  // Called by clients; queues requests for fetching or returns responses if
  // the request has already been fulfilled
  request (requests) {
    return mapValuesWithKey((params, name) => {
      const key = JSON.stringify(params)

      if (!this.requests.hasOwnProperty(key)) {
        log(`Making request for ${name}`)

        const mustSucceed = propOr(true, 'mustSucceed', params)

        this.requests[key] = {
          promise: this.fetch(params, mustSucceed),
          read: false,
          mustSucceed
        }

        this.requests[key].promise.catch(error => {
          this.requests[key].read = true

          throw error
        })
      }

      const request = this.requests[key]

      if (request.promise.isFulfilled()) {
        log(`Returning fulfilled request for ${name}`)

        request.read = true

        return request.promise.value()
      }

      return request.promise
    }, requests)
  }

  _makeRequest (url) {
    return request({
      url,
      json: true,
      resolveWithFullResponse: true,
      simple: false,
      timeout: 5000,
      headers: {
        'User-Agent': 'second-fetcher'
      }
    })
  }

  // Make an external call to fetch data
  fetch (params, mustSucceed = true) {
    const url = typeof params.uri === 'string' ? params.uri : this.getUrlFor(params.uri)

    return this.makeRequest(url).then(({ body, statusCode }) => {
      log(`[${statusCode}] ${url}`)

      if (statusCode === 200) {
        return {
          body,
          meta: { statusCode }
        }
      } else if (statusCode === 202 && mustSucceed) {
        log(`Re-fetching in ${REFETCH_DELAY}ms`)

        return Promise.delay(REFETCH_DELAY).then(() => this.fetch(params))
      } else if (mustSucceed) {
        throw new Error(`[${statusCode}] Upstream request failed ${url} / ${body}`)
      }

      return {
        body,
        meta: { statusCode }
      }
    })
  }
}

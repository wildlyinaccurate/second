import Promise from 'bluebird'
import fp, { clone, filter } from 'lodash/fp'
import HttpClient from 'bbc-http-client'
import debug from 'debug'

const mapValuesWithKey = fp.mapValues.convert({ cap: false })

const REFETCH_DELAY = 100
const client = new HttpClient({ timeout: 10000 })
const log = debug('second:fetcher')

export default class Fetcher {
  constructor ({ handlers = [] }) {
    this.requests = {}
    this.unreadResponses = false
    this.handlers = handlers
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
    return this.unreadResponses || this.outstandingRequests().length > 0
  }

  outstandingRequests () {
    return filter(req => req.isPending(), this.requests)
  }

  // Called by clients; queues requests for fetching or returns responses if
  // the request has already been fulfilled
  request (requests) {
    this.unreadResponses = false

    return mapValuesWithKey((params, name) => {
      const key = JSON.stringify(params)

      if (!this.requests.hasOwnProperty(key)) {
        log(`Making request for ${name}`)
        this.requests[key] = this.fetch(params)
      }

      const request = this.requests[key]

      if (request.isFulfilled()) {
        log(`Returning fulfilled request for ${name}`)
        return request.value()
      }

      return {}
    }, requests)
  }

  // Make an external call to fetch data
  fetch (params) {
    const url = typeof params === 'string' ? params : this.getUrlFor(params)

    return new Promise((resolve, reject) => {
      client.get({ url, json: true }, (err, resp, body) => {
        if (err) {
          reject(err)
        } else if (resp.statusCode === 200) {
          log(`[200] ${url}`)

          this.unreadResponses = true

          resolve({
            body,
            meta: {
              statusCode: resp.statusCode
            }
          })
        } else if (resp.statusCode === 202) {
          log(`[202] re-fetching in ${REFETCH_DELAY}ms ${url}`)
          resolve(
            Promise.delay(REFETCH_DELAY).then(() => this.fetch(params))
          )
        } else {
          this.unreadResponses = false

          reject(new Error(`[${resp.statusCode}] Upstream request failed ${url}`))
        }
      })
    })
  }
}

import Promise from 'bluebird'
import { clone, filter, join, map, mapValues, toPairs } from 'lodash/fp'
import HttpClient from 'bbc-http-client'

const REFETCH_DELAY = 100
const client = new HttpClient({ timeout: 10000 })
const paramsToUriString = params => map(join('/'), toPairs(params))

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
    const url = this.makeMorphUrl(clone(params.uri))

    return new Promise((resolve, reject) => {
      client.get({ url, json: true }, (err, resp, body) => {
        if (resp.statusCode === 200) {
          resolve({
            body,
            meta: {
              statusCode: resp.statusCode
            }
          })
        } else if (resp.statusCode === 202) {
          resolve(
            Promise.delay(REFETCH_DELAY).then(() => this.fetch(params))
          )
        } else {
          reject(err)
        }
      })
    })
  }

  makeMorphUrl (params) {
    const template = params.data

    delete params.data

    const encodedParams = mapValues(encodeURIComponent, params)
    const uriParams = paramsToUriString(encodedParams).join('/')

    return `https://morph.api.bbci.co.uk/data/${template}/${uriParams}`
  }
}

import Promise from 'bluebird'
import fp, { clone, filter, join, map, toPairs } from 'lodash/fp'
import HttpClient from 'bbc-http-client'
import debug from 'debug'

const mapValuesWithKey = fp.mapValues.convert({ cap: false })

const REFETCH_DELAY = 100
const client = new HttpClient({ timeout: 10000 })
const paramsToUriString = params => map(join('/'), toPairs(params))
const log = debug('second:fetcher')

export default class Fetcher {
  constructor () {
    this.requests = {}
    this.unreadResponses = false
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
        log('Making request for', name)
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

          reject(new Error(`Upstream request failed with HTTP code ${resp.statusCode}`))
        }
      })
    })
  }

  makeMorphUrl (params) {
    const template = params.data

    delete params.data

    const encodedParams = mapValuesWithKey(encodeURIComponent, params)
    const uriParams = paramsToUriString(encodedParams).join('/')

    return `https://morph.api.bbci.co.uk/data/${template}/${uriParams}`
  }
}

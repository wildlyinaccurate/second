import fp, { join, map, toPairs } from 'lodash/fp'

const mapValuesWithKey = fp.mapValues.convert({ cap: false })
const paramsToUriString = params => map(join('/'), toPairs(params))

export default function morphDataObjectToUrl (params) {
  if (params) {
    const template = params.data

    delete params.data

    const encodedParams = mapValuesWithKey(encodeURIComponent, params)
    const uriParams = paramsToUriString(encodedParams).join('/')

    return `https://morph.api.bbci.co.uk/data/${template}/${uriParams}`
  }
}

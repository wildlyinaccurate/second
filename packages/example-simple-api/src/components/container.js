import { Component, h } from 'preact'
import containerFactory from 'second-container'
import fetcher from '../global-fetcher'

export default containerFactory({
  Component,
  createElement: h,
  fetcher
})

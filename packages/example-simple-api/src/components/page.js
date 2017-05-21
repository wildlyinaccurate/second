import { h } from 'preact'
import EventList from './event-list'

export default function Page ({ user }) {
  return h('div', {}, [
    h('h1', {}, `Events for ${user}`),
    h(EventList, { user })
  ])
}

Page.displayName = 'EventPage'

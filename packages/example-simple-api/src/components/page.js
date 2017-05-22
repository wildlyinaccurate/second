import { h } from 'preact'
import EventList from './event-list'

export default function Page ({ user }) {
  return (
    <div>
      <h1>Events for {user}</h1>
      <EventList user={user} />
    </div>
  )
}

Page.displayName = 'EventPage'

import { h } from 'preact'
import second from 'second'
import Repository from './repository'

function EventList (props) {
  const events = props.events.body.filter(ev => ev.type === 'WatchEvent')

  return (
    <ul>
      {events.map(ev =>
        <li>
          {ev.payload.action} watching <Repository name={ev.repo.name} />
        </li>
      )}
    </ul>
  )
}

EventList.displayName = 'EventList'

export default second.createContainer(EventList, {
  data: (props) => ({
    events: {
      uri: `https://api.github.com/users/${props.user}/events/public?access_token=6d3d807fdbc57453b631809754a2d85c3ecec7ff`
    }
  })
})

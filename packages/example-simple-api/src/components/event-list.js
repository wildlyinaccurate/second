import { h } from 'preact'
import second from 'second'
import Repository from './repository'

const RepositoryWithData = second.createContainer(Repository, {
  data: props => ({
    repo: {
      uri: `https://api.github.com/repos/${props.name}`
    }
  })
})

function EventList (props) {
  const events = props.events.filter(ev => ev.type === 'WatchEvent')

  return (
    <ul>
      {events.map(ev =>
        <li>
          {ev.payload.action} watching <RepositoryWithData name={ev.repo.name} />
        </li>
      )}
    </ul>
  )
}

EventList.displayName = 'EventList'

export default second.createContainer(EventList, {
  data: props => ({
    events: {
      uri: `https://api.github.com/users/${props.user}/events/public`
    }
  })
})

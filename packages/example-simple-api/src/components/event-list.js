import { h } from 'preact'
import createContainer from './container'

function EventList (props) {
  const events = props.events.body

  return h('ul', {}, events.filter(ev => ev.type === 'WatchEvent').map(ev =>
    h('li', {}, [
      `${ev.actor.display_login} ${ev.payload.action} watching `,
      h('a', { href: `https://github.com/${ev.repo.name}` }, ev.repo.name)
    ])
  ))
}

EventList.displayName = 'EventList'

export default createContainer(EventList, {
  data: (props) => ({
    events: `https://api.github.com/users/${props.user}/events`
  })
})

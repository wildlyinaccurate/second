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
    events: {
      uri: `https://api.github.com/users/${props.user}/events?access_token=6d3d807fdbc57453b631809754a2d85c3ecec7ff`
    }
  })
})

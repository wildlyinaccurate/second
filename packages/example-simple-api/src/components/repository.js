import { h, Component } from 'preact'
import dehydrate from 'second-dehydrator'

class Repository extends Component {
  render (props, state) {
    const repo = props.repo.body
    const peekaboo = () => this.setState({ message: 'Peekaboo!' })
    const shh = () => this.setState({ message: null })

    return (
      <a href={repo.html_url} onmouseover={peekaboo} onmouseout={shh}>
        {repo.full_name} ({repo.stargazers_count} ⭐) {state.message}
      </a>
    )
  }
}

Repository.displayName = 'Repository'

export default dehydrate(h)(Repository)

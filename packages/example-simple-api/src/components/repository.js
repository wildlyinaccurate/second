import { h } from 'preact'
import second from 'second'

function Repository (props) {
  const repo = props.repo.body

  return (
    <a href={repo.html_url}>
      {repo.full_name} ({repo.stargazers_count} ⭐)
    </a>
  )
}

Repository.displayName = 'Repository'

export default second.createContainer(Repository, {
  data: (props) => ({
    repo: {
      uri: `https://api.github.com/repos/${props.name}`
    }
  })
})

import { h } from 'preact'
import createContainer from './container'

function Repository (props) {
  const repo = props.repo.body

  return (
    <a href={repo.html_url}>
      {repo.full_name} ({repo.stargazers_count} ⭐)
    </a>
  )
}

Repository.displayName = 'Repository'

export default createContainer(Repository, {
  data: (props) => ({
    repo: {
      uri: `https://api.github.com/repos/${props.name}?access_token=6d3d807fdbc57453b631809754a2d85c3ecec7ff`
    }
  })
})

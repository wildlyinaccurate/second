import hydrate from './src/hydrator'

hydrate({
  Repository: () => import(/* webpackMode: "eager" */ './src/components/repository')
})

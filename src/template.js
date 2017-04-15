import fs from 'fs'

export default function template (path, options, done) {
  fs.readFile(path, 'utf-8', (err, template) => {
    if (err) {
      return done(err)
    }

    const replaceValue = (acc, key) => acc.replace(`{{${key}}}`, options[key])
    const rendered = Object.keys(options).reduce(replaceValue, template)

    return done(null, rendered)
  })
}

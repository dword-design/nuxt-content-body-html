import { mapKeys } from 'lodash-es'

const revertCompilerChanges = element => {
  const result = {
    ...mapKeys(element, (value, key) => {
      switch (key) {
        case 'tag':
          return 'tagName'
        case 'props':
          return 'properties'
        default:
          return key
      }
    }),
    ...(element.children && {
      children: element.children.map(child => revertCompilerChanges(child)),
    }),
  }
  if (result.tagName === 'nuxt-link') {
    // Only needed for Nuxt 2
    result.tagName = 'a'
    result.properties.href = result.properties.to
    delete result.properties.to
  } else if (result.tagName === 'code-inline') {
    result.tagName = 'code'
  }

  return result
}

export default revertCompilerChanges

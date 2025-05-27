import { mapKeys } from 'lodash-es';

const revertCompilerChanges = element => {
  const result = {
    ...mapKeys(element, (value, key) => {
      switch (key) {
        case 'tag': {
          return 'tagName';
        }

        case 'props': {
          return 'properties';
        }

        default: {
          return key;
        }
      }
    }),
    ...(element.children && {
      children: element.children.map(child => revertCompilerChanges(child)),
    }),
  };

  switch (result.tagName) {
    case 'nuxt-link': {
      // Only needed for Nuxt 2
      result.tagName = 'a';
      result.properties.href = result.properties.to;
      delete result.properties.to;
      break;
    }

    case 'code-inline': {
      result.tagName = 'code';
      break;
    }

    case 'code': {
      if (result.children[0]?.tagName === 'pre') {
        return result.children[0];
      }

      break;
    }
    // No default
  }

  return result;
};

export default revertCompilerChanges;

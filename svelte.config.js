import preprocess from 'svelte-preprocess'
import importAssets from 'svelte-preprocess-import-assets'

import adapterStatic from '@sveltejs/adapter-static'

function adapter(options) {
  const baseStatic = adapterStatic(options)
  const pages = options?.pages || 'build'
  return {
    name: 'svelte-adapter-static',
    async adapt(builder) {
      await baseStatic.adapt(builder)
      builder.copy(`${pages}/404/index.html`, `${pages}/404.html`)
      builder.rimraf(`${pages}/404`)
    },
  }
}

const pathsBase =
  process.env.PATHS_BASE === undefined ? '' : process.env.PATHS_BASE

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte'],

  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: [preprocess(), importAssets()],

  kit: {
    adapter: adapter(),
    paths: {
      base: pathsBase,
    },
    prerender: {
      crawl: true,
      enabled: true,
    },
  },
}

export default config

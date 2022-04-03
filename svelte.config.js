import preprocess from 'svelte-preprocess'
import importAssets from 'svelte-preprocess-import-assets'

import adapterStatic from '@sveltejs/adapter-static'
import adapterAuto from '@sveltejs/adapter-auto'

function _adapter(options) {
  const baseStatic = adapterStatic(options)
  const pages = options?.pages || 'build'
  return {
    name: 'svelte-adapter-static',
    async adapt(builder) {
      await baseStatic.adapt(builder)
    },
  }
}

const pathsBase =
  process.env.PATHS_BASE === undefined ? '' : process.env.PATHS_BASE

const adapter =
  process.env.CLOUDFLARE === undefined ? _adapter : adapterAuto

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

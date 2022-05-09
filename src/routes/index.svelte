<script context="module">
  import DarkModeToggle from "$lib/components/DarkModeToggle.svelte";
</script>

<script>
  export let humanDate;
</script>

<svelte:head>
  <title>Dheepak Krishnamurthy - Website</title>
  <link rel="canonical" href="https://kdheepak.com/" />
  <meta property="og:url" content="https://kdheepak.com/" />
  <meta name="description" content="My thoughts and notes" />
  <meta name="robots" content="index, follow" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://kdheepak.com" />
  <meta property="og:title" content="Dheepak Krishnamurthy - Website" />
  <meta property="og:description" content="My thoughts and notes" />
  <meta property="og:site_name" content="kdheepak.com" />
  <meta name="twitter:title" content="Dheepak Krishnamurthy - Website" />
  <meta name="twitter:description" content="My thoughts and notes" />
  <meta name="author" content="Dheepak Krishnamurthy" />
  <link
    rel="alternate"
    type="application/rss+xml"
    title="RSS"
    href="https://blog.kdheepak.com/rss.xml"
  />
</svelte:head>

<article>
  <header>
    <h1 class="title">
      <a href="https://kdheepak.com">~</a> /
    </h1>
    <div class="flex space-between main-subtitle">
      <div class="subtitle sourceurl">
        <a target="_blank" href="https://github.com/kdheepak/kdheepak.github.io">
          {humanDate}
        </a>
        <DarkModeToggle />
      </div>
    </div>
  </header>
  <section>
  <h2 id="about-me">About me</h2>
  <p>
    I’m a <a href="https://www.nrel.gov/research/staff/dheepak-krishnamurthy.html">research engineer and software developer at the National Renewable Energy Laboratory
    (NREL, Golden, CO, USA)</a>. I have experience running power system models and simulations,
    such as transmission production cost models and power distribution system analyses, and have
    written and maintained bespoke models for energy system analysis. I’m highly proficient with
    Python, Julia, Rust, and Javascript, and am well versed in scientific data analysis and extract
    transform load workflows. I also enjoy working on open source projects and learning new
    technologies.
  </p>
  <p>You can find my contact information on <a href="https://github.com/kdheepak">GitHub</a>.</p>
  </section>
  <section>
  <h2 id="blog">Blog</h2>
  <p><a href="https://blog.kdheepak.com" class="uri">https://blog.kdheepak.com</a></p>
  </section>
  <section>
  <h2 id="talks-and-tutorials">Talks and Tutorials</h2>
  <p><a href="https://www.youtube.com/watch?v=-TASx67pphw">Terminal User Interfaces in Julia</a></p>
  <p>
    <a href="https://www.youtube.com/watch?v=kQNOG4tGJdg"
      >Crash Course in Energy Systems Modeling &amp; Analysis with Julia</a
    >
  </p>
  <p>
    <a href="https://www.youtube.com/watch?v=ez-KVi0leOw"
      >Why writing C interfaces in Julia is so easy</a
    >
  </p>
  <p>
    <a href="https://www.youtube.com/watch?v=1TipY6g9IzE"
      >Open Source Power System Production Cost Modeling in Julia</a
    >
  </p>
  <p>
    <a href="https://github.com/kdheepak/Python-Tutorial" class="uri"
      >https://github.com/kdheepak/Python-Tutorial</a
    >
  </p>
  <p>
    <a href="https://github.com/GMLC-TDC/pesgm-2019-helics-tutorial" class="uri"
      >https://github.com/GMLC-TDC/pesgm-2019-helics-tutorial</a
    >
  </p>
  <p>
    <a href="https://github.com/kdheepak/openmod-2019-helics-tutorial" class="uri"
      >https://github.com/kdheepak/openmod-2019-helics-tutorial</a
    >
  </p>
  <p><a href="https://kdheepak.com/think-git/" class="uri">https://kdheepak.com/think-git/</a></p>
  <p>
    <a href="https://kdheepak.com/interactive-data-visualizations-with-bokeh/" class="uri"
      >https://kdheepak.com/interactive-data-visualizations-with-bokeh/</a
    >
  </p>
  <h2 id="projects">Open Source Projects</h2>
  <p><a href="https://github.com/kdheepak/taskwarrior-tui">taskwarror-tui</a>: A terminal user interface for taskwarrior written in Rust.</p>
  <p><a href="https://github.com/GMLC-TDC/HELICS">HELICS</a>: A co-simulation framework as a C/C++ library.</p>
  <p><a href="https://github.com/GMLC-TDC/pyhelics">pyhelics</a>: A CFFI interface to HELICS written in Python, with a SvelteKit + Flask server based user interface for better UX.</p>
  <p><a href="https://github.com/dss-extensions/OpenDSSDirect.py">OpenDSSDirect.py</a>: A CFFI interface to OpenDSS, a distribution system solver in Delphi/Pascal.</p>
  <p>
    <a href="https://github.com/kdheepak/TerminalUserInterfaces.jl">TerminalUserInterfaces.jl</a>: A terminal user interface library written in Julia.
  </p>
  <p>
    <a href="https://github.com/kdheepak/lazygit.nvim">lazygit.nvim</a>: A Lua based neovim plugin for interfacing with lazygit.
  </p>
  </section>

</article>

<style>
  .flex {
    display: flex;
  }
</style>

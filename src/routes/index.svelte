<script>
  import DarkModeToggle from "$lib/components/DarkModeToggle.svelte"
  export let humanDate = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short' })
</script>

<svelte:head>
  <title>Dheepak Krishnamurthy - Website</title>
  <link rel="canonical" href="https://kdheepak.com/" />
  <meta property="og:url" content="https://kdheepak.com/" />
  <meta name="description" content="My thoughts and notes" />
  <meta name="robots" content="index, follow">
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://kdheepak.com" />
  <meta property="og:title" content="Dheepak Krishnamurthy - Website" />
  <meta property="og:description" content="My thoughts and notes" />
  <meta property="og:site_name" content="kdheepak.com" />
  <meta name="twitter:title" content="Dheepak Krishnamurthy - Website" />
  <meta name="twitter:description" content="My thoughts and notes" />
  <meta name="author" content="Dheepak Krishnamurthy">
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
        <DarkModeToggle/>
      </div>
    </div>
  </header>
  <section id="blog" class="level2">
    <h2>Blog</h2>
    <p><a href="https://blog.kdheepak.com" class="uri">https://blog.kdheepak.com</a></p>
  </section>
  <section id="talks-and-tutorials" class="level2">
    <h2>Talks and Tutorials</h2>
    <p><a href="https://www.youtube.com/watch?v=-TASx67pphw">Terminal User Interfaces in Julia</a></p>
    <p><a href="https://www.youtube.com/watch?v=kQNOG4tGJdg">Crash Course in Energy Systems Modeling &amp; Analysis with Julia</a></p>
    <p><a href="https://www.youtube.com/watch?v=ez-KVi0leOw">Why writing C interfaces in Julia is so easy</a></p>
    <p><a href="https://www.youtube.com/watch?v=1TipY6g9IzE">Open Source Power System Production Cost Modeling in Julia</a></p>
    <p><a href="https://github.com/kdheepak/Python-Tutorial" class="uri">https://github.com/kdheepak/Python-Tutorial</a></p>
    <p><a href="https://github.com/GMLC-TDC/pesgm-2019-helics-tutorial" class="uri">https://github.com/GMLC-TDC/pesgm-2019-helics-tutorial</a></p>
    <p><a href="https://github.com/kdheepak/openmod-2019-helics-tutorial" class="uri">https://github.com/kdheepak/openmod-2019-helics-tutorial</a></p>
    <p><a href="https://kdheepak.com/think-git/" class="uri">https://kdheepak.com/think-git/</a></p>
    <p><a href="https://kdheepak.com/interactive-data-visualizations-with-bokeh/" class="uri">https://kdheepak.com/interactive-data-visualizations-with-bokeh/</a></p>
  </section>
  <section id="projects" class="level2">
    <h2>Projects</h2>
    <p><a href="https://github.com/GMLC-TDC/HELICS">HELICS</a></p>
    <p><a href="https://github.com/GMLC-TDC/HELICS.jl">HELICS.jl</a></p>
    <p><a href="https://github.com/GMLC-TDC/helics.nim">HELICS.nim</a></p>
    <p><a href="https://github.com/GMLC-TDC/helics-cli">helics-cli</a></p>
    <p><a href="https://github.com/dss-extensions">dss-extension</a></p>
    <p><a href="https://github.com/dss-extensions/OpenDSSDirect.py">OpenDSSDirect.py</a></p>
    <p><a href="https://github.com/dss-extensions/OpenDSSDirect.jl">OpenDSSDirect.jl</a></p>
    <p><a href="https://github.com/kdheepak/TerminalUserInterfaces.jl">TerminalUserInterfaces.jl</a></p>
    <p><a href="https://github.com/kdheepak/github-release">github-release</a></p>
  </section>
</article>

<style>
  .flex {
    display: flex;
  }
</style>

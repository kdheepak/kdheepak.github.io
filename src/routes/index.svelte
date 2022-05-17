<script context="module">
  import DarkModeToggle from "$lib/components/DarkModeToggle.svelte";

  import index from "$lib/posts/index.md";
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
    <svelte:component this={index} />
  </section>
</article>

<style>
  .flex {
    display: flex;
  }
</style>

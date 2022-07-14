<script context="module">
  import DarkModeToggle from "$lib/components/DarkModeToggle.svelte";
  import FaRegCalendarAlt from "svelte-icons/fa/FaRegCalendarAlt.svelte";

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
    <div class="flex">
      <h1 class="title">
        <a href="https://kdheepak.com">~</a> /
      </h1>
    </div>
    <div class="flex items-center main-subtitle">
      <div class="subtitle sourceurl">
        <div class="tag">
          <FaRegCalendarAlt />
        </div>
        <a target="_blank" href="https://github.com/kdheepak/kdheepak.github.io">
          {humanDate}
        </a>
        <DarkModeToggle />
      </div>
      <div class="flex items-center">
        <p>&nbsp;</p>
      </div>
    </div>

  </header>

  <section>
    <svelte:component this={index} />
  </section>
</article>

<style>
  .subtitle {
    margin-top: 1.4rem;
    margin-bottom: 1.4rem;
    padding-right: 0;
    vertical-align: baseline;
  }

  .flex {
    display: flex;
  }

  .items-center {
    align-items: center;
  }

  .tag {
    height: 1.25rem;
    width: 1.25rem;
    color: var(--text-color);
  }
</style>

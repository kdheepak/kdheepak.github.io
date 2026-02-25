const rssStylesheet = `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="5.0" encoding="UTF-8" indent="yes"/>
  <xsl:strip-space elements="*"/>

  <xsl:key name="itemsByYear" match="item" use="substring(pubDate, 13, 4)"/>
  <xsl:key
    name="itemsByYearMonth"
    match="item"
    use="concat(substring(pubDate, 13, 4), '-', substring(pubDate, 9, 3))"
  />

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml"/>
        <title><xsl:value-of select="rss/channel/title"/> | RSS Feed</title>
        <style>
          @font-face {
            font-family: "Google Sans Code";
            src: url("/_astro/fonts/616354e20c7baae2.woff2") format("woff2");
            font-display: swap;
            font-style: normal;
            font-weight: 300 700;
          }

          @font-face {
            font-family: "Google Sans Code";
            src: url("/_astro/fonts/9617ee3bc3ad47fd.woff2") format("woff2");
            font-display: swap;
            font-style: italic;
            font-weight: 300 700;
          }

          :root {
            --background: #fdfdfd;
            --foreground: #282728;
            --accent: #006cac;
            --muted: #666666;
            --border: #ece9e9;
          }

          html[data-theme="dark"] {
            --background: #212737;
            --foreground: #eaedf3;
            --accent: #ff6b01;
            --muted: #343f60;
            --border: #ab4b08;
          }

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            background: var(--background);
            color: var(--foreground);
            font-family: "Google Sans Code", "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
            line-height: 1.5;
          }

          .app-layout {
            width: 100%;
            max-width: 48rem;
            margin: 0 auto;
            padding-inline: 1rem;
          }

          #top-nav-wrap {
            position: relative;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            border-bottom: 1px solid var(--border);
            padding: 1rem 0;
            background: var(--background);
          }

          .site-title {
            position: relative;
            z-index: 1;
            padding: 0.25rem 0;
            color: var(--foreground);
            font-size: 1.25rem;
            line-height: 2rem;
            font-weight: 600;
            white-space: nowrap;
            text-decoration: none;
          }

          #nav-menu {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
          }

          #menu-items {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin: 0;
            padding: 0;
            list-style: none;
          }

          .nav-link {
            position: relative;
            padding: 0.25rem;
            color: color-mix(in srgb, var(--foreground) 80%, transparent);
            font-size: 0.875rem;
            font-weight: 600;
            letter-spacing: 0.025em;
            text-decoration: none;
            transition: color 0.15s ease;
          }

          .nav-link:hover {
            color: var(--accent);
          }

          .nav-link.active {
            color: var(--accent);
          }

          .nav-link.active::after {
            content: "";
            position: absolute;
            right: 0;
            bottom: -0.15rem;
            left: 0;
            height: 0.125rem;
            border-radius: 999px;
            background: var(--accent);
          }

          .header-actions {
            z-index: 1;
            margin-left: auto;
            display: flex;
            align-items: center;
            gap: 0.25rem;
          }

          .icon-link,
          .icon-button {
            display: inline-flex;
            width: 3rem;
            height: 3rem;
            align-items: center;
            justify-content: center;
            color: color-mix(in srgb, var(--foreground) 80%, transparent);
            text-decoration: none;
            background: transparent;
            border: 0;
            padding: 0;
            transition: color 0.15s ease;
            cursor: pointer;
          }

          .icon-link:hover,
          .icon-button:hover {
            color: var(--accent);
          }

          .icon-link svg,
          .icon-button svg {
            width: 1.25rem;
            height: 1.25rem;
            fill: none;
            stroke: currentColor;
            stroke-width: 2;
          }

          .icon-button .sun {
            display: none;
          }

          html[data-theme="dark"] .icon-button .moon {
            display: none;
          }

          html[data-theme="dark"] .icon-button .sun {
            display: block;
          }

          main {
            padding-top: 2rem;
            padding-bottom: 1rem;
          }

          .page-heading {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .back-icon {
            color: color-mix(in srgb, var(--foreground) 90%, transparent);
            font-size: 2rem;
            line-height: 1;
            text-decoration: none;
          }

          h1 {
            margin: 0;
            font-size: 1.5rem;
            line-height: 2rem;
            font-weight: 600;
          }

          .timeline-root {
            margin-top: 1.5rem;
          }

          .year-group {
            margin-top: 1.4rem;
          }

          .year-header {
            display: flex;
            align-items: baseline;
            gap: 0.35rem;
          }

          .year {
            font-size: 1.5rem;
            font-weight: 700;
          }

          .year-count,
          .month-count {
            margin-left: 0.2rem;
            font-size: 0.75rem;
            color: var(--muted);
          }

          .month-row {
            display: flex;
            flex-direction: column;
          }

          .timeline-year-marker,
          .timeline-month-marker {
            display: none;
          }

          .month-heading {
            margin-top: 1.5rem;
            font-size: 1.125rem;
            line-height: 1.75rem;
          }

          .month-name {
            font-weight: 700;
          }

          .post-list {
            margin: 0;
            padding: 0;
            list-style: none;
          }

          .post-item {
            margin: 1.5rem 0;
          }

          .post-title {
            display: inline-block;
            color: var(--accent);
            font-size: 1.125rem;
            font-weight: 500;
            line-height: 1.25;
            text-decoration: none;
            text-underline-offset: 0.25rem;
          }

          .post-title:hover {
            text-decoration: underline;
            text-decoration-style: dashed;
          }

          .post-desc {
            margin: 0.25rem 0 0;
          }

          .empty {
            margin-top: 1rem;
            color: var(--muted);
            font-style: italic;
          }

          @media (min-width: 640px) {
            #top-nav-wrap {
              gap: 0.5rem;
              padding: 1.5rem 0;
            }

            .site-title {
              font-size: 1.5rem;
              line-height: 1;
            }

            #menu-items {
              gap: 0.75rem;
            }

            .nav-link {
              font-size: 1rem;
            }

            .header-actions {
              gap: 0.5rem;
            }

            .icon-link,
            .icon-button {
              width: 2rem;
              height: 2rem;
            }

            h1 {
              font-size: 1.875rem;
              line-height: 2.25rem;
            }

            .year-group {
              --timeline-label-col: 7.25rem;
              --timeline-marker-col: 1.35rem;
              --timeline-gap: 0.55rem;
              --timeline-line-top: 2.15rem;
              --timeline-line-bottom: 0.6rem;
              --timeline-month-dot-top: 1.95rem;
              position: relative;
            }

            .year-group::after {
              content: "";
              position: absolute;
              left: calc(
                var(--timeline-label-col) + var(--timeline-gap) +
                  (var(--timeline-marker-col) / 2)
              );
              top: var(--timeline-line-top);
              bottom: var(--timeline-line-bottom);
              transform: translateX(-50%);
              border-left: 2px dashed var(--border);
              pointer-events: none;
            }

            .year-header {
              display: grid;
              grid-template-columns: var(--timeline-label-col) var(--timeline-marker-col);
              align-items: center;
              column-gap: var(--timeline-gap);
            }

            .timeline-year-marker {
              display: block;
              z-index: 1;
              justify-self: center;
              width: 1.25rem;
              height: 1.25rem;
              border: 0.24rem solid var(--accent);
              border-radius: 999px;
              background: var(--background);
            }

            .month-row {
              display: grid;
              grid-template-columns: var(--timeline-label-col) var(--timeline-marker-col) minmax(
                  0,
                  1fr
                );
              align-items: start;
              column-gap: var(--timeline-gap);
            }

            .month-heading {
              margin: 1.5rem 0;
            }

            .timeline-month-marker {
              display: block;
              z-index: 1;
              justify-self: center;
              width: 0.55rem;
              height: 0.55rem;
              border-radius: 999px;
              background: var(--foreground);
              opacity: 0.72;
              margin-top: var(--timeline-month-dot-top);
            }
          }
        </style>
      </head>
      <body>
        <header class="app-layout">
          <div id="top-nav-wrap">
            <a class="site-title" href="/">kd</a>
            <nav id="nav-menu">
              <ul id="menu-items">
                <li><a class="nav-link active" href="/blog/">/blog</a></li>
                <li><a class="nav-link" href="/cv/">/cv</a></li>
                <li><a class="nav-link" href="/tags/">/tags</a></li>
              </ul>
            </nav>
            <div class="header-actions">
              <a class="icon-link" href="/search/" title="Search" aria-label="search">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0-14 0m18 11l-6-6"/>
                </svg>
              </a>
              <button class="icon-button" id="theme-btn" type="button" title="Toggles light &amp; dark" aria-label="auto">
                <svg class="moon" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 3h.393a7.5 7.5 0 0 0 7.92 12.446A9 9 0 1 1 12 2.992z"/>
                </svg>
                <svg class="sun" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.828 14.828a4 4 0 1 0-5.656-5.656a4 4 0 0 0 5.656 5.656m-8.485 2.829l-1.414 1.414M6.343 6.343L4.929 4.929m12.728 1.414l1.414-1.414m-1.414 12.728l1.414 1.414M4 12H2m10-8V2m8 10h2m-10 8v2"/>
                </svg>
              </button>
            </div>
          </div>
        </header>

        <main class="app-layout">
          <div class="page-heading">
            <a class="back-icon" href="/">
              <xsl:text>&#8249;</xsl:text>
            </a>
            <h1>Blog</h1>
          </div>

          <div class="timeline-root">
            <xsl:choose>
              <xsl:when test="count(rss/channel/item) &gt; 0">
                <xsl:for-each
                  select="rss/channel/item[generate-id() = generate-id(key('itemsByYear', substring(pubDate, 13, 4))[1])]"
                >
                  <xsl:sort select="number(substring(pubDate, 13, 4))" data-type="number" order="descending"/>
                  <xsl:variable name="year" select="substring(pubDate, 13, 4)"/>

                  <section class="year-group">
                    <div class="year-header">
                      <span class="year"><xsl:value-of select="$year"/></span>
                      <span class="timeline-year-marker"></span>
                    </div>

                    <xsl:for-each
                      select="key('itemsByYear', $year)[generate-id() = generate-id(key('itemsByYearMonth', concat($year, '-', substring(pubDate, 9, 3)))[1])]"
                    >
                      <xsl:sort
                        select="(string-length(substring-before('JanFebMarAprMayJunJulAugSepOctNovDec', substring(pubDate, 9, 3))) div 3) + 1"
                        data-type="number"
                        order="descending"
                      />
                      <xsl:variable name="monthAbbr" select="substring(pubDate, 9, 3)"/>
                      <xsl:variable name="monthKey" select="concat($year, '-', $monthAbbr)"/>

                      <div class="month-row">
                        <div class="month-heading">
                          <span class="month-name">
                            <xsl:choose>
                              <xsl:when test="$monthAbbr = 'Jan'">January</xsl:when>
                              <xsl:when test="$monthAbbr = 'Feb'">February</xsl:when>
                              <xsl:when test="$monthAbbr = 'Mar'">March</xsl:when>
                              <xsl:when test="$monthAbbr = 'Apr'">April</xsl:when>
                              <xsl:when test="$monthAbbr = 'May'">May</xsl:when>
                              <xsl:when test="$monthAbbr = 'Jun'">June</xsl:when>
                              <xsl:when test="$monthAbbr = 'Jul'">July</xsl:when>
                              <xsl:when test="$monthAbbr = 'Aug'">August</xsl:when>
                              <xsl:when test="$monthAbbr = 'Sep'">September</xsl:when>
                              <xsl:when test="$monthAbbr = 'Oct'">October</xsl:when>
                              <xsl:when test="$monthAbbr = 'Nov'">November</xsl:when>
                              <xsl:otherwise>December</xsl:otherwise>
                            </xsl:choose>
                          </span>
                        </div>
                        <span class="timeline-month-marker"></span>

                        <ul class="post-list">
                          <xsl:for-each select="key('itemsByYearMonth', $monthKey)">
                            <xsl:sort
                              select="number(substring(pubDate, 13, 4)) * 10000 + (((string-length(substring-before('JanFebMarAprMayJunJulAugSepOctNovDec', substring(pubDate, 9, 3))) div 3) + 1) * 100) + number(substring(pubDate, 6, 2))"
                              data-type="number"
                              order="descending"
                            />
                            <li class="post-item">
                              <a class="post-title" href="{link}">
                                <xsl:value-of select="title"/>
                              </a>
                              <xsl:if test="string-length(normalize-space(description)) &gt; 0">
                                <p class="post-desc"><xsl:value-of select="description"/></p>
                              </xsl:if>
                            </li>
                          </xsl:for-each>
                        </ul>
                      </div>
                    </xsl:for-each>
                  </section>
                </xsl:for-each>
              </xsl:when>
              <xsl:otherwise>
                <p class="empty">No posts available in this feed.</p>
              </xsl:otherwise>
            </xsl:choose>
          </div>
        </main>
        <script>
          (function () {
            const themeStorageKey = "theme";
            const root = document.documentElement;
            const themeButton = document.getElementById("theme-btn");

            const getPreferredTheme = () => {
              const savedTheme = localStorage.getItem(themeStorageKey);
              if (savedTheme === "light" || savedTheme === "dark") {
                return savedTheme;
              }
              return window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light";
            };

            let currentTheme = getPreferredTheme();

            const applyTheme = () => {
              root.setAttribute("data-theme", currentTheme);
              if (themeButton) {
                themeButton.setAttribute("aria-label", currentTheme);
              }
            };

            applyTheme();

            if (themeButton) {
              themeButton.addEventListener("click", function () {
                currentTheme = currentTheme === "light" ? "dark" : "light";
                localStorage.setItem(themeStorageKey, currentTheme);
                applyTheme();
              });
            }
          })();
        </script>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
`;

export function GET() {
  return new Response(rssStylesheet, {
    headers: {
      "Content-Type": "text/xsl; charset=utf-8",
    },
  });
}

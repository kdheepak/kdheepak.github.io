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
          :root {
            --background: #fdfdfd;
            --foreground: #282728;
            --accent: #006cac;
            --muted: #666666;
            --border: #ece9e9;
          }

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            background: var(--background);
            color: var(--foreground);
            font-family: "Google Sans Code", "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
            line-height: 1.6;
          }

          main {
            width: 100%;
            max-width: 48rem;
            margin: 0 auto;
            padding: 1.25rem 1rem 2rem;
          }

          h1 {
            margin: 0;
            font-size: 1.9rem;
            line-height: 1.2;
            font-weight: 600;
          }

          .subtitle {
            margin: 0.45rem 0 0;
            font-style: italic;
            color: var(--muted);
          }

          .feed-meta {
            margin: 0.8rem 0 1.2rem;
            color: var(--muted);
          }

          .feed-meta a {
            color: var(--accent);
            text-decoration: none;
          }

          .feed-meta a:hover {
            text-decoration: underline;
          }

          .year-group {
            margin-top: 1.4rem;
            --timeline-line-top: 2.1rem;
            --timeline-line-bottom: 0.55rem;
            --timeline-month-dot-top: 2.05rem;
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
            margin-top: 1.4rem;
            font-size: 1.125rem;
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
            margin: 1.25rem 0;
          }

          .post-title {
            display: inline-block;
            color: var(--accent);
            font-size: 1.05rem;
            font-weight: 600;
            text-decoration: none;
            text-underline-offset: 0.25rem;
          }

          .post-title:hover {
            text-decoration: underline;
            text-decoration-style: dashed;
          }

          .post-date {
            margin: 0.25rem 0 0;
            color: var(--muted);
            font-size: 0.92rem;
          }

          .post-desc {
            margin: 0.3rem 0 0;
          }

          .empty {
            margin-top: 1rem;
            color: var(--muted);
            font-style: italic;
          }

          @media (min-width: 640px) {
            .year-group {
              --timeline-label-col: 7.25rem;
              --timeline-marker-col: 1.35rem;
              --timeline-gap: 0.55rem;
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
        <main>
          <h1>Blog</h1>
          <p class="subtitle">
            <xsl:text>All posts</xsl:text>
          </p>
          <p class="feed-meta">
            <xsl:text>This is the RSS feed. Subscribe via </xsl:text>
            <a href="{concat(rss/channel/link, 'rss.xml')}">
              <xsl:value-of select="concat(rss/channel/link, 'rss.xml')"/>
            </a>
            <xsl:text>.</xsl:text>
          </p>

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
                            <p class="post-date"><xsl:value-of select="substring(pubDate, 6, 11)"/></p>
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
        </main>
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

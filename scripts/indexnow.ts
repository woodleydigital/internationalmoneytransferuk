/**
 * Tell IndexNow search engines (Bing, Yandex, Seznam, Naver and others) about
 * every URL in the live sitemap, so new and updated pages are crawled promptly.
 *
 *   node --experimental-strip-types scripts/indexnow.ts
 *
 * Google does not use IndexNow; it reads the sitemap submitted in Search Console.
 */
import { SITE, INDEXNOW_KEY } from "../lib/site.ts";

const sitemap = await (await fetch(`${SITE.url}/sitemap.xml`)).text();
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (!urlList.length) throw new Error("The live sitemap lists no URLs.");

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: new URL(SITE.url).host,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE.url}/${INDEXNOW_KEY}.txt`,
    urlList,
  }),
});
console.log(`IndexNow: submitted ${urlList.length} URLs, HTTP ${res.status}`);
if (res.status >= 400) process.exit(1);

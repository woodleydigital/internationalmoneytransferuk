import { test } from "node:test";
import assert from "node:assert/strict";
import { findIconLinks, imageType, pngWidth, rankIcons } from "./logos.ts";

test("prefers the apple-touch-icon, then the largest declared icon", () => {
  const html = `<link rel="icon" href="/f16.png" sizes="16x16"><link rel="apple-touch-icon" href="/a.png" sizes="180x180"><link rel="icon" href="/f192.png" sizes="192x192"><link rel="mask-icon" href="/m.svg">`;
  const ranked = rankIcons(findIconLinks(html, "https://bank.example/"));
  assert.deepEqual(ranked.map((c) => new URL(c.url).pathname), ["/a.png", "/f192.png", "/f16.png"]);
});

test("accepts real images only, and no scripted SVG", () => {
  const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 180, 0, 0, 0, 180]);
  assert.equal(imageType(png), "png");
  assert.equal(pngWidth(png), 180);
  assert.equal(imageType(new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"><circle r="1"/></svg>')), "svg");
  assert.equal(imageType(new TextEncoder().encode('<svg onload="alert(1)"></svg>')), null);
  assert.equal(imageType(new TextEncoder().encode("<html>not an image</html>")), null);
});

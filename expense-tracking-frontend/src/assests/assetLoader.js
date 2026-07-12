// Vite replacement for CRA's `require("../../assests/<name>.png")` pattern.
// Eagerly imports every image under `src/assests` so callers can resolve them
// by filename (e.g. "add.png") or nested path (e.g. "Shopping/foo.png").

const modules = import.meta.glob("./**/*.{png,jpg,jpeg,svg,gif,webp}", {
  eager: true,
  import: "default",
});

const assetMap = {};
for (const [key, url] of Object.entries(modules)) {
  const clean = key.replace(/^\.\//, "");
  assetMap[clean] = url;
  const baseName = clean.split("/").pop();
  if (!(baseName in assetMap)) {
    assetMap[baseName] = url;
  }
}

export function getAsset(name) {
  if (!name) return undefined;
  const key = name.replace(/^\.?\/?assests\//, "").replace(/^\.\//, "");
  return assetMap[key] || assetMap[key.split("/").pop()];
}

export default getAsset;

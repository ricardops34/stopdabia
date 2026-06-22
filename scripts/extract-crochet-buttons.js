const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

const sourcePath = path.join(__dirname, '..', 'public', 'imagens de referencia', '59_home-stop-crochet-theme-preview.png');
const outputDir = path.join(__dirname, '..', 'public', 'icons');
const previewDir = path.join(__dirname, '..', 'tmp', 'crochet-buttons');

const crops = [
  { name: 'btn_login.png', x: 602, y: 78, w: 208, h: 122, tolerance: 42, minAlpha: 8, pad: 10 },
  { name: 'btn_individual.png', x: 46, y: 1558, w: 176, h: 220, tolerance: 34, minAlpha: 8, pad: 10 },
  { name: 'btn_criar_sala_crochet.png', x: 228, y: 1526, w: 312, h: 264, tolerance: 34, minAlpha: 8, pad: 12 },
  { name: 'btn_entrar_crochet.png', x: 566, y: 1552, w: 132, h: 214, tolerance: 34, minAlpha: 8, pad: 10 },
  { name: 'btn_som_crochet.png', x: 694, y: 1552, w: 130, h: 214, tolerance: 34, minAlpha: 8, pad: 10 },
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function colorDistance(a, b) {
  return Math.sqrt(
    (a.r - b.r) ** 2 +
    (a.g - b.g) ** 2 +
    (a.b - b.b) ** 2
  );
}

function sampleBackground(image) {
  const points = [
    [0, 0],
    [image.bitmap.width - 1, 0],
    [0, image.bitmap.height - 1],
    [image.bitmap.width - 1, image.bitmap.height - 1],
  ];

  const sum = points.reduce((acc, [x, y]) => {
    const rgba = Jimp.intToRGBA(image.getPixelColor(x, y));
    acc.r += rgba.r;
    acc.g += rgba.g;
    acc.b += rgba.b;
    return acc;
  }, { r: 0, g: 0, b: 0 });

  return {
    r: Math.round(sum.r / points.length),
    g: Math.round(sum.g / points.length),
    b: Math.round(sum.b / points.length),
  };
}

function floodFillTransparent(image, tolerance) {
  const { width, height, data } = image.bitmap;
  const bg = sampleBackground(image);
  const visited = new Uint8Array(width * height);
  const queue = [];

  for (let x = 0; x < width; x++) {
    queue.push([x, 0], [x, height - 1]);
  }
  for (let y = 1; y < height - 1; y++) {
    queue.push([0, y], [width - 1, y]);
  }

  let head = 0;
  while (head < queue.length) {
    const [x, y] = queue[head++];
    const idx = y * width + x;
    if (visited[idx]) continue;
    visited[idx] = 1;

    const pixelIdx = idx * 4;
    const rgba = {
      r: data[pixelIdx],
      g: data[pixelIdx + 1],
      b: data[pixelIdx + 2],
      a: data[pixelIdx + 3],
    };

    if (rgba.a === 0 || colorDistance(rgba, bg) > tolerance) continue;

    data[pixelIdx + 3] = 0;

    if (x > 0) queue.push([x - 1, y]);
    if (x < width - 1) queue.push([x + 1, y]);
    if (y > 0) queue.push([x, y - 1]);
    if (y < height - 1) queue.push([x, y + 1]);
  }
}

function trimBounds(image, minAlpha) {
  const { width, height, data } = image.bitmap;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > minAlpha) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    return { x: 0, y: 0, w: width, h: height };
  }

  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

async function extract() {
  ensureDir(outputDir);
  ensureDir(previewDir);

  const source = await Jimp.read(sourcePath);

  for (const crop of crops) {
    const image = source.clone().crop(crop.x, crop.y, crop.w, crop.h);
    await image.writeAsync(path.join(previewDir, `raw_${crop.name}`));

    floodFillTransparent(image, crop.tolerance);
    const bounds = trimBounds(image, crop.minAlpha);

    const trimmed = image.clone().crop(bounds.x, bounds.y, bounds.w, bounds.h);
    const finalImage = new Jimp(trimmed.bitmap.width + crop.pad * 2, trimmed.bitmap.height + crop.pad * 2, 0x00000000);
    finalImage.composite(trimmed, crop.pad, crop.pad);

    await finalImage.writeAsync(path.join(outputDir, crop.name));
    await finalImage.writeAsync(path.join(previewDir, crop.name));
    console.log(`saved ${crop.name}`);
  }
}

extract().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

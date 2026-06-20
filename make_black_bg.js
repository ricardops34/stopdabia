const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

const inputPath = path.join(__dirname, 'tmp', 'new', 'fio.png');
const outputPath = path.join(__dirname, 'tmp', 'new', 'fio_black_bg.png');

async function makeBlackBg() {
    try {
        console.log("Processando fio.png com algoritmo de Preenchimento (Flood Fill)...");
        const image = await Jimp.read(inputPath);
        const w = image.bitmap.width;
        const h = image.bitmap.height;

        const tolerance = 40; 
        
        // Matriz para rastrear pixels visitados
        const visited = new Array(w * h).fill(false);
        const queue = [];
        
        // Iniciar flood fill por TODAS as bordas (em cima, embaixo, direita, esquerda)
        for (let x = 0; x < w; x++) {
            queue.push([x, 0]);
            queue.push([x, h - 1]);
        }
        for (let y = 0; y < h; y++) {
            queue.push([0, y]);
            queue.push([w - 1, y]);
        }

        let head = 0;
        while (head < queue.length) {
            const [x, y] = queue[head++];
            const idx = y * w + x;

            if (visited[idx]) continue;
            visited[idx] = true;

            const pixelIdx = (y * w + x) * 4;
            const pr = image.bitmap.data[pixelIdx + 0];
            const pg = image.bitmap.data[pixelIdx + 1];
            const pb = image.bitmap.data[pixelIdx + 2];

            // Distância para BRANCO (fundo)
            const distance = Math.sqrt(
                Math.pow(pr - 255, 2) + 
                Math.pow(pg - 255, 2) + 
                Math.pow(pb - 255, 2)
            );

            // Se for perto do branco (fundo)
            if (distance <= tolerance) {
                // Pinta o pixel de PRETO
                image.bitmap.data[pixelIdx + 0] = 0;
                image.bitmap.data[pixelIdx + 1] = 0;
                image.bitmap.data[pixelIdx + 2] = 0;
                image.bitmap.data[pixelIdx + 3] = 255;

                // Adiciona os vizinhos que ainda não visitamos
                if (x > 0 && !visited[y * w + (x - 1)]) queue.push([x - 1, y]);
                if (x < w - 1 && !visited[y * w + (x + 1)]) queue.push([x + 1, y]);
                if (y > 0 && !visited[(y - 1) * w + x]) queue.push([x, y - 1]);
                if (y < h - 1 && !visited[(y + 1) * w + x]) queue.push([x, y + 1]);
            }
        }

        await image.writeAsync(outputPath);
        console.log("✅ Concluído! O fundo agora está preto perfeitamente.");
    } catch (error) {
        console.error("Erro:", error.message);
    }
}

makeBlackBg();

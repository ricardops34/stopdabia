const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

const iconsDir = path.join(__dirname, 'public', 'avatar');
const outputDir = path.join(__dirname, 'public', 'avatar', 'transparent');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

async function processImages() {
    const files = fs.readdirSync(iconsDir).filter(f => f.endsWith('.png'));
    console.log(`Encontradas ${files.length} imagens. Tentando uma remoção mais agressiva...`);

    for (const file of files) {
        const inputPath = path.join(iconsDir, file);
        const outputPath = path.join(outputDir, file);

        try {
            console.log(`Processando ${file}...`);
            const image = await Jimp.read(inputPath);

            // Pega a cor dos 4 cantos para ter certeza de qual é o fundo
            const w = image.bitmap.width;
            const h = image.bitmap.height;
            const corners = [
                Jimp.intToRGBA(image.getPixelColor(0, 0)),
                Jimp.intToRGBA(image.getPixelColor(w - 1, 0)),
                Jimp.intToRGBA(image.getPixelColor(0, h - 1)),
                Jimp.intToRGBA(image.getPixelColor(w - 1, h - 1))
            ];

            // Usa o canto superior esquerdo como base
            const { r: bgR, g: bgG, b: bgB } = corners[0];

            // Aumentei a tolerância drasticamente porque imagens geradas por IA 
            // têm gradientes e sujeiras no fundo, não é uma cor sólida perfeita.
            const tolerance = 70;

            image.scan(0, 0, w, h, function (x, y, idx) {
                const pr = this.bitmap.data[idx + 0];
                const pg = this.bitmap.data[idx + 1];
                const pb = this.bitmap.data[idx + 2];
                const pa = this.bitmap.data[idx + 3];

                const distance = Math.sqrt(
                    Math.pow(pr - bgR, 2) +
                    Math.pow(pg - bgG, 2) +
                    Math.pow(pb - bgB, 2)
                );

                // Se a cor for muito parecida com o fundo E for bem clara (assumindo fundo branco/cinza)
                if (distance <= tolerance && pa > 0) {
                    this.bitmap.data[idx + 3] = 0; // Deixa transparente
                }
            });

            await image.writeAsync(outputPath);
        } catch (error) {
            console.error(`Erro no arquivo ${file}:`, error.message);
        }
    }
    console.log(`\nConcluído! As imagens prontas estão na pasta 'tmp/new/transparent'.`);
}

processImages();

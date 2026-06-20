const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

const iconsDir = path.join(__dirname, 'public', 'cachorra');
const outputDir = path.join(__dirname, 'public', 'cachorra', 'transparent');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

async function processImages() {
    const files = fs.readdirSync(iconsDir).filter(f => f.endsWith('.png'));
    console.log(`Encontradas ${files.length} imagens. Removendo fundos...`);

    for (const file of files) {
        const inputPath = path.join(iconsDir, file);
        const outputPath = path.join(outputDir, file);

        try {
            console.log(`Processando ${file}...`);
            const image = await Jimp.read(inputPath);

            // Pega a cor do pixel no topo-esquerdo (0,0) assumindo que é a cor de fundo
            const bgColor = image.getPixelColor(0, 0);
            const { r: bgR, g: bgG, b: bgB } = Jimp.intToRGBA(bgColor);

            const tolerance = 40; // Tolerância para lidar com bordas/sombras leves

            image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
                const pr = this.bitmap.data[idx + 0];
                const pg = this.bitmap.data[idx + 1];
                const pb = this.bitmap.data[idx + 2];
                const pa = this.bitmap.data[idx + 3];

                // Calcula a distância da cor atual para a cor de fundo
                const distance = Math.sqrt(
                    Math.pow(pr - bgR, 2) +
                    Math.pow(pg - bgG, 2) +
                    Math.pow(pb - bgB, 2)
                );

                if (distance <= tolerance && pa > 0) {
                    this.bitmap.data[idx + 3] = 0; // Transparente
                }
            });

            await image.writeAsync(outputPath);
        } catch (error) {
            console.error(`Erro no arquivo ${file}:`, error.message);
        }
    }
    console.log(`\nConcluído! As imagens prontas estão na pasta 'public/icons/transparent'.`);
}

processImages();

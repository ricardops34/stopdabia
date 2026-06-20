const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'tmp', 'new');
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

// Estes foram os únicos 5 que consegui gerar com fundo branco puro antes do limite
const filesToCopy = {
    "btn_resultado_1781970915919.png": "btn_resultado.png",
    "btn_jogar_1781970926452.png": "btn_jogar.png",
    "btn_sair_1781970936156.png": "btn_sair.png",
    "fio_1781970943530.png": "fio.png",
    "node_done_1781970952067.png": "node_done.png"
};

const sourceDir = "C:\\Users\\ricar\\.gemini\\antigravity-ide\\brain\\0771d3cd-8aa9-4c3d-91fe-39133479e8ff";

console.log("Copiando as 5 imagens com fundo BRANCO...");

for (const [sourceFile, destFile] of Object.entries(filesToCopy)) {
    const srcPath = path.join(sourceDir, sourceFile);
    const destPath = path.join(targetDir, destFile);
    
    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`✅ Copiado: ${destFile}`);
    } else {
        console.log(`❌ Falha (não encontrado): ${sourceFile}`);
    }
}

console.log(`\nAgora você pode rodar o 'node remove_bg.js' para limpar o fundo branco.`);

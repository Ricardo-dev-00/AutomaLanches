import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

console.log('🚀 Iniciando servidor simples...');
console.log('📁 __dirname:', __dirname);
console.log('🌍 NODE_ENV:', process.env.NODE_ENV);
console.log('🔢 PORT:', PORT);

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({ 
    message: 'AutomaLanches API Online',
    version: '1.0.0',
    env: process.env.NODE_ENV 
  });
});

// Servir arquivos estáticos em produção
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist');
  console.log('📂 Procurando dist em:', distPath);
  
  if (fs.existsSync(distPath)) {
    console.log('✅ dist/ encontrado!');
    const files = fs.readdirSync(distPath);
    console.log('📄 Arquivos no dist:', files);
    
    app.use(express.static(distPath, { index: false }));
    
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).json({ error: 'index.html não encontrado' });
      }
    });
  } else {
    console.log('⚠️ dist/ NÃO encontrado!');
  }
}

app.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(60));
  console.log(`✅ Servidor rodando em http://0.0.0.0:${PORT}`);
  console.log('='.repeat(60));
});

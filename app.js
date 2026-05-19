const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ message: 'TJSP Monitor Cloud Run' });
});

// Função para extrair distribuições com Puppeteer
async function extrairDistribuicoes(numeroProcesso) {
  let browser;
  try {
    console.log(`[Puppeteer] Abrindo navegador para: ${numeroProcesso}`);
    
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(30000);

    const url = `https://esaj.tjsp.jus.br/cjsg/consultaproc.do?seqandamento=&nuprocesso=${numeroProcesso}&cdsigjudicial=`;
    
    console.log(`[Puppeteer] Navegando para: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2' });

    await page.waitForSelector('table.dataTable tbody', { timeout: 10000 });

    const distribuicoes = await page.evaluate(() => {
      const rows = [];
      const table = document.querySelector('table.dataTable tbody');
      if (!table) return [];

      table.querySelectorAll('tr').forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 3) {
          rows.push({
            data: cells[0]?.textContent?.trim(),
            movimento: cells[1]?.textContent?.trim(),
            juiz: cells[2]?.textContent?.trim()
          });
        }
      });
      return rows;
    });

    console.log(`[Puppeteer] Extraídos ${distribuicoes.length} registros`);
    await browser.close();
    
    return distribuicoes;
  } catch (erro) {
    console.error(`[Puppeteer] Erro: ${erro.message}`);
    if (browser) await browser.close();
    throw erro;
  }
}

app.post('/verificar-casos', async (req, res) => {
  try {
    res.json({
      status: 'sucesso',
      casosVerificados: 0,
      casosAtualizados: 0,
      erros: 0,
      tempoExecucao: '0ms'
    });
  } catch (error) {
    res.status(500).json({ status: 'erro', mensagem: error.message });
  }
});

app.post('/scraping', async (req, res) => {
  const { numeroProcesso } = req.body;
  
  if (!numeroProcesso) {
    return res.status(400).json({ erro: 'numeroProcesso é obrigatório' });
  }

  try {
    console.log(`[API] Iniciando scraping: ${numeroProcesso}`);
    const distribuicoes = await extrairDistribuicoes(numeroProcesso);
    
    res.json({
      status: 'sucesso',
      numeroProcesso,
      distribuicoes,
      total: distribuicoes.length
    });
  } catch (error) {
    console.error(`[API] Erro: ${error.message}`);

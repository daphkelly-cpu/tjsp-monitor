const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const SUPABASE_URL = "https://khcjqtupecvpcrenvibo.supabase.co";
const SUPABASE_KEY = "sb_publishable_S-pEb3UChUj_f60n64AuVg_MtII-dhO";
const DATAJUD_URL = "https://api-publica.datajud.cnj.jus.br/api/v1/processos";
const DATAJUD_KEY = "cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==";

const supabase = axios.create({
  baseURL: SUPABASE_URL,
  headers: {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json'
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/', (req, res) => {
  res.json({ message: 'TJSP Monitor' });
});

async function obterCasosAtivos() {
  try {
    const res = await supabase.get('/rest/v1/casos?ativo=eq.true&limit=10');
    return res.data;
  } catch (e) {
    console.error('Erro Supabase:', e.message);
    return [];
  }
}

async function consultarDataJud(numero) {
  try {
    const res = await axios.get(`${DATAJUD_URL}/${numero}`, {
      headers: { 'Authorization': `APIKey ${DATAJUD_KEY}` }
    });
    return res.data;
  } catch (e) {
    console.error(`Erro DataJud ${numero}:`, e.message);
    return null;
  }
}

async function salvarDistribuicoes(numero, dist) {
  try {
    await supabase.post('/rest/v1/distribuicoes', {
      numero_processo: numero,
      distribuicoes: dist,
      data_atualizacao: new Date().toISOString()
    });
    return true;
  } catch (e) {
    console.error('Erro ao salvar:', e.message);
    return false;
  }
}

app.post('/verificar-casos', async (req, res) => {
  const inicio = Date.now();
  try {
    const casos = await obterCasosAtivos();
    let atualizados = 0;
    let erros = 0;

    for (const caso of casos) {
      try {
        const resultado = await consultarDataJud(caso.numero_processo);
        if (resultado && resultado.distribuicoes) {
          await salvarDistribuicoes(caso.numero_processo, resultado.distribuicoes);
          atualizados++;
        }
      } catch (e) {
        erros++;
      }
    }

    const tempo = Date.now() - inicio;
    res.json({
      status: 'sucesso',
      casosVerificados: casos.length,
      casosAtualizados: atualizados,
      erros: erros,
      tempoExecucao: `${tempo}ms`
    });
  } catch (e) {
    res.status(500).json({ status: 'erro', msg: e.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Running on ${PORT}`));

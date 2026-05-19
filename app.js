const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const SUPABASE_URL = "https://khcjqtupecvpcrenvibo.supabase.co";
const SUPABASE_KEY = "sb_publishable_S-pEb3UChUj_f60n64AuVg_MtII-dhO";
const DATAJUD_URL = "https://api-publica.datajud.cnj.jus.br/api/v1/processos";
const DATAJUD_KEY = "cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==";

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/', (req, res) => {
  res.json({ message: 'TJSP Monitor' });
});

app.post('/verificar-casos', async (req, res) => {
  try {
    const supabase = axios.create({
      baseURL: SUPABASE_URL,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const casos = await supabase.get('/rest/v1/casos?ativo=eq.true&limit=5');
    console.log(`Casos obtidos: ${casos.data.length}`);

    res.json({
      status: 'sucesso',
      casosVerificados: casos.data.length,
      casosAtualizados: 0,
      erros: 0,
      tempoExecucao: '0ms'
    });
  } catch (e) {
    console.error('Erro:', e.message);
    res.status(500).json({ status: 'erro', msg: e.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Running`));

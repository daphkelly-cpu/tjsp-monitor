const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const SUPABASE_URL = "https://khcjqtupecvpcrenvibo.supabase.co";
const SUPABASE_KEY = "sb_publishable_S-pEb3UChUj_f60n64AuVg_MtII-dhO";

app.get('/health', (req, res) => res.json({ok:1}));
app.get('/', (req, res) => res.json({ok:1}));

app.post('/verificar-casos', async (req, res) => {
  try {
    const supabase = axios.create({
      baseURL: SUPABASE_URL,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    const casos = await supabase.get('/rest/v1/casos?ativo=eq.true&limit=5');
    
    res.json({
      status: 'sucesso',
      casosVerificados: casos.data.length,
      casosAtualizados: 0,
      erros: 0
    });
  } catch (e) {
    res.status(500).json({status:'erro',msg:e.message});
  }
});

app.listen(8080, () => console.log('ok'));

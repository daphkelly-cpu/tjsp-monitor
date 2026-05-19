const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// Configuração
const SUPABASE_URL = "https://khcjqtupecvpcrenvibo.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_S-pEb3UChUj_f60n64AuVg_MtII-dhO";
const DATAJUD_API_URL = "https://api-publica.datajud.cnj.jus.br/api/v1/processos";
const DATAJUD_API_KEY = "cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==";

// Cliente Supabase
const supabase = axios.create({
  baseURL: SUPABASE_URL,
  headers: {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ message: 'TJSP Monitor Cloud Run' });
});

// Buscar casos no Supabase
async function obterCasosAtivos(limit = 10) {
  try {
    const response = await supabase.get(`/rest/v1/casos?ativo=eq.true&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao obter casos:', error.message);
    return [];
  }
}

// Consultar DataJud
async function consultarDataJud(numeroProcesso) {
  try {
    const url = `${DATAJUD_API_URL}/${numeroProcesso}`;
    const response = await axios.get(url, {
      headers: {
        'Authorization': `APIKey ${DATAJUD_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Erro DataJud para ${numeroProcesso}:`, error.message);
    return null;
  }
}

// Salvar distribuições
async function salvarDistribuicoes(numeroProcesso, distribuicoes) {
  try {
    await supabase.post('/rest/v1/distribuicoes', {
      numero_processo: numeroProcesso,
      distribuicoes: distribuicoes,
      data_atualizacao: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Erro ao salvar:', error.message);
    return false;
  }
}

// Endpoint: Verificar casos
app.post('/verificar-casos', async (req, res) => {
  const inicio = Date.now();
  
  try {
    console.log('[API] Iniciando verificação de casos');
    
    const casos = await obterCasosAtivos(10);
    let casosAtualizados = 0;
    let erros = 0;

    for (const caso of casos) {
      try {
        const resultado = await consultarDataJud(caso.numero_processo);
        
        if (resultado && resultado.distribuicoes) {
          await salvarDistribuicoes(caso.numero_processo, resultado.distribuicoes);
          casosAtualizados++;
          console.log(`✅ Distribuições salvas: ${caso.numero_processo}`);
        }
      } catch (error) {
        erros++;
        console.error(`❌ Erro ao processar ${caso.numero_processo}: ${error.message}`);
      }
    }

    const tempoExecucao = Date.now() - inicio;
    
    res.json({
      status: 'sucesso',
      casosVerificados: casos.length,
      casosAtualizados: casosAtualizados,
      erros: erros,
      tempoExecucao: `${tempoExecucao}ms`
    });

  } catch (error) {
    console.error('[API] Erro crítico:', error.message);
    res.status(500).json({
      status: 'erro',
      mensagem: error.message
    });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

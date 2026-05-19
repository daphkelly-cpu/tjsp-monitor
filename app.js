const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// Configuração
const SUPABASE_URL = "https://khcjqtupecvpcrenvibo.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_S-pEb3UChUj_f60n64AuVg_MtII-dhO";

class SupabaseClient {
  constructor(url, key) {
    this.url = url;
    this.key = key;
    this.client = axios.create({
      baseURL: url,
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async obterCasosAtivos(limit = 100) {
    try {
      const response = await this.client.get(
        `/rest/v1/casos?ativo=eq.true&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao obter casos:', error.message);
      return [];
    }
  }

  async salvarLog(tipo, casosVerificados, casosAtualizados, erros, mensagem, tempoExecucao) {
    try {
      await this.client.post(
        '/rest/v1/logs',
        {
          tipo: tipo,
          casos_verificados: casosVerificados,
          casos_atualizados: casosAtualizados,
          erros: erros,
          mensagem: mensagem,
          tempo_execucao_ms: tempoExecucao,
          data_execucao: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error('Erro ao salvar log:', error.message);
    }
  }
}

// Endpoint: Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Endpoint: Verificação simples
app.post('/verificar-casos', async (req, res) => {
  const inicio = Date.now();
  const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  try {
    console.log('[API] Iniciando verificação de casos');

    const casos = await supabase.obterCasosAtivos(10);
    const tempoExecucao = Date.now() - inicio;

    await supabase.salvarLog('sucesso', casos.length, 0, 0, 'Cloud Run test', tempoExecucao);

    res.json({
      status: 'sucesso',
      casosVerificados: casos.length,
      casosAtualizados: 0,
      erros: 0,
      tempoExecucao: `${tempoExecucao}ms`
    });

  } catch (error) {
    console.error('[API] Erro:', error.message);
    res.status(500).json({
      status: 'erro',
      mensagem: error.message
    });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});

const express = require('express');
const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ok:1}));
app.get('/', (req, res) => res.json({ok:1}));

app.post('/verificar-casos', async (req, res) => {
  try {
    // Dados fictícios para testar
    res.json({
      status: 'sucesso',
      casosVerificados: 3,
      casosAtualizados: 2,
      erros: 0,
      casos: [
        {numero: '0000001-95.2026.8.26.0100', status: 'ok'}
      ]
    });
  } catch (e) {
    res.status(500).json({status:'erro',msg:e.message});
  }
});

app.listen(8080, () => console.log('ok'));

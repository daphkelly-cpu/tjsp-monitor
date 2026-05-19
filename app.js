const express = require('express');
const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ message: 'TJSP Monitor Cloud Run' });
});

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

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

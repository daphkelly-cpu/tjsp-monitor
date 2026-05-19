const express = require('express');
const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/', (req, res) => {
  res.json({ message: 'TJSP Monitor' });
});

app.post('/verificar-casos', async (req, res) => {
  res.json({ status: 'sucesso', casosVerificados: 0 });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Running on ${PORT}`));

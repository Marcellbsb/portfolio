const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const Joi = require('joi');

const app = express();
const port = 3007;
app.use(cors());

// Conexão com o MongoDB 
mongoose.connect('mongodb+srv://devmarcell:Srh14123df@usuarios.c1esl9b.mongodb.net/?retryWrites=true&w=majority&appName=usuarios')
.then(() => console.log('Conectado ao MongoDB'))
.catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Validação do Mongoose
const contatoSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 3, maxlength: 50 },
  email: { type: String, required: true },
  phone: { type: String },
  subject: { type: String, required: true, minlength: 5 },
  message: { type: String, required: true, minlength: 10 },
});

const Contato = mongoose.model('Contato', contatoSchema);

// Middleware p/ analisar o corpo das requisições
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Rota para buscar todos os contatos
app.get('/contacts', async (req, res) => {
  try {
    const contacts = await Contato.find(); // Busca todos os contatos no banco de dados
    res.json(contacts);
  } catch (error) {
    console.error('Erro ao buscar contatos:', error);
    res.status(500).json({ error: 'Ocorreu um erro ao buscar os contatos.' });
  }
});

// Rota para criar um novo contato
app.post("/contact", async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().optional(),
    subject: Joi.string().min(5).required(),
    message: Joi.string().min(10).required(),
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      error: "Dados inválidos",
      details: error.details.map((detail) => detail.message),
    });
  }

  try {
    const novoContato = new Contato(req.body);
    await novoContato.save();
    res.status(200).json({ message: "Mensagem enviada com sucesso!" });
  } catch (err) {
    console.error("Erro ao salvar contato:", err);
    res.status(500).json({ error: "Erro ao salvar a mensagem." });
  }
});

// Rota para atualizar um contato (UPDATE)
app.put('/contacts/:id', async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50),
    email: Joi.string().email(),
    phone: Joi.string(),
    subject: Joi.string().min(5),
    message: Joi.string().min(10),
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      error: "Dados inválidos",
      details: error.details.map((detail) => detail.message),
    });
  }

  try {
    const { id } = req.params;
    
    // Verifica se o ID é válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const contatoAtualizado = await Contato.findByIdAndUpdate(
      id, 
      req.body, 
      { new: true } // Retorna o documento atualizado
    );

    if (!contatoAtualizado) {
      return res.status(404).json({ error: 'Contato não encontrado' });
    }

    res.json(contatoAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar contato:', error);
    res.status(500).json({ error: 'Ocorreu um erro ao atualizar o contato.' });
  }
});

// Rota para deletar um contato (DELETE)
app.delete('/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verifica se o ID é válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const contatoDeletado = await Contato.findByIdAndDelete(id);

    if (!contatoDeletado) {
      return res.status(404).json({ error: 'Contato não encontrado' });
    }

    res.json({ message: 'Contato deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar contato:', error);
    res.status(500).json({ error: 'Ocorreu um erro ao deletar o contato.' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
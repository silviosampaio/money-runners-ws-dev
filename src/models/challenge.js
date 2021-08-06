import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Challenge = new Schema({
  title: {
    type: String,
    required: [true, 'Titulo é obrigatório'],
  },

  description: {
    type: String,
    required: [true, 'Descrição é obrigatório'],
  },
  fee: {
    type: Number,
    required: [true, 'Taxa é obrigatório'],
  },
  distance: {
    type: Number,
    required: [true, 'Distância é obrigatório'],
  },
  date: {
    start: {
      type: String,
      required: [true, 'Data de Inicio é obrigatório'],
    },
    end: {
      type: String,
      required: [true, 'Data de Fim é obrigatório'],
    },
  },
  time: {
    start: {
      type: String,
      required: [true, 'Hora de Inicio é obrigatório'],
    },
    end: {
      type: String,
      required: [true, 'Hora de Fim é obrigatório'],
    },
  },
  ytVideoId: {
    type: String,
    required: [true, 'Id di vídeo do Youtube é obrigatório'],
  },
  status: {
    type: String,
    enum: ['A', 'I', 'P'],
    default: 'A',
  },
  register: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Challenge', Challenge);

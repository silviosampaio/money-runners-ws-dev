import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Tracking = new Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: [true, 'Usuário é obrigatório'],
  },
  challengeId: {
    type: mongoose.Types.ObjectId,
    ref: 'Challenge',
    required: [true, 'Desafio é obrigatório'],
  },
  operation: {
    type: String,
    enum: ['F', 'G', 'L', 'W'], // FEE, GAIN, LOSS, WITHDRAL
    required: [true, 'Operação é obrigatório'],
  },
  amount: {
    type: Number,
    required: [true, 'Valor é obrigatório'],
  },
  transactionId: {
    type: String,
    required: [
      function () {
        return ['F', 'W'].includes(this.operation); // W
      },
      'ID da transação é obrigatório',
    ],
  },
  register: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Tracking', Tracking);

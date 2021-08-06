import express from 'express';
import mongoose from 'mongoose';
import moment from 'moment';
import _ from 'lodash';

import User from '../models/user.js';
import Challenge from '../models/challenge.js';
import Tracking from '../models/tracking.js';
import UserChallenge from '../models/relationship/userChallenge.js';

import pagarme from '../services/pagarme.js';
import util from '../util.js';

const router = express.Router();

router.post('/join', async (req, res) => {
  try {
    const { userId, challengeId, creditCard } = req.body;

    // LER DADOS DO USUÁRIO E DESAFIO
    const user = await User.findById(userId);
    const challenge = await Challenge.findById(challengeId);
    const challengePrice = util.toCents(challenge.fee);

    // CRIAR TRANSAÇÃO DO PAGARME
    const createPayment = await pagarme('/transactions', {
      amount: challengePrice,
      ...creditCard,
      customer: {
        id: user.customerId,
      },
      billing: {
        name: 'Silvio Sampaio',
        address: {
          country: 'br',
          state: 'rs',
          city: 'Porto Alegre',
          neighborhood: 'Protási Alves',
          street: 'Protário Alves',
          street_number: '9999',
          zipcode: '91260000',
        },
      },
      items: [
        {
          id: challenge._id,
          title: challenge.title,
          unit_price: challengePrice,
          quantity: 1,
          tangible: false,
        },
      ],
    });

    if (createPayment.error) {
      throw createPayment;
    }

    // COLOCAR O REGISTRO NO TRACKING
    await new Tracking({
      userId,
      challengeId,
      operation: 'F',
      transactionId: createPayment.data.id,
      amount: challenge.fee,
    }).save();

    // ATRELAR O USER AO CHALLENGE
    await new UserChallenge({
      userId,
      challengeId,
    }).save();

    res.json({ message: 'Desafio Aceito' });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.post('/tracking', async (req, res) => {
  try {
    const { userId, challengeId, operation } = req.body;
    const existentTrackingType = await Tracking.findOne({
      userId,
      challengeId,
      operation,
      register: {
        $lte: moment().endOf('day'),
        $gte: moment().startOf('day'),
      },
    });

    if (!existentTrackingType) {
      await new Tracking(req.body).save();
    }

    res.json({ message: 'Evento Registrado' });
  } catch (err) {
    res.json({ message: err.message });
  }
});

router.get('/:challengeId/ranking', async (req, res) => {
  try {
    const { challengeId } = req.params;
    const challenge = await Challenge.findById(challengeId);

    // PERÍDO ATUAL, PERÍODO OTTLA
    const dayStart = moment(challenge.date.start, 'YYYY-MM-DD');
    const dayEnd = moment(challenge.date.end, 'YYYY-MM-DD');
    const challengePeriod = dayEnd.diff(dayStart, 'days');
    const currentPeriod = moment().diff(dayStart.subtract(1, 'day'), 'days');

    const trackings = await Tracking.find({
      challengeId,
      operation: ['G', 'L'],
    }).populate('userId', 'name photo');

    const records = _.chain(trackings)
      .groupBy('userId._id')
      .toArray()
      .map((trackingUser) => ({
        _id: trackingUser[0].userId._id,
        name: trackingUser[0].userId.name,
        photo: trackingUser[0].userId.photo,
        performance: trackingUser.filter((t) => t.operation === 'G').length,
      }))
      .orderBy('performance', 'desc');

    const extraBalance = trackings
      .filter((t) => t.operation === 'L')
      .reduce((total, t) => {
        return total + t.amount;
      }, 0);

    res.json({
      extraBalance,
      challengeDate: challenge.date,
      currentPeriod,
      challengePeriod,
      records,
    });
  } catch (err) {
    res.json({ message: err.message });
  }
});

/*router.post('/login', async (req, res) => {
  try {
  } catch (err) {
    res.json({ message: err.message });
  }
});*/

export default router;

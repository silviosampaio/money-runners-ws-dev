import axios from 'axios';
const api_key = 'ak_test_4z4GpHRuDfiCBzVyJUBSs6gV81aJ4i';

const api = axios.create({
  baseURL: 'https://api.pagar.me/1',
});

export default async (endpoint, data, method = 'post') => {
  try {
    const response = await api[method](endpoint, {
      api_key,
      ...data,
    });

    return { error: false, data: response.data };
  } catch (err) {
    return {
      error: true,
      message: JSON.stringify(err.response.data.errors[0]),
    };
  }
};

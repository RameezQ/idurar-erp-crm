export const filter = {
  name: {
    type: 'string',
    required: true,
  },

  currency: {
    type: 'selectCurrency',
  },
  total: {
    type: 'currency',
    required: true,
  },
};

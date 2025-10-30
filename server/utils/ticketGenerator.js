const generateTicketNumber = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `TKT${timestamp}${random}`.toUpperCase();
};

const generatePaymentReference = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `PAY${timestamp}${random}`.toUpperCase();
};

module.exports = { generateTicketNumber, generatePaymentReference };

// EMI = [P x R x (1+R)^N] / [(1+R)^N - 1]
export const calculateEMI = (principal, annualRate, tenureMonths) => {
  const monthlyRate = annualRate / 12 / 100;
  const emi = 
    (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  return emi.toFixed(2);
};

export const calculateTotalInterest = (emi, principal, tenureMonths) => {
  return (emi * tenureMonths - principal).toFixed(2);
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
};

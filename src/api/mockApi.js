const STORAGE_KEY = 'loanAppState';
const LATENCY_MS = 400;

const readState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeState = (state) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const delay = (value) => new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));

export const loadAppState = async () => {
  const state = readState();
  return delay(state);
};

export const saveAppState = async (state) => {
  writeState(state);
  return delay(true);
};

export const updateAppState = async (updater) => {
  const current = readState() || {};
  const nextState = updater(current);
  writeState(nextState);
  return delay(nextState);
};

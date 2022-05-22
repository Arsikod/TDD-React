function setItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getItem(key) {
  const storedState = localStorage.getItem(key);

  if (!storedState) {
    return null;
  }

  try {
    return JSON.parse(storedState);
  } catch (err) {
    return storedState;
  }
}

function clear() {
  localStorage.clear();
}

const storage = {
  setItem,
  getItem,
  clear,
};

export default storage;

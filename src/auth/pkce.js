const arrayToBase64Url = (arrayBuffer) => {
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const stringToBase64Url = (value) => {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

export const generatePkcePair = async () => {
  const randomBytes = new Uint8Array(64);
  window.crypto.getRandomValues(randomBytes);
  const verifier = stringToBase64Url(String.fromCharCode(...randomBytes));
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  const challenge = arrayToBase64Url(digest);

  return { verifier, challenge };
};

const IMAGE_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL || '';

const isAbsoluteUrl = (value) => /^https?:\/\//i.test(value);

const joinUrl = (base, path) => {
  const trimmedBase = base.replace(/\/+$/, '');
  const trimmedPath = path.replace(/^\/+/, '');
  return `${trimmedBase}/${trimmedPath}`;
};

export const resolveImageUrl = (value) => {
  if (!value || typeof value !== 'string') {
    return '';
  }

  if (isAbsoluteUrl(value)) {
    return value;
  }

  if (!IMAGE_BASE_URL) {
    return value;
  }

  return joinUrl(IMAGE_BASE_URL, value);
};

export const pickImageUrl = (image) => {
  if (!image) {
    return '';
  }

  if (typeof image === 'string') {
    return resolveImageUrl(image);
  }

  const rawUrl = image.url || image.path || image.key || image.location || '';
  return resolveImageUrl(rawUrl);
};

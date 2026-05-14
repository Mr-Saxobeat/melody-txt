import locale from './locales/pt-BR.json';

function get(obj, path) {
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}

function useTranslation() {
  const t = (key, params) => {
    let value = get(locale, key);
    if (value === undefined) return key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        value = value.replace(`{${k}}`, v);
      });
    }
    return value;
  };

  return { t };
}

export default useTranslation;

const SETTINGS = {
  siteTitle: 'Balança Cifras',
  tabTitle: 'Balança Cifras',
  primaryColor: '#703ebf',
  headerBg: '#e6460a',
  logoColor: '#fbfdfd',
  mainBgColor: '#f5f7fa',
  logoFontFamily: '',
  logoFontSize: '1.4rem',
  headerGradient: '',
};

function useSiteSettings() {
  return { ...SETTINGS, loading: false };
}

export default useSiteSettings;

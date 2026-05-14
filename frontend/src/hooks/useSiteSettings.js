import { useState, useEffect } from 'react';
import api from '../services/api';

const DEFAULTS = {
  siteTitle: 'Melody Txt',
  tabTitle: 'Melody Txt',
  primaryColor: '#1976d2',
  headerBg: '#282c34',
  logoColor: '#61dafb',
  mainBgColor: '#f5f7fa',
  logoFontFamily: '',
  logoFontSize: '1.4rem',
  headerGradient: '',
};

function useSiteSettings() {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/site-settings/')
      .then((response) => {
        const data = response.data;
        setSettings({
          siteTitle: data.site_title || DEFAULTS.siteTitle,
          tabTitle: data.tab_title || DEFAULTS.tabTitle,
          primaryColor: data.primary_color || DEFAULTS.primaryColor,
          headerBg: data.header_background_color || DEFAULTS.headerBg,
          logoColor: data.logo_text_color || DEFAULTS.logoColor,
          mainBgColor: data.main_background_color || DEFAULTS.mainBgColor,
          logoFontFamily: data.logo_font_family || DEFAULTS.logoFontFamily,
          logoFontSize: data.logo_font_size || DEFAULTS.logoFontSize,
          headerGradient: data.header_gradient || DEFAULTS.headerGradient,
        });
      })
      .catch(() => {
        setSettings(DEFAULTS);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { ...settings, loading };
}

export default useSiteSettings;

import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import '@mdi/font/css/materialdesignicons.css';

const bookteriaTheme = {
  dark: false,
  colors: {
    background: 'transparent',
    surface: 'transparent',
    primary: '#E91E63',
    'primary-darken-1': '#C2185B',
    secondary: '#009688',
    'secondary-darken-1': '#00796B',
    error: '#B00020',
    info: '#00B0FF',
    success: '#4CAF50',
    warning: '#FB8C00',
  },
};

export default createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: 'bookteriaTheme',
    themes: {
      bookteriaTheme,
    },
  },
  defaults: {
    VBtn: {
      rounded: 'lg',
      elevation: 0,
      style: {
        textTransform: 'none',
        fontWeight: '600',
      },
    },
    VTextField: {
      variant: 'outlined',
      density: 'compact',
      rounded: 'lg',
    },
    VCard: {
      rounded: 'xl',
      elevation: 4,
      style: {
        background: 'rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(10px) saturate(180%)',
        webkitBackdropFilter: 'blur(10px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.125)',
      },
    },
    VAppBar: {
      elevation: 0,
    },
  },
});
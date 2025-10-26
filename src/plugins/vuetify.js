import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import '@mdi/font/css/materialdesignicons.css';

const bookteriaTheme = {
  dark: false,
  colors: {
    background: '#f4f6f8',
    surface: '#ffffff',
    primary: '#0B57D0',
    'primary-darken-1': '#0A4CB8',
    secondary: '#f50057',
    'secondary-darken-1': '#D8004A',
    error: '#B00020',
    info: '#2196F3',
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
      elevation: 0,
      border: 'thin',
    },
    VAppBar: {
      elevation: 0,
      border: 'b-thin',
    }
  },
});
import { theme } from './theme';

export const componentStyles = {
  buttons: {
    primary: {
      backgroundColor: theme.colors.primary,
      color: theme.colors.secondary,
      padding: '0.8rem 1.5rem',
      border: 'none',
      borderRadius: '5px',
      fontSize: '1rem',
      cursor: 'pointer',
      fontWeight: 'bold',
      textDecoration: 'none',
      display: 'inline-block',
      textAlign: 'center',
      transition: 'box-shadow 0.3s, background 0.3s, color 0.3s',
      boxShadow: '0 2px 8px 0 rgba(212, 175, 55, 0.08)',
    },
    primaryHover: {
      backgroundColor: theme.colors.secondary,
      color: theme.colors.primary,
      boxShadow: '0 0 8px 2px #d4af37',
    },
    secondary: {
      backgroundColor: theme.colors.accent,
      color: theme.colors.secondary,
      padding: '0.5rem 1rem',
      border: `2px solid ${theme.colors.secondary}`,
      borderRadius: '5px',
      cursor: 'pointer',
      fontWeight: 'bold',
      transition: 'background-color 0.3s, color 0.3s',
    },
    secondaryHover: {
      backgroundColor: theme.colors.primary,
      color: theme.colors.secondary,
    }
  }
}; 
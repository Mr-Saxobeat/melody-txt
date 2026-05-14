# Data Model: Internationalization (i18n)

**Feature**: 006-i18n-pt-br
**Date**: 2026-05-14

## Entity: Locale File (pt-BR.json)

No database entities — translations are static JSON files bundled with the frontend.

### Structure

```json
{
  "nav": {
    "setlists": "Setlists",
    "compose": "Compor",
    "myMelodies": "Minhas Melodias",
    "mySetlists": "Meus Setlists",
    "login": "Entrar",
    "logout": "Sair"
  },
  "home": {
    "title": "Componha melodias usando notação solfejo",
    "subtitle": "Escreva suas melodias com do, ré, mi...",
    "startComposing": "Começar a Compor",
    "recentMelodies": "Melodias Recentes",
    "by": "por {name}"
  },
  "compose": {
    "title": "Componha sua Melodia",
    "howToUse": "Como usar:",
    "instructions": { ... },
    "enterMelody": "Digite sua melodia (notas e letras):",
    "save": "Salvar Melodia",
    "saveLoginRequired": "Salvar (Login Necessário)",
    "saveDialog": { ... },
    "savedSuccess": "Melodia salva com sucesso!",
    "selectInstrument": "Selecione seu Instrumento",
    "selectInstrumentHint": "Escolha o instrumento em que você vai compor",
    "reset": "Resetar"
  },
  "auth": {
    "login": { ... },
    "register": { ... }
  },
  "shared": {
    "loading": "Carregando melodia compartilhada...",
    "notFound": "Melodia Não Encontrada",
    "editMelody": "Editar Melodia"
  },
  "melodies": {
    "title": "Minhas Melodias",
    "empty": "Nenhuma melodia ainda...",
    "createFirst": "Crie sua primeira melodia!",
    "share": "Compartilhar",
    "edit": "Editar",
    "delete": "Excluir",
    "confirmDelete": "Tem certeza?",
    "copied": "Link copiado!"
  },
  "instruments": {
    "selectInstrument": "Selecionar Instrumento",
    "cancel": "Cancelar"
  },
  "transpose": {
    "half": "meio tom",
    "whole": "tom",
    "octave": "oitava",
    "font": "fonte"
  },
  "errors": {
    "titleRequired": "Por favor, insira um título.",
    "saveFailed": "Falha ao salvar melodia.",
    "loadFailed": "Falha ao carregar melodia."
  }
}
```

### Key Conventions

- Dot-notation: `section.subsection.key`
- Interpolation: `{variableName}` replaced at runtime
- Fallback: missing key returns the key string itself

### Hook Contract

```javascript
const { t } = useTranslation();

t('nav.compose')              // → "Compor"
t('home.by', { name: 'João' }) // → "por João"
t('unknown.key')              // → "unknown.key"
```

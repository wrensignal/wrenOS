function toBool(v, fallback = false) {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') {
    if (v.toLowerCase() === 'on' || v.toLowerCase() === 'true') return true;
    if (v.toLowerCase() === 'off' || v.toLowerCase() === 'false') return false;
  }
  return fallback;
}

export function createTelegramAdapter(config = {}, hooks = {}) {
  const state = {
    paperMode: toBool(config.paperMode ?? true, true)
  };

  const help = [
    'Available commands:',
    '/status',
    '/watchlist',
    '/health',
    '/trade <symbol>',
    '/paper on|off'
  ].join('\n');

  async function cmdStatus() {
    if (hooks.getStatus) return hooks.getStatus(state);
    return {
      ok: true,
      profile: config.profile || 'unknown',
      paperMode: state.paperMode,
      message: 'Agent is online.'
    };
  }

  async function cmdWatchlist() {
    if (hooks.getWatchlist) return hooks.getWatchlist(state);
    return {
      ok: true,
      watchlist: [],
      message: 'No watchlist loaded yet.'
    };
  }

  async function cmdHealth() {
    if (hooks.getHealth) return hooks.getHealth(state);
    return {
      ok: true,
      upstream: config.inferenceBaseUrl || process.env.SPEAKEASY_BASE_URL || 'https://api.speakeasyrelay.com'
    };
  }

  async function cmdTrade(symbol) {
    if (!symbol) return { ok: false, error: 'usage: /trade <symbol>' };
    if (hooks.proposeTrade) return hooks.proposeTrade({ symbol, paperMode: state.paperMode });
    return {
      ok: true,
      type: 'proposal',
      symbol,
      paperMode: state.paperMode,
      message: `Trade proposal generated for ${symbol}${state.paperMode ? ' (paper mode)' : ''}.`
    };
  }

  async function cmdPaper(mode) {
    if (!mode || !['on', 'off'].includes(String(mode).toLowerCase())) {
      return { ok: false, error: 'usage: /paper on|off' };
    }
    state.paperMode = String(mode).toLowerCase() === 'on';
    if (hooks.onPaperModeChange) await hooks.onPaperModeChange(state.paperMode);
    return {
      ok: true,
      paperMode: state.paperMode,
      message: `Paper mode ${state.paperMode ? 'enabled' : 'disabled'}.`
    };
  }

  async function handleText(text = '') {
    const [cmd, ...rest] = String(text).trim().split(/\s+/);
    const arg = rest.join(' ').trim();
    const normalized = (cmd || '').toLowerCase();

    switch (normalized) {
      case '/status':
        return cmdStatus();
      case '/watchlist':
        return cmdWatchlist();
      case '/health':
        return cmdHealth();
      case '/trade':
        return cmdTrade(arg);
      case '/paper':
        return cmdPaper(rest[0]);
      case '/help':
      case 'help':
        return { ok: true, message: help };
      default:
        if (hooks.defaultChat) {
          return hooks.defaultChat({
            text: String(text),
            state,
            commandLike: normalized.startsWith('/')
          });
        }
        return { ok: true, message: help };
    }
  }

  return {
    platform: 'telegram',
    commands: ['/status', '/watchlist', '/health', '/trade <symbol>', '/paper on|off'],
    state,
    handleText
  };
}

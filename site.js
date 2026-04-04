document.body.classList.add('has-js');

const navToggle = document.querySelector('.nav-toggle');
const closeNavigation = () => {
  document.body.classList.remove('nav-open');
  if (navToggle) {
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open navigation');
  }
};

if (navToggle) {
  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    document.body.classList.toggle('nav-open', !isOpen);
    navToggle.setAttribute('aria-expanded', String(!isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
  });
}

const currentPage = document.body.dataset.page;
if (currentPage) {
  document.querySelectorAll('[data-page]').forEach((link) => {
    if (link.dataset.page === currentPage) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const hash = link.getAttribute('href');
    if (!hash || hash === '#') return;

    const target = document.querySelector(hash);
    if (!target) return;

    event.preventDefault();
    closeNavigation();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', hash);
  });
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 820) {
    closeNavigation();
  }
});

const downloadButtons = document.querySelectorAll('.download-trigger');
if (downloadButtons.length) {
  const triggerDownload = () => {
    const content = [
      'BaonBrain Starter Guide',
      '',
      'Stretch your baon with less guesswork and fewer end-of-week surprises.',
      '',
      'Start here:',
      '- Set your weekly baon',
      '- Log lunch, fare, snacks, and school spending daily',
      '- Check your remaining balance before adding extras',
      '- Keep a small weekly savings target visible',
      '',
      'Sample weekly split for PHP 4,000:',
      '- Food: PHP 1,450',
      '- Fare: PHP 900',
      '- School: PHP 850',
      '- Flex money: PHP 450',
      '- Savings: PHP 350',
      '',
      'BaonBrain helps you catch risky spending patterns before Thursday panic hits.'
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'BaonBrain-Starter-Guide.txt';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  downloadButtons.forEach((downloadBtn) => {
    downloadBtn.addEventListener('click', triggerDownload);
  });
}

const liveCard = document.querySelector('.preview-card.main');
const remainingAllowance = document.getElementById('remaining-allowance');
const totalAllowance = document.getElementById('total-allowance');
const spentAmount = document.getElementById('spent-amount');
const savedAmount = document.getElementById('saved-amount');
const progressBar = document.getElementById('progress-bar');
const statusPill = document.getElementById('risk-pill');
const previewNote = document.getElementById('preview-note');
const lastAction = document.getElementById('last-action');
const lastActionDetail = document.getElementById('last-action-detail');
const forecastText = document.getElementById('forecast-text');
const forecastDetail = document.getElementById('forecast-detail');
const simulatorButtons = document.querySelectorAll('.preview-action');

if (
  liveCard &&
  remainingAllowance &&
  totalAllowance &&
  spentAmount &&
  savedAmount &&
  progressBar &&
  statusPill &&
  previewNote &&
  lastAction &&
  lastActionDetail &&
  forecastText &&
  forecastDetail &&
  simulatorButtons.length
) {
  const moneyFormatter = new Intl.NumberFormat('en-PH');
  const formatMoney = (value) => `PHP ${moneyFormatter.format(Math.round(value))}`;
  const baseState = {
    total: 4000,
    spent: 800,
    lastAction: 'PHP 120 lunch',
    lastActionDetail: 'Saved instantly'
  };
  const state = { ...baseState };
  const savingsBaseline = 2750;
  const baseNote = 'One day of tracking shows the pattern.';
  const baseForecast = {
    title: 'You may run out by Thursday.',
    detail: 'Watch snacks this week.'
  };
  let updateTimer;

  const getRisk = (remainingRaw) => {
    if (remainingRaw <= 0) {
      return { label: 'Overspending', tone: 'danger' };
    }

    const ratio = remainingRaw / state.total;
    if (ratio >= 0.7) {
      return { label: 'Low risk', tone: 'low' };
    }
    if (ratio >= 0.45) {
      return { label: 'Watch closely', tone: 'watch' };
    }
    if (ratio >= 0.2) {
      return { label: 'Tight budget', tone: 'tight' };
    }
    return { label: 'Overspending', tone: 'danger' };
  };

  const getForecast = (remainingRaw, actionLabel) => {
    if (remainingRaw <= 0) {
      return {
        title: 'Week limit reached.',
        detail: `${actionLabel} pushed you over.`
      };
    }

    const ratio = remainingRaw / state.total;
    if (ratio >= 0.7) {
      return {
        title: 'Thursday still looks safe.',
        detail: `${actionLabel} still leaves room.`
      };
    }
    if (ratio >= 0.45) {
      return {
        title: 'Watch the next few days.',
        detail: 'Snacks and fare add up fast.'
      };
    }
    if (ratio >= 0.2) {
      return {
        title: 'Budget is getting tight.',
        detail: 'Slow down before Wednesday.'
      };
    }
    return {
      title: 'Almost out for the week.',
      detail: 'Pause extras for now.'
    };
  };

  const renderSimulator = ({ note = baseNote, forecast = baseForecast, animate = true } = {}) => {
    const remainingRaw = state.total - state.spent;
    const remaining = Math.max(0, remainingRaw);
    const overspent = Math.max(0, -remainingRaw);
    const saved = Math.max(0, remaining - savingsBaseline);
    const risk = getRisk(remainingRaw);

    totalAllowance.textContent = formatMoney(state.total);
    spentAmount.textContent = formatMoney(state.spent);
    remainingAllowance.textContent = formatMoney(remaining);
    savedAmount.textContent = formatMoney(saved);
    progressBar.style.width = `${Math.min(100, (remaining / state.total) * 100)}%`;
    statusPill.textContent = risk.label;
    liveCard.dataset.risk = risk.tone;
    previewNote.textContent = note;
    lastAction.textContent = state.lastAction;
    lastActionDetail.textContent = state.lastActionDetail;
    forecastText.textContent = forecast.title;
    forecastDetail.textContent = forecast.detail;

    if (animate) {
      liveCard.classList.remove('is-updating');
      void liveCard.offsetWidth;
      liveCard.classList.add('is-updating');
      clearTimeout(updateTimer);
      updateTimer = setTimeout(() => liveCard.classList.remove('is-updating'), 260);
    }

    if (overspent > 0) {
      previewNote.textContent = `You are over by ${formatMoney(overspent)}.`;
    }
  };

  simulatorButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.reset === 'true') {
        Object.assign(state, baseState);
        renderSimulator({ note: baseNote, forecast: baseForecast });
        return;
      }

      const spend = Number(button.dataset.spend || 0);
      const label = button.dataset.label || button.textContent.trim();
      state.spent += spend;
      state.lastAction = button.textContent.trim();
      state.lastActionDetail = 'Saved instantly';

      const remainingRaw = state.total - state.spent;
      const note = remainingRaw <= 0
        ? `You are over by ${formatMoney(Math.abs(remainingRaw))}.`
        : `${label} logged. Left: ${formatMoney(remainingRaw)}.`;

      renderSimulator({
        note,
        forecast: getForecast(remainingRaw, label)
      });
    });
  });

  renderSimulator({ note: baseNote, forecast: baseForecast, animate: false });
}

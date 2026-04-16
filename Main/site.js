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

const moneyFormatter = new Intl.NumberFormat('en-PH');
const formatMoney = (value) => `PHP ${moneyFormatter.format(Math.round(value))}`;
const OVERVIEW_STORAGE_KEY = 'baonbrain-overview-state';
const SIMULATOR_STORAGE_KEY = 'baonbrain-simulator-state';

let syncOverviewFromSimulator = null;

const overviewElements = {
  incomeTracked: document.getElementById('overview-income-tracked'),
  totalSpent: document.getElementById('overview-total-spent'),
  remaining: document.getElementById('overview-remaining'),
  forecastAmount: document.getElementById('overview-forecast-amount'),
  balanceStatus: document.getElementById('overview-balance-status'),
  ringChart: document.getElementById('overview-ring-chart'),
  ringLabel: document.getElementById('overview-ring-label'),
  insightText: document.getElementById('overview-insight-text'),
  bestDay: document.getElementById('overview-best-day'),
  alerts: document.getElementById('overview-alerts'),
  trend: document.getElementById('overview-trend'),
  incomeStatus: document.getElementById('overview-income-status'),
  incomeLabel1: document.getElementById('overview-income-label-1'),
  incomeValue1: document.getElementById('overview-income-value-1'),
  incomeLabel2: document.getElementById('overview-income-label-2'),
  incomeValue2: document.getElementById('overview-income-value-2'),
  incomeLabel3: document.getElementById('overview-income-label-3'),
  incomeValue3: document.getElementById('overview-income-value-3'),
  incomeTotal: document.getElementById('overview-income-total'),
  expenseStatus: document.getElementById('overview-expense-status'),
  expenseFood: document.getElementById('overview-expense-food'),
  expenseFare: document.getElementById('overview-expense-fare'),
  expenseSchool: document.getElementById('overview-expense-school'),
  expenseTotal: document.getElementById('overview-expense-total'),
  budgetStatus: document.getElementById('overview-budget-status'),
  budgetFoodPercent: document.getElementById('overview-budget-food-percent'),
  budgetFoodBar: document.getElementById('overview-budget-food-bar'),
  budgetFarePercent: document.getElementById('overview-budget-fare-percent'),
  budgetFareBar: document.getElementById('overview-budget-fare-bar'),
  budgetSchoolPercent: document.getElementById('overview-budget-school-percent'),
  budgetSchoolBar: document.getElementById('overview-budget-school-bar'),
  budgetRemaining: document.getElementById('overview-budget-remaining'),
  goalRing: document.getElementById('overview-goal-ring'),
  goalPercent: document.getElementById('overview-goal-percent'),
  goalTarget: document.getElementById('overview-goal-target'),
  goalSaved: document.getElementById('overview-goal-saved'),
  goalEntries: document.getElementById('overview-goal-entries'),
  savingsStatus: document.getElementById('overview-savings-status'),
  forecastStatus: document.getElementById('overview-forecast-status'),
  forecastEstimate: document.getElementById('overview-forecast-estimate'),
  forecastCategory: document.getElementById('overview-forecast-category'),
  forecastDaily: document.getElementById('overview-forecast-daily'),
  forecastRisk: document.getElementById('overview-forecast-risk'),
  weeklyBars: Array.from(document.querySelectorAll('[data-overview-day]'))
};

if (
  overviewElements.incomeTracked &&
  overviewElements.totalSpent &&
  overviewElements.remaining &&
  overviewElements.forecastAmount &&
  overviewElements.balanceStatus &&
  overviewElements.ringChart &&
  overviewElements.ringLabel &&
  overviewElements.insightText &&
  overviewElements.bestDay &&
  overviewElements.alerts &&
  overviewElements.trend &&
  overviewElements.incomeStatus &&
  overviewElements.incomeLabel1 &&
  overviewElements.incomeValue1 &&
  overviewElements.incomeLabel2 &&
  overviewElements.incomeValue2 &&
  overviewElements.incomeLabel3 &&
  overviewElements.incomeValue3 &&
  overviewElements.incomeTotal &&
  overviewElements.expenseStatus &&
  overviewElements.expenseFood &&
  overviewElements.expenseFare &&
  overviewElements.expenseSchool &&
  overviewElements.expenseTotal &&
  overviewElements.budgetStatus &&
  overviewElements.budgetFoodPercent &&
  overviewElements.budgetFoodBar &&
  overviewElements.budgetFarePercent &&
  overviewElements.budgetFareBar &&
  overviewElements.budgetSchoolPercent &&
  overviewElements.budgetSchoolBar &&
  overviewElements.budgetRemaining &&
  overviewElements.goalRing &&
  overviewElements.goalPercent &&
  overviewElements.goalTarget &&
  overviewElements.goalSaved &&
  overviewElements.goalEntries &&
  overviewElements.savingsStatus &&
  overviewElements.forecastStatus &&
  overviewElements.forecastEstimate &&
  overviewElements.forecastCategory &&
  overviewElements.forecastDaily &&
  overviewElements.forecastRisk &&
  overviewElements.weeklyBars.length === 7
) {
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const categoryColors = {
    Food: '#4d7374',
    Fare: '#b08a52',
    School: '#6d9192'
  };
  const baseOverviewState = {
    summaryIncome: 4000,
    baseForecastRemaining: 1940,
    activeDayIndex: 2,
    incomeRecords: [
      { label: 'Weekly baon', amount: 4000 },
      { label: 'Side gig', amount: 650 },
      { label: 'Extra cash', amount: 200 }
    ],
    expenses: {
      Food: 540,
      Fare: 280,
      School: 460
    },
    budgets: {
      Food: 750,
      Fare: 580,
      School: 1300
    },
    weeklySpending: [170, 210, 120, 250, 200, 150, 180],
    savings: {
      target: 10000,
      saved: 3200,
      entries: 8
    }
  };

  const loadStoredOverviewState = () => {
    try {
      const raw = window.localStorage.getItem(OVERVIEW_STORAGE_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      if (!Array.isArray(parsed.incomeRecords) || parsed.incomeRecords.length !== 3) return null;
      if (!Array.isArray(parsed.weeklySpending) || parsed.weeklySpending.length !== 7) return null;
      if (!parsed.expenses || !parsed.budgets || !parsed.savings) return null;

      return {
        summaryIncome: Number(parsed.summaryIncome) || baseOverviewState.summaryIncome,
        baseForecastRemaining: Number(parsed.baseForecastRemaining) || baseOverviewState.baseForecastRemaining,
        activeDayIndex: Number.isInteger(parsed.activeDayIndex) ? parsed.activeDayIndex : baseOverviewState.activeDayIndex,
        incomeRecords: parsed.incomeRecords.map((entry, index) => ({
          label: typeof entry.label === 'string' ? entry.label : baseOverviewState.incomeRecords[index].label,
          amount: Number(entry.amount) || 0
        })),
        expenses: {
          Food: Number(parsed.expenses.Food) || 0,
          Fare: Number(parsed.expenses.Fare) || 0,
          School: Number(parsed.expenses.School) || 0
        },
        budgets: {
          Food: Number(parsed.budgets.Food) || baseOverviewState.budgets.Food,
          Fare: Number(parsed.budgets.Fare) || baseOverviewState.budgets.Fare,
          School: Number(parsed.budgets.School) || baseOverviewState.budgets.School
        },
        weeklySpending: parsed.weeklySpending.map((amount) => Number(amount) || 0),
        savings: {
          target: Number(parsed.savings.target) || baseOverviewState.savings.target,
          saved: Number(parsed.savings.saved) || 0,
          entries: Number(parsed.savings.entries) || 0
        }
      };
    } catch {
      return null;
    }
  };

  const saveOverviewState = (state) => {
    try {
      window.localStorage.setItem(OVERVIEW_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage write failures.
    }
  };

  const cloneOverviewState = (source) => ({
    summaryIncome: source.summaryIncome,
    baseForecastRemaining: source.baseForecastRemaining,
    activeDayIndex: source.activeDayIndex,
    incomeRecords: source.incomeRecords.map((entry) => ({ ...entry })),
    expenses: { ...source.expenses },
    budgets: { ...source.budgets },
    weeklySpending: [...source.weeklySpending],
    savings: { ...source.savings }
  });

  const overviewState = loadStoredOverviewState() || cloneOverviewState(baseOverviewState);
  const baseSpentTotal = Object.values(baseOverviewState.expenses).reduce((sum, amount) => sum + amount, 0);

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const getForecastStatus = (remaining, totalIncome) => {
    const ratio = totalIncome > 0 ? remaining / totalIncome : 0;

    if (remaining <= 0) return 'Overspending';
    if (ratio >= 0.55) return 'Low risk';
    if (ratio >= 0.35) return 'Watch closely';
    if (ratio >= 0.18) return 'Tight budget';
    return 'High risk';
  };

  const getTrendLabel = (weeklySpending) => {
    const firstHalf = weeklySpending.slice(0, 3).reduce((sum, amount) => sum + amount, 0) / 3;
    const lastHalf = weeklySpending.slice(-3).reduce((sum, amount) => sum + amount, 0) / 3;
    const difference = lastHalf - firstHalf;

    if (difference >= 30) return 'Rising';
    if (difference <= -30) return 'Cooling';
    return 'Steady';
  };

  const renderOverview = () => {
    const totalSpent = Object.values(overviewState.expenses).reduce((sum, amount) => sum + amount, 0);
    const remaining = Math.max(0, overviewState.summaryIncome - totalSpent);
    const incomeTotal = overviewState.incomeRecords.reduce((sum, entry) => sum + entry.amount, 0);
    const weeklyMax = Math.max(...overviewState.weeklySpending, 1);
    const lowestSpend = Math.min(...overviewState.weeklySpending);
    const bestDayIndex = overviewState.weeklySpending.indexOf(lowestSpend);
    const sortedCategories = Object.entries(overviewState.expenses).sort((a, b) => b[1] - a[1]);
    const [topCategory, topAmount] = sortedCategories[0];
    const [secondCategory] = sortedCategories[1];
    const [thirdCategory] = sortedCategories[2];
    const topShare = Math.round((topAmount / Math.max(totalSpent, 1)) * 100);
    const totalBudget = Object.values(overviewState.budgets).reduce((sum, amount) => sum + amount, 0);
    const totalBudgetUsage = Math.round((totalSpent / Math.max(totalBudget, 1)) * 100);
    const projectedDailySpend = Math.round(totalSpent / Math.max(overviewState.weeklySpending.length, 1));
    const forecastPenalty = Math.round((totalSpent - baseSpentTotal) * 0.85);
    const forecastEstimate = Math.max(0, overviewState.baseForecastRemaining - forecastPenalty);
    const forecastRisk = clamp(Math.round((totalSpent / Math.max(overviewState.summaryIncome, 1)) * 38), 8, 98);
    const budgetWatchCount = Object.entries(overviewState.expenses).reduce((count, [category, amount]) => {
      const usage = amount / Math.max(overviewState.budgets[category], 1);
      return count + (usage >= 0.7 ? 1 : 0);
    }, 0);
    const alertsCount = budgetWatchCount + (remaining <= overviewState.summaryIncome * 0.2 ? 1 : 0);
    const ringColor = categoryColors[topCategory] || categoryColors.Food;
    const balanceStatus = (Math.max(...overviewState.weeklySpending) - lowestSpend) <= 140 ? 'Balanced' : 'Uneven';
    const forecastStatus = getForecastStatus(remaining, overviewState.summaryIncome);
    const goalProgress = clamp(Math.round((overviewState.savings.saved / Math.max(overviewState.savings.target, 1)) * 100), 0, 100);

    overviewElements.incomeTracked.textContent = formatMoney(overviewState.summaryIncome);
    overviewElements.totalSpent.textContent = formatMoney(totalSpent);
    overviewElements.remaining.textContent = formatMoney(remaining);
    overviewElements.forecastAmount.textContent = formatMoney(forecastEstimate);
    overviewElements.balanceStatus.textContent = balanceStatus;

    overviewElements.weeklyBars.forEach((bar, index) => {
      const daySpend = overviewState.weeklySpending[index] || 0;
      bar.style.height = `${Math.max(22, Math.round((daySpend / weeklyMax) * 100))}%`;
      bar.dataset.currency = 'PHP';
      bar.dataset.value = moneyFormatter.format(Math.round(daySpend));
      bar.dataset.peak = daySpend === weeklyMax && weeklyMax > 0 ? 'true' : 'false';
      bar.title = `${dayLabels[index]}: ${formatMoney(daySpend)}`;
    });

    overviewElements.ringChart.style.background = [
      'radial-gradient(circle at center, rgba(255,255,255,.96) 0 39%, transparent 40%)',
      `conic-gradient(${ringColor} 0 ${topShare}%, rgba(19,35,30,.08) ${topShare}% 100%)`
    ].join(', ');
    overviewElements.ringLabel.innerHTML = `${topShare}%<br>${topCategory}`;
    overviewElements.insightText.textContent = `${topCategory.toLowerCase()}, ${secondCategory.toLowerCase()}, and ${thirdCategory.toLowerCase()} lead this week.`;
    overviewElements.bestDay.textContent = dayLabels[bestDayIndex];
    overviewElements.alerts.textContent = alertsCount === 0 ? 'No alerts' : alertsCount === 1 ? '1 watch' : `${alertsCount} watches`;
    overviewElements.trend.textContent = getTrendLabel(overviewState.weeklySpending);

    overviewElements.incomeStatus.textContent = `${overviewState.incomeRecords.length} records`;
    overviewElements.incomeLabel1.textContent = overviewState.incomeRecords[0].label;
    overviewElements.incomeValue1.textContent = formatMoney(overviewState.incomeRecords[0].amount);
    overviewElements.incomeLabel2.textContent = overviewState.incomeRecords[1].label;
    overviewElements.incomeValue2.textContent = formatMoney(overviewState.incomeRecords[1].amount);
    overviewElements.incomeLabel3.textContent = overviewState.incomeRecords[2].label;
    overviewElements.incomeValue3.textContent = formatMoney(overviewState.incomeRecords[2].amount);
    overviewElements.incomeTotal.textContent = formatMoney(incomeTotal);

    overviewElements.expenseStatus.textContent = `${topCategory}-led`;
    overviewElements.expenseFood.textContent = formatMoney(overviewState.expenses.Food);
    overviewElements.expenseFare.textContent = formatMoney(overviewState.expenses.Fare);
    overviewElements.expenseSchool.textContent = formatMoney(overviewState.expenses.School);
    overviewElements.expenseTotal.textContent = formatMoney(totalSpent);

    const foodUsage = clamp(Math.round((overviewState.expenses.Food / Math.max(overviewState.budgets.Food, 1)) * 100), 0, 100);
    const fareUsage = clamp(Math.round((overviewState.expenses.Fare / Math.max(overviewState.budgets.Fare, 1)) * 100), 0, 100);
    const schoolUsage = clamp(Math.round((overviewState.expenses.School / Math.max(overviewState.budgets.School, 1)) * 100), 0, 100);

    overviewElements.budgetStatus.textContent = `${totalBudgetUsage}% used`;
    overviewElements.budgetFoodPercent.textContent = `${foodUsage}%`;
    overviewElements.budgetFoodBar.style.width = `${foodUsage}%`;
    overviewElements.budgetFarePercent.textContent = `${fareUsage}%`;
    overviewElements.budgetFareBar.style.width = `${fareUsage}%`;
    overviewElements.budgetSchoolPercent.textContent = `${schoolUsage}%`;
    overviewElements.budgetSchoolBar.style.width = `${schoolUsage}%`;
    overviewElements.budgetRemaining.textContent = formatMoney(Math.max(0, totalBudget - totalSpent));

    overviewElements.goalRing.style.background = [
      'radial-gradient(circle at center, rgba(255,255,255,.96) 0 44%, transparent 45%)',
      `conic-gradient(#6bb39c 0 ${goalProgress}%, rgba(19,35,30,.08) ${goalProgress}% 100%)`
    ].join(', ');
    overviewElements.goalPercent.textContent = `${goalProgress}%`;
    overviewElements.goalTarget.textContent = formatMoney(overviewState.savings.target);
    overviewElements.goalSaved.textContent = formatMoney(overviewState.savings.saved);
    overviewElements.goalEntries.textContent = String(overviewState.savings.entries);
    overviewElements.savingsStatus.textContent = goalProgress >= 50 ? 'On track' : goalProgress >= 25 ? 'Building up' : 'Starting out';

    overviewElements.forecastStatus.textContent = forecastStatus;
    overviewElements.forecastEstimate.textContent = formatMoney(forecastEstimate);
    overviewElements.forecastCategory.textContent = topCategory;
    overviewElements.forecastDaily.textContent = formatMoney(projectedDailySpend);
    overviewElements.forecastRisk.textContent = `${forecastRisk}%`;

    saveOverviewState(overviewState);
  };

  syncOverviewFromSimulator = ({ spend = 0, label = '', reset = false } = {}) => {
    if (reset) {
      Object.assign(overviewState, cloneOverviewState(baseOverviewState));
      renderOverview();
      return;
    }

    const lowerLabel = label.toLowerCase();
    let category = 'Food';

    if (lowerLabel.includes('fare')) {
      category = 'Fare';
    } else if (lowerLabel.includes('school')) {
      category = 'School';
    }

    overviewState.expenses[category] += spend;
    overviewState.weeklySpending[overviewState.activeDayIndex] += spend;
    renderOverview();
  };

  renderOverview();
}

const liveCard = document.querySelector('.preview-card.main');
const remainingAllowance = document.getElementById('remaining-allowance');
const totalAllowance = document.getElementById('total-allowance');
const spentAmount = document.getElementById('spent-amount');
const savedAmount = document.getElementById('saved-amount');
const progressBar = document.getElementById('progress-bar');
const progressStatus = document.getElementById('progress-status');
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
  progressStatus &&
  statusPill &&
  previewNote &&
  lastAction &&
  lastActionDetail &&
  forecastText &&
  forecastDetail &&
  simulatorButtons.length
) {
  const loadStoredSimulatorState = () => {
    try {
      const raw = window.localStorage.getItem(SIMULATOR_STORAGE_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;

      return {
        total: Number(parsed.total) || 4000,
        spent: Number(parsed.spent) || 800,
        lastAction: typeof parsed.lastAction === 'string' ? parsed.lastAction : 'PHP 120 lunch',
        lastActionDetail: typeof parsed.lastActionDetail === 'string' ? parsed.lastActionDetail : 'Saved instantly'
      };
    } catch {
      return null;
    }
  };

  const saveSimulatorState = (state) => {
    try {
      window.localStorage.setItem(SIMULATOR_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage write failures.
    }
  };

  const baseState = {
    total: 4000,
    spent: 800,
    lastAction: 'PHP 120 lunch',
    lastActionDetail: 'Saved instantly'
  };
  const state = { ...baseState, ...(loadStoredSimulatorState() || {}) };
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
    const remainingPercent = state.total > 0 ? Math.max(0, Math.round((remaining / state.total) * 100)) : 0;

    totalAllowance.textContent = formatMoney(state.total);
    spentAmount.textContent = formatMoney(state.spent);
    remainingAllowance.textContent = formatMoney(remaining);
    savedAmount.textContent = formatMoney(saved);
    progressBar.style.width = `${Math.min(100, remainingPercent)}%`;
    progressStatus.textContent = overspent > 0 ? `${formatMoney(overspent)} over` : `${remainingPercent}% left`;
    statusPill.textContent = risk.label;
    liveCard.dataset.risk = risk.tone;
    previewNote.textContent = note;
    lastAction.textContent = state.lastAction;
    lastActionDetail.textContent = state.lastActionDetail;
    forecastText.textContent = forecast.title;
    forecastDetail.textContent = forecast.detail;
    saveSimulatorState(state);

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
        try {
          window.localStorage.removeItem(SIMULATOR_STORAGE_KEY);
          window.localStorage.removeItem(OVERVIEW_STORAGE_KEY);
        } catch {
          // Ignore storage removal failures.
        }
        if (syncOverviewFromSimulator) {
          syncOverviewFromSimulator({ reset: true });
        }
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

      if (syncOverviewFromSimulator) {
        syncOverviewFromSimulator({ spend, label });
      }
    });
  });

  renderSimulator({ note: baseNote, forecast: baseForecast, animate: false });
}

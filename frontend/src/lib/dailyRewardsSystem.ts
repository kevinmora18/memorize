export interface DailyRewardDay {
  day: number;
  coins: number;
  gems: number;
  xp: number;
  title: string;
  badge?: string;
  isSpecial?: boolean;
}

export const SEVEN_DAYS_REWARDS: DailyRewardDay[] = [
  { day: 1, coins: 150, gems: 5, xp: 50, title: 'Día 1: Iniciación' },
  { day: 2, coins: 250, gems: 10, xp: 100, title: 'Día 2: Enfoque' },
  { day: 3, coins: 350, gems: 20, xp: 150, title: 'Día 3: Chispa', badge: 'GEMAS' },
  { day: 4, coins: 500, gems: 25, xp: 200, title: 'Día 4: Sinapsis' },
  { day: 5, coins: 700, gems: 35, xp: 250, title: 'Día 5: Memoria Pro', badge: 'BONO' },
  { day: 6, coins: 1000, gems: 50, xp: 350, title: 'Día 6: Mente Maestra' },
  { day: 7, coins: 2000, gems: 100, xp: 600, title: 'Día 7: Corona Legendaria', isSpecial: true, badge: 'ÉPICO 👑' },
];

const STORAGE_KEY = 'memorize_daily_login_rewards';

export interface DailyRewardsState {
  currentDayStreak: number;
  lastClaimDate: string | null;
  totalClaimed: number;
}

export function loadDailyRewardsState(): DailyRewardsState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {}
  return {
    currentDayStreak: 1,
    lastClaimDate: null,
    totalClaimed: 0,
  };
}

export function saveDailyRewardsState(state: DailyRewardsState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {}
}

export function isDailyRewardAvailable(): boolean {
  const state = loadDailyRewardsState();
  if (!state.lastClaimDate) return true;

  const last = new Date(state.lastClaimDate);
  const now = new Date();

  // Comprobar si ya es un día diferente
  return (
    now.getFullYear() > last.getFullYear() ||
    now.getMonth() > last.getMonth() ||
    now.getDate() > last.getDate()
  );
}

export function claimTodayReward(): { reward: DailyRewardDay; nextState: DailyRewardsState } {
  const state = loadDailyRewardsState();
  const rewardIndex = Math.min(SEVEN_DAYS_REWARDS.length - 1, state.currentDayStreak - 1);
  const reward = SEVEN_DAYS_REWARDS[rewardIndex];

  let nextStreak = state.currentDayStreak + 1;
  if (nextStreak > 7) {
    nextStreak = 1; // Reinicia el ciclo de 7 días
  }

  const nextState: DailyRewardsState = {
    currentDayStreak: nextStreak,
    lastClaimDate: new Date().toISOString(),
    totalClaimed: state.totalClaimed + 1,
  };

  saveDailyRewardsState(nextState);
  return { reward, nextState };
}

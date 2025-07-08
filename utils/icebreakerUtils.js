const fs = require('fs');
const path = require('path');
const icebreakers = require('../icebreakers');

const STATS_FILE = path.join(__dirname, '../data/icebreakerStats.json');

function getMonthName() {
  return new Date().toLocaleString('default', { month: 'long' }).toLowerCase();
}

function loadStats() {
  if (!fs.existsSync(STATS_FILE)) {
    return { year: new Date().getFullYear(), month: getMonthName(), recentQuestions: [], usageCount: {} };
  }
  const data = JSON.parse(fs.readFileSync(STATS_FILE, 'utf-8'));

  return {
    year: data.year || new Date().getFullYear(),
    month: data.month || getMonthName(),
    recentQuestions: data.recentQuestions || [],
    usageCount: data.usageCount || {}
  };

}

function saveStats(stats) {
  fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
}

// Helper function to get a random icebreaker
function getRandomIcebreaker() {
  const stats = loadStats();
  const currentMonth = getMonthName();
  const currentYear = new Date().getFullYear();

  /// Check if the month or year has changed
  if (stats.month !== currentMonth || stats.year !== currentYear) {
    stats.month = currentMonth;
    stats.year = currentYear;
    stats.recentQuestions = [];
  }

  const month = currentMonth;
  const general = icebreakers.general || [];
  const monthly = icebreakers.monthly?.[month] || [];
  const anime = icebreakers.anime || [];
  const games = icebreakers.games || [];
  const daily = icebreakers.daily || [];

  const allQuestions = [...general, ...monthly, ...anime, ...games, ...daily];

  const available = allQuestions.filter(q => !stats.recentQuestions.includes(q));
  const pool = available.length > 0 ? available : allQuestions;

  const question = pool[Math.floor(Math.random() * pool.length)];

  stats.recentQuestions.push(question);
  if (stats.recentQuestions.length > 25) stats.recentQuestions.shift();

  stats.usageCount[question] = (stats.usageCount[question] || 0) + 1;

  saveStats(stats);
  return question;
}

module.exports = { getRandomIcebreaker };

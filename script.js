'use strict';

// Selecting Elements
const player0El = document.querySelector('.player--0');
const player1El = document.querySelector('.player--1');

const score0El = document.getElementById('score--0');
const score1El = document.getElementById('score--1');

const current0El = document.getElementById('current--0');
const current1El = document.getElementById('current--1');

const diceEl = document.querySelector('.dice');

const btnNew = document.querySelector('.btn--new');
const btnRoll = document.querySelector('.btn--roll');
const btnHold = document.querySelector('.btn--hold');
const btnSound = document.querySelector('.btn--sound');

const targetScoreEl = document.getElementById('target-score');
const historyEl = document.getElementById('roll-history');
const messageEl = document.getElementById('message');

let scores, currentScore, activePlayer, playing;
let rollHistory = [];
let soundEnabled = true;

// SOUND EFFECTS
const playSound = function (frequency, duration = 0.15) {
  if (!soundEnabled) return;

  const audioContext = new (window.AudioContext || window.webkitAudioContext)();

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);

  gainNode.gain.exponentialRampToValueAtTime(
    0.001,
    audioContext.currentTime + duration,
  );

  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);

  oscillator.onended = () => audioContext.close();
};

// INITIALIZE GAME
const init = function () {
  scores = [0, 0];
  currentScore = 0;
  activePlayer = 0;
  playing = true;
  rollHistory = [];

  score0El.textContent = 0;
  score1El.textContent = 0;

  current0El.textContent = 0;
  current1El.textContent = 0;

  diceEl.classList.add('hidden');

  player0El.classList.remove('player--winner');
  player1El.classList.remove('player--winner');

  player0El.classList.add('player--active');
  player1El.classList.remove('player--active');

  historyEl.innerHTML = '<li>No rolls yet</li>';

  messageEl.textContent = "Player 1's turn!";

  btnRoll.disabled = false;
  btnHold.disabled = false;
};

// SWITCH PLAYER
const switchPlayer = function () {
  document.getElementById(`current--${activePlayer}`).textContent = 0;

  currentScore = 0;

  activePlayer = activePlayer === 0 ? 1 : 0;

  player0El.classList.toggle('player--active');
  player1El.classList.toggle('player--active');

  messageEl.textContent = `Player ${activePlayer + 1}'s turn!`;

  playSound(300);
};

// UPDATE HISTORY
const updateHistory = function (dice) {
  rollHistory.unshift(dice);

  // Keep only the last 5 rolls
  rollHistory = rollHistory.slice(0, 5);

  historyEl.innerHTML = rollHistory
    .map((roll, index) => `<li>${index + 1}. 🎲 ${roll}</li>`)
    .join('');
};

// ROLL DICE
btnRoll.addEventListener('click', function () {
  if (!playing) return;

  const dice = Math.trunc(Math.random() * 6) + 1;

  diceEl.classList.remove('hidden');
  diceEl.src = `dice-${dice}.png`;

  updateHistory(dice);

  playSound(500 + dice * 100);

  if (dice !== 1) {
    currentScore += dice;

    document.getElementById(`current--${activePlayer}`).textContent =
      currentScore;
  } else {
    messageEl.textContent = `Player ${activePlayer + 1} rolled a 1!`;

    switchPlayer();
  }
});

// HOLD SCORE
btnHold.addEventListener('click', function () {
  if (!playing) return;

  scores[activePlayer] += currentScore;

  document.getElementById(`score--${activePlayer}`).textContent =
    scores[activePlayer];

  const winningScore = Number(targetScoreEl.value);

  if (scores[activePlayer] >= winningScore) {
    playing = false;

    diceEl.classList.add('hidden');

    document
      .querySelector(`.player--${activePlayer}`)
      .classList.add('player--winner');

    document
      .querySelector(`.player--${activePlayer}`)
      .classList.remove('player--active');

    messageEl.textContent = `🏆 Player ${activePlayer + 1} Wins!`;

    btnRoll.disabled = true;
    btnHold.disabled = true;

    playSound(900, 0.5);
  } else {
    switchPlayer();
  }
});

// SOUND TOGGLE
btnSound.addEventListener('click', function () {
  soundEnabled = !soundEnabled;

  btnSound.textContent = soundEnabled ? '🔊 Sound On' : '🔇 Sound Off';
});

// NEW GAME
btnNew.addEventListener('click', init);

// START GAME
init();

let count = 0;
let highestCount = 0;
let resetClickCount = 0;
let resetTimeout;

const container = document.getElementById('container');
const woodfish = document.getElementById('woodfish');
const countDisplay = document.getElementById('count');
const resetButton = document.getElementById('reset');
const celebration = document.getElementById('celebration');
const hitSound = new Audio(chrome.runtime.getURL('hit.mp3'));

function updateCount() {
  countDisplay.textContent = count;
  chrome.storage.local.set({count: count, highestCount: Math.max(count, highestCount)});
  chrome.runtime.sendMessage({action: "updateCount", count: count});
  
  if (count % 100 === 0 && count !== 0) {
    showCelebration();
  }
}

function showCelebration() {
  celebration.classList.remove('hidden');
  setTimeout(() => {
    celebration.classList.add('hidden');
  }, 2000);
}

woodfish.addEventListener('click', () => {
  count++;
  hitSound.play();
  updateCount();
});

resetButton.addEventListener('click', () => {
  resetClickCount++;
  clearTimeout(resetTimeout);
  
  resetTimeout = setTimeout(() => {
    resetClickCount = 0;
  }, 1000);

  if (resetClickCount === 3) {
    count = highestCount;
  } else {
    count = 0;
  }
  updateCount();
});

chrome.storage.local.get(['count', 'highestCount'], (result) => {
  count = result.count || 0;
  highestCount = result.highestCount || 0;
  updateCount();
});
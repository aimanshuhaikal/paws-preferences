const cardContainer = document.getElementById('card-container');
const summarySection = document.getElementById('summary');
const summaryText = document.getElementById('summary-text');
const likedGallery = document.getElementById('liked-gallery');

const TOTAL_CATS = 10;
const likedCats = [];
const catUrls = [];

// make 10 random cat URLs
for (let i = 0; i < TOTAL_CATS; i++) {
  const url = 'https://cataas.com/cat?ts=' + Date.now() + '-' + i;
  catUrls.push(url);
}

// create cards
catUrls.forEach((catUrl, index) => {
  const card = document.createElement('div');
  card.className = 'card';
  card.style.zIndex = index;
  card.style.setProperty('--i', index);

  const img = document.createElement('img');
  img.src = catUrl;

  card.appendChild(img);
  cardContainer.appendChild(card);
});

// helper: get current top card
function getTopCard() {
  const cards = cardContainer.querySelectorAll('.card');
  if (cards.length === 0) return null;
  return cards[cards.length - 1];
}

// show summary when all cards gone
function showSummary() {
  cardContainer.style.display = 'none';
  summarySection.hidden = false;

  summaryText.textContent = `You liked ${likedCats.length} out of ${TOTAL_CATS} cats.`;

  likedGallery.innerHTML = '';
  likedCats.forEach(url => {
    const img = document.createElement('img');
    img.src = url;
    likedGallery.appendChild(img);
  });
}

// swipe handling
let startX = 0;
let currentCard = null;

function pointerDown(e) {
  currentCard = getTopCard();
  if (!currentCard) return;

  startX = e.clientX || e.touches?.[0]?.clientX;
  currentCard.style.transition = 'none';

  window.addEventListener('pointermove', pointerMove);
  window.addEventListener('pointerup', pointerUp);
  window.addEventListener('touchmove', pointerMove);
  window.addEventListener('touchend', pointerUp);
}

function pointerMove(e) {
  if (!currentCard) return;

  const x = e.clientX || e.touches?.[0]?.clientX;
  const dx = x - startX;

  const rotation = dx * 0.05;
  currentCard.style.transform = `translateX(${dx}px) rotate(${rotation}deg)`;
}

function pointerUp(e) {
  if (!currentCard) return;

  let endX;
  if (e.type === 'pointerup') {
    endX = e.clientX;
  } else if (e.type === 'touchend') {
    endX = e.changedTouches[0].clientX;
  }

  const dx = endX - startX;
  const threshold = 100;

  currentCard.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';

  if (dx > threshold) {
    // like (right)
    const img = currentCard.querySelector('img');
    likedCats.push(img.src);
    currentCard.style.transform = 'translateX(400px) rotate(20deg)';
    currentCard.style.opacity = '0';
  } else if (dx < -threshold) {
    // dislike (left)
    currentCard.style.transform = 'translateX(-400px) rotate(-20deg)';
    currentCard.style.opacity = '0';
  } else {
    // back to center
    currentCard.style.transform = 'translateX(0) rotate(0deg)';
    currentCard = null;
    removeMoveListeners();
    return;
  }

  setTimeout(() => {
    currentCard.remove();
    currentCard = null;
    if (!getTopCard()) {
      showSummary();
    }
  }, 300);

  removeMoveListeners();
}

function removeMoveListeners() {
  window.removeEventListener('pointermove', pointerMove);
  window.removeEventListener('pointerup', pointerUp);
  window.removeEventListener('touchmove', pointerMove);
  window.removeEventListener('touchend', pointerUp);
}

// listen on container (for mouse + touch)
cardContainer.addEventListener('pointerdown', pointerDown);
cardContainer.addEventListener('touchstart', pointerDown);

const form = document.querySelector('#dragon-form');
const preview = document.querySelector('#dragon-preview');
const nameOutput = document.querySelector('#preview-name');
const colorOutput = document.querySelector('#preview-color');
const homeOutput = document.querySelector('#preview-home');
const powerOutput = document.querySelector('#preview-power');

function updateDragon() {
  const data = new FormData(form);
  const name = String(data.get('name') || '').trim() || 'My Dragon';
  const color = String(data.get('color') || 'coral');
  nameOutput.textContent = name;
  colorOutput.textContent = `${color.toUpperCase()} DRAGON`;
  homeOutput.textContent = String(data.get('home'));
  powerOutput.textContent = String(data.get('power'));
  preview.dataset.color = color;
}

form.addEventListener('input', updateDragon);
form.addEventListener('change', updateDragon);
form.addEventListener('submit', (event) => event.preventDefault());

const surprises = [
  ['Noodle', 'mint', 'Moon Forest', 'Bubble Magic'],
  ['Spark', 'gold', 'Cloud Castle', 'Star Sparks'],
  ['Pickles', 'purple', 'Crystal Cave', 'Super Speed'],
  ['Fizz', 'coral', 'Bubble Volcano', 'Rainbow Fire'],
  ['Pebble', 'mint', 'Crystal Cave', 'Star Sparks'],
];
let lastSurprise = -1;

document.querySelector('#surprise-button').addEventListener('click', () => {
  let next = Math.floor(Math.random() * surprises.length);
  if (next === lastSurprise) next = (next + 1) % surprises.length;
  lastSurprise = next;
  const [name, color, home, power] = surprises[next];
  form.elements.name.value = name;
  form.querySelector(`input[name="color"][value="${color}"]`).checked = true;
  form.elements.home.value = home;
  form.elements.power.value = power;
  updateDragon();
});

updateDragon();

const fighterSelect = document.querySelector('#fighter-select');
const dinosaurSelect = document.querySelector('#dinosaur-select');
const arenaGame = document.querySelector('#arena-game');
const arenaStage = document.querySelector('#arena-stage');
const playerUnit = document.querySelector('#player-unit');
const foeUnit = document.querySelector('#foe-unit');
const playerDamage = document.querySelector('#player-damage');
const foeDamage = document.querySelector('#foe-damage');
const impactEffect = document.querySelector('#impact-effect');
const playerHealthBar = document.querySelector('#player-health');
const foeHealthBar = document.querySelector('#foe-health');
const playerHealthNumber = document.querySelector('#player-health-number');
const foeHealthNumber = document.querySelector('#foe-health-number');
const playerLabel = document.querySelector('#player-label');
const foeLabel = document.querySelector('#foe-label');
const playerArt = document.querySelector('#player-art');
const foeArt = document.querySelector('#foe-art');
const opponentIntent = document.querySelector('#opponent-intent');
const moveHint = document.querySelector('#move-hint');
const roundResult = document.querySelector('#round-result');
const playAgain = document.querySelector('#play-again');
const moveButtons = [...document.querySelectorAll('[data-move]')];
const roarCallout = document.querySelector('#roar-callout');
const soundToggle = document.querySelector('#sound-toggle');

const MAX_HEALTH = 6;
const moves = ['attack', 'block', 'special'];
const beats = { attack: 'special', block: 'attack', special: 'block' };
const counterHint = { attack: 'Block stops Attack.', block: 'Special beats Block.', special: 'Attack beats Special.' };
const fighters = {
  trex: { name: 'T. rex', kind: 'dino', idle: 'arena-dino-realistic.png', attack: 'arena-dino-bite.png', special: 'arena-dino-special.png', specialMotion: 'dino-scrape', tells: { attack: 'T. rex is ready to BITE!', block: 'T. rex is BRACING!', special: 'T. rex scrapes the ground before a CHARGE!' } },
  ankylosaurus: { name: 'Ankylosaurus', kind: 'dino', idle: 'arena-ankylosaurus-idle.png', attack: 'arena-ankylosaurus-attack.png', special: 'arena-ankylosaurus-special.png', specialMotion: 'club-smash', tells: { attack: 'Ankylosaurus is ready to BASH!', block: 'Ankylosaurus braces its ARMOR!', special: 'Ankylosaurus raises its TAIL CLUB!' } },
  baryonyx: { name: 'Baryonyx', kind: 'dino', idle: 'arena-baryonyx-idle.png', attack: 'arena-baryonyx-attack.png', special: 'arena-baryonyx-special.png', specialMotion: 'bary-pounce', tells: { attack: 'Baryonyx is ready to SWIPE!', block: 'Baryonyx is BRACING!', special: 'Baryonyx is ready to SNAP!' } },
  knight: { name: 'Knight', kind: 'knight', idle: 'arena-knight-realistic.png', attack: 'arena-knight-slash.png', block: 'arena-knight-block.png', special: 'arena-knight-special.png', specialMotion: 'knight-thrust', tells: { attack: 'Knight is ready to SLASH!', block: 'Knight raises a SHIELD!', special: 'Knight is ready to THRUST!' } },
  mechagodzilla: { name: 'Mechagodzilla', kind: 'mecha', idle: 'arena-mechagodzilla-idle.png', attack: 'arena-mechagodzilla-attack.png', block: 'arena-mechagodzilla-block.png', special: 'arena-mechagodzilla-special.png', specialMotion: 'mecha-beam', tells: { attack: 'Mechagodzilla raises its CLAWS!', block: 'Mechagodzilla braces its ARMOR!', special: 'Mechagodzilla charges its ENERGY BEAM!' } },
};
const game = { player: null, foe: null, playerHealth: MAX_HEALTH, foeHealth: MAX_HEALTH, foeMove: null, over: true, animating: false, impactTimer: null, resolveTimer: null, soundEnabled: true };

function paintHealth(bar, number, health) {
  bar.querySelector('.health-fill').style.width = `${(health / MAX_HEALTH) * 100}%`;
  bar.setAttribute('aria-valuenow', String(health));
  bar.dataset.level = health <= 2 ? 'low' : health <= 4 ? 'medium' : 'high';
  number.textContent = `${health} / ${MAX_HEALTH}`;
}

function showNextMove() {
  game.foeMove = moves[Math.floor(Math.random() * moves.length)];
  opponentIntent.textContent = fighters[game.foe].tells[game.foeMove];
  moveHint.textContent = counterHint[game.foeMove];
}

function paintDamage(unit, badge, health) {
  const hits = MAX_HEALTH - health;
  unit.dataset.damage = String(Math.min(hits, 3));
  badge.textContent = hits ? `${hits} SCUFF${hits === 1 ? '' : 'S'}` : '';
}

function baseArt(fighter) { return `./assets/${fighters[fighter].idle}`; }

function actionArt(fighter, move) {
  return `./assets/${fighters[fighter][move] || fighters[fighter].idle}`;
}

function setActionArt(unit, image, fighter, move) {
  image.src = actionArt(fighter, move);
  if ((fighter === 'knight' || fighter === 'mechagodzilla') && move === 'attack') unit.classList.add('slashing');
  if ((fighter === 'knight' || fighter === 'mechagodzilla') && move === 'block') unit.classList.add('shielding');
}

let roarAudioContext;
function playDinoRoar() {
  if (!game.soundEnabled) return;
  const AudioContextType = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextType) return;
  try {
    roarAudioContext ||= new AudioContextType();
    roarAudioContext.resume();
    const context = roarAudioContext;
    const now = context.currentTime;
    const length = Math.floor(context.sampleRate * 0.72);
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) samples[i] = (Math.random() * 2 - 1) * (1 - i / length);
    const noise = context.createBufferSource();
    noise.buffer = buffer;
    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(780, now);
    filter.frequency.exponentialRampToValueAtTime(180, now + 0.7);
    const noiseGain = context.createGain();
    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.12, now + 0.08);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.72);
    noise.connect(filter).connect(noiseGain).connect(context.destination);
    noise.start(now);
    noise.stop(now + 0.72);
    const growl = context.createOscillator();
    growl.type = 'sawtooth';
    growl.frequency.setValueAtTime(125, now);
    growl.frequency.exponentialRampToValueAtTime(58, now + 0.68);
    const growlGain = context.createGain();
    growlGain.gain.setValueAtTime(0.0001, now);
    growlGain.gain.exponentialRampToValueAtTime(0.035, now + 0.07);
    growlGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
    growl.connect(growlGain).connect(context.destination);
    growl.start(now);
    growl.stop(now + 0.72);
  } catch {
    // The on-screen roar still appears if a browser blocks audio.
  }
}

function clearMotion() {
  clearTimeout(game.impactTimer);
  clearTimeout(game.resolveTimer);
  arenaStage.classList.remove('impact');
  playerUnit.classList.remove('lunge-right', 'lunge-left', 'blocking', 'specialing', 'recoiling-left', 'recoiling-right', 'slashing', 'shielding', 'dino-scrape', 'knight-thrust', 'mecha-beam', 'club-smash', 'bary-pounce');
  foeUnit.classList.remove('lunge-right', 'lunge-left', 'blocking', 'specialing', 'recoiling-left', 'recoiling-right', 'slashing', 'shielding', 'dino-scrape', 'knight-thrust', 'mecha-beam', 'club-smash', 'bary-pounce');
  impactEffect.classList.remove('show');
  roarCallout.classList.remove('show');
  game.animating = false;
}

function startDuel(fighter) {
  if (!fighters[fighter]) return;
  clearMotion();
  game.player = fighter;
  game.foe = fighter === 'knight' ? 'trex' : 'knight';
  game.playerHealth = MAX_HEALTH;
  game.foeHealth = MAX_HEALTH;
  game.over = false;
  fighterSelect.hidden = true;
  dinosaurSelect.hidden = true;
  arenaGame.hidden = false;
  arenaStage.classList.remove('player-won', 'foe-won');
  playerUnit.dataset.kind = fighters[fighter].kind;
  foeUnit.dataset.kind = fighters[game.foe].kind;
  playerUnit.dataset.fighter = fighter;
  foeUnit.dataset.fighter = game.foe;
  playerLabel.textContent = `YOU · ${fighters[fighter].name.toUpperCase()}`;
  foeLabel.textContent = fighters[game.foe].name.toUpperCase();
  playerArt.src = baseArt(fighter);
  playerArt.alt = `Your ${fighters[fighter].name} fighter`;
  foeArt.src = baseArt(game.foe);
  foeArt.alt = `${fighters[game.foe].name} opponent`;
  paintHealth(playerHealthBar, playerHealthNumber, MAX_HEALTH);
  paintHealth(foeHealthBar, foeHealthNumber, MAX_HEALTH);
  paintDamage(playerUnit, playerDamage, MAX_HEALTH);
  paintDamage(foeUnit, foeDamage, MAX_HEALTH);
  roundResult.textContent = 'Choose a move to start the duel!';
  moveButtons.forEach((button) => { button.disabled = false; });
  playAgain.hidden = true;
  showNextMove();
  opponentIntent.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

function takeTurn(playerMove) {
  if (game.over || game.animating) return;
  const foeMove = game.foeMove;
  const outcome = playerMove === foeMove ? 'tie' : beats[playerMove] === foeMove ? 'player' : 'foe';
  clearMotion();
  game.animating = true;
  moveButtons.forEach((button) => { button.disabled = true; });
  arenaStage.classList.remove('player-won', 'foe-won');
  setActionArt(playerUnit, playerArt, game.player, playerMove);
  setActionArt(foeUnit, foeArt, game.foe, foeMove);
  if ((fighters[game.player].kind === 'dino' && playerMove === 'attack') || (fighters[game.foe].kind === 'dino' && foeMove === 'attack')) {
    roarCallout.dataset.side = fighters[game.player].kind === 'dino' ? 'player' : 'foe';
    roarCallout.classList.add('show');
    playDinoRoar();
  }
  if (outcome === 'player') {
    playerUnit.classList.add(playerMove === 'block' ? 'blocking' : playerMove === 'special' ? 'specialing' : 'lunge-right');
    foeUnit.classList.add('recoiling-right');
  } else if (outcome === 'foe') {
    foeUnit.classList.add(foeMove === 'block' ? 'blocking' : foeMove === 'special' ? 'specialing' : 'lunge-left');
    playerUnit.classList.add('recoiling-left');
  } else {
    playerUnit.classList.add(playerMove === 'block' ? 'blocking' : playerMove === 'special' ? 'specialing' : 'lunge-right');
    foeUnit.classList.add(foeMove === 'block' ? 'blocking' : foeMove === 'special' ? 'specialing' : 'lunge-left');
  }
  if (playerMove === 'special') playerUnit.classList.add(fighters[game.player].specialMotion);
  if (foeMove === 'special') foeUnit.classList.add(fighters[game.foe].specialMotion);
  roundResult.textContent = 'The fighters make their moves...';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  game.impactTimer = setTimeout(() => {
    impactEffect.dataset.target = outcome === 'tie' ? 'center' : outcome === 'player' ? 'foe' : 'player';
    impactEffect.textContent = outcome === 'tie' ? '✦ CLASH! ✦' : '✦ HIT! ✦';
    impactEffect.classList.add('show');
    arenaStage.classList.add('impact');
  }, reducedMotion ? 0 : 220);
  game.resolveTimer = setTimeout(() => {
    if (outcome === 'tie') {
      roundResult.textContent = `You both chose ${playerMove}. No health lost!`;
    } else if (outcome === 'player') {
      game.foeHealth -= 1;
      arenaStage.classList.add('player-won');
      roundResult.textContent = `Great move! ${capitalize(playerMove)} beats ${capitalize(foeMove)}. ${fighters[game.foe].name} gets a scuff and loses one health!`;
    } else {
      game.playerHealth -= 1;
      arenaStage.classList.add('foe-won');
      roundResult.textContent = `${fighters[game.foe].name}'s ${capitalize(foeMove)} beats your ${capitalize(playerMove)}. You get a scuff and lose one health!`;
    }
    paintHealth(playerHealthBar, playerHealthNumber, game.playerHealth);
    paintHealth(foeHealthBar, foeHealthNumber, game.foeHealth);
    paintDamage(playerUnit, playerDamage, game.playerHealth);
    paintDamage(foeUnit, foeDamage, game.foeHealth);
    playerArt.src = baseArt(game.player);
    foeArt.src = baseArt(game.foe);
    playerUnit.classList.remove('lunge-right', 'lunge-left', 'blocking', 'specialing', 'recoiling-left', 'recoiling-right', 'slashing', 'shielding', 'dino-scrape', 'knight-thrust', 'mecha-beam', 'club-smash', 'bary-pounce');
    foeUnit.classList.remove('lunge-right', 'lunge-left', 'blocking', 'specialing', 'recoiling-left', 'recoiling-right', 'slashing', 'shielding', 'dino-scrape', 'knight-thrust', 'mecha-beam', 'club-smash', 'bary-pounce');
    impactEffect.classList.remove('show');
    roarCallout.classList.remove('show');
    arenaStage.classList.remove('impact');
    game.animating = false;
    if (game.playerHealth === 0 || game.foeHealth === 0) {
      game.over = true;
      opponentIntent.textContent = game.foeHealth === 0 ? 'You won the crown! 👑' : `${fighters[game.foe].name} wins this round!`;
      moveHint.textContent = 'Everyone is ready for another duel.';
      roundResult.textContent += game.foeHealth === 0 ? ' Hooray, you win!' : ' Try again!';
      playAgain.hidden = false;
    } else {
      moveButtons.forEach((button) => { button.disabled = false; });
      showNextMove();
    }
  }, reducedMotion ? 0 : 760);
}

function capitalize(word) { return word[0].toUpperCase() + word.slice(1); }

document.querySelectorAll('[data-fighter]').forEach((button) => {
  button.addEventListener('click', () => startDuel(button.dataset.fighter));
});
document.querySelector('#choose-dinosaur').addEventListener('click', () => {
  fighterSelect.hidden = true;
  dinosaurSelect.hidden = false;
  dinosaurSelect.querySelector('[data-fighter]').focus();
});
document.querySelector('#back-to-sides').addEventListener('click', () => {
  dinosaurSelect.hidden = true;
  fighterSelect.hidden = false;
  document.querySelector('#choose-dinosaur').focus();
});
moveButtons.forEach((button) => {
  button.addEventListener('click', () => takeTurn(button.dataset.move));
});
playAgain.addEventListener('click', () => startDuel(game.player));
soundToggle.addEventListener('click', () => {
  game.soundEnabled = !game.soundEnabled;
  soundToggle.setAttribute('aria-pressed', String(game.soundEnabled));
  soundToggle.textContent = game.soundEnabled ? '🔊 Sound on' : '🔇 Sound off';
});
document.querySelector('#change-fighter').addEventListener('click', () => {
  clearMotion();
  game.over = true;
  arenaGame.hidden = true;
  dinosaurSelect.hidden = true;
  fighterSelect.hidden = false;
  fighterSelect.querySelector('button').focus();
});

['arena-mechagodzilla-idle.png', 'arena-mechagodzilla-attack.png', 'arena-mechagodzilla-block.png', 'arena-mechagodzilla-special.png', 'arena-dino-bite.png', 'arena-knight-slash.png', 'arena-knight-block.png', 'arena-dino-special.png', 'arena-knight-special.png', 'arena-ankylosaurus-idle.png', 'arena-ankylosaurus-attack.png', 'arena-ankylosaurus-special.png', 'arena-baryonyx-idle.png', 'arena-baryonyx-attack.png', 'arena-baryonyx-special.png'].forEach((asset) => {
  const image = new Image();
  image.src = `./assets/${asset}`;
});

const animalCards = [
  { name: 'Axolotl', type: 'Amphibian', iconImage: 'hero-axolotl.svg', basic: 'An axolotl is a salamander native to the Xochimilco area of Mexico.', wow: 'It can grow back a lost leg!', sourceName: 'U.S. Geological Survey', sourceUrl: 'https://nas.er.usgs.gov/queries/FactSheet.aspx?speciesID=3973' },
  { name: 'Sea otter', type: 'Marine mammal', icon: '🦦', basic: 'Sea otters live in coastal waters and kelp forests.', wow: 'They can use a rock on their chest to crack open food.', sourceName: 'Monterey Bay Aquarium', sourceUrl: 'https://www.montereybayaquarium.org/animals-the-ocean/animals-a-to-z/sea-otter' },
  { name: 'Octopus', type: 'Ocean invertebrate', icon: '🐙', basic: 'An octopus has eight arms and lives in the ocean.', wow: 'It has three hearts!', sourceName: 'Smithsonian Ocean', sourceUrl: 'https://ocean.si.edu/ocean-life/invertebrates/octopuses-squids-and-relatives' },
  { name: 'Two-toed sloth', type: 'Tree-dwelling mammal', icon: '🦥', basic: 'This sloth spends most of its life in trees and eats leaves and fruit.', wow: 'Tiny algae can grow in grooves in its fur, turning it greenish.', sourceName: 'San Diego Zoo', sourceUrl: 'https://animals.sandiegozoo.org/animals/two-toed-sloth' },
  { name: 'Red panda', type: 'Forest mammal', icon: '🎋', basic: 'Red pandas live in mountain forests and eat mostly bamboo.', wow: 'A wrist bone works like a pretend thumb to help grip bamboo.', sourceName: 'San Diego Zoo', sourceUrl: 'https://animals.sandiegozoo.org/animals/red-panda' },
  { name: 'Platypus', type: 'Egg-laying mammal', icon: '🥚', basic: 'Platypuses live in Australian waterways and lay eggs.', wow: 'Underwater, they find prey by sensing tiny electrical signals.', sourceName: 'San Diego Zoo', sourceUrl: 'https://animals.sandiegozoo.org/animals/platypus' },
  { name: 'Emperor penguin', type: 'Antarctic bird', icon: '🐧', basic: 'The emperor penguin is the largest kind of penguin.', wow: 'A father keeps his egg warm on top of his feet.', sourceName: 'Australian Antarctic Program', sourceUrl: 'https://www.antarctica.gov.au/about-antarctica/animals/penguins/emperor-penguin/breeding-cycle/' },
  { name: 'Honeybee', type: 'Pollinating insect', icon: '🐝', basic: 'Honeybees visit flowers to collect nectar and pollen.', wow: 'A bee can do a waggle dance to show others where flowers are.', sourceName: 'Smithsonian Gardens', sourceUrl: 'https://gardens.si.edu/gardens/pollinator-garden/why-what-when-where-who-how-pollination/' },
  { name: 'Giraffe', type: 'African mammal', icon: '🦒', basic: 'Giraffes browse leaves from trees and shrubs.', wow: 'A giraffe’s tongue can be about 18 inches long.', sourceName: 'San Diego Zoo', sourceUrl: 'https://animals.sandiegozoo.org/animals/giraffe' },
  { name: 'Chameleon', type: 'Tree-climbing lizard', icon: '🦎', basic: 'Chameleons often live in trees and eat insects.', wow: 'Their eyes can look in two directions at once.', sourceName: 'San Diego Zoo', sourceUrl: 'https://animals.sandiegozoo.org/animals/chameleon' },
];

const animalGrid = document.querySelector('#animal-grid');
animalCards.forEach((animal, index) => {
  const card = document.createElement('article');
  card.className = 'animal-card';
  const icon = animal.iconImage ? `<img src="assets/${animal.iconImage}" alt="" />` : animal.icon;
  card.innerHTML = `<div class="animal-card-top"><span class="animal-card-icon" aria-hidden="true">${icon}</span><span class="animal-card-number">DISCOVERY ${String(index + 1).padStart(2, '0')}</span></div><h3>${animal.name}</h3><span class="animal-card-type">${animal.type}</span><p class="animal-fact"><strong>Quick fact</strong>${animal.basic}</p><p class="animal-fact wow"><strong>Wow fact</strong>${animal.wow}</p><a class="animal-card-source" href="${animal.sourceUrl}" target="_blank" rel="noopener noreferrer">Learn more at ${animal.sourceName} ↗</a>`;
  animalGrid.append(card);
});

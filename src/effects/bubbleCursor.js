/**
 * Port of js/bubble.js. Floating bubbles follow the cursor and burst on click.
 * Returns a destroy() function that removes every listener / element.
 */
export function initBubbleCursor() {
  const bubbleColors = ['blue', 'lavender', 'pink', 'white'];
  const bubbleSizes = ['small', 'medium', 'large'];
  const timers = new Set();
  const elements = new Set();
  let moveTimeout = null;

  const later = (fn, ms) => {
    const id = setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };
  const addEl = (el) => {
    document.body.appendChild(el);
    elements.add(el);
  };
  const removeEl = (el) => {
    el.remove();
    elements.delete(el);
  };

  const cursorBubble = document.createElement('div');
  cursorBubble.className = 'cursor-bubble';
  addEl(cursorBubble);

  const createBubble = (x, y, isBurst = false) => {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.classList.add(bubbleSizes[Math.floor(Math.random() * bubbleSizes.length)]);
    bubble.classList.add(bubbleColors[Math.floor(Math.random() * bubbleColors.length)]);
    bubble.style.left = `${x + (Math.random() - 0.5) * 40}px`;
    bubble.style.top = `${y + (Math.random() - 0.5) * 40}px`;
    bubble.style.setProperty('--drift-x', `${(Math.random() - 0.5) * 100}px`);
    if (isBurst) bubble.classList.add('burst');
    addEl(bubble);
    later(() => removeEl(bubble), isBurst ? 600 : 3000);
  };

  const createBurstEffect = (x, y) => {
    const particleCount = 12;
    const colors = [
      'rgba(100, 200, 255, 0.8)',
      'rgba(200, 180, 255, 0.8)',
      'rgba(255, 180, 220, 0.8)',
      'rgba(255, 255, 255, 0.9)',
    ];
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'burst-particle';
      particle.style.background = colors[Math.floor(Math.random() * colors.length)];
      particle.style.boxShadow = `0 0 10px ${colors[Math.floor(Math.random() * colors.length)]}`;
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      const angle = (Math.PI * 2 * i) / particleCount;
      const distance = 50 + Math.random() * 50;
      particle.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
      particle.style.setProperty('--ty', `${Math.sin(angle) * distance}px`);
      addEl(particle);
      later(() => removeEl(particle), 800);
    }
    const central = document.createElement('div');
    central.className = 'bubble large white burst';
    central.style.left = `${x}px`;
    central.style.top = `${y}px`;
    addEl(central);
    later(() => removeEl(central), 600);
  };

  const handleMouseMove = (e) => {
    cursorBubble.style.left = `${e.clientX}px`;
    cursorBubble.style.top = `${e.clientY}px`;
    clearTimeout(moveTimeout);
    if (Math.random() > 0.7) createBubble(e.clientX, e.clientY, false);
  };

  const handleClick = (e) => {
    createBurstEffect(e.clientX, e.clientY);
    for (let i = 0; i < 5; i++) later(() => createBubble(e.clientX, e.clientY, true), i * 50);
  };

  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('click', handleClick);

  return function destroy() {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('click', handleClick);
    clearTimeout(moveTimeout);
    timers.forEach(clearTimeout);
    timers.clear();
    elements.forEach((el) => el.remove());
    elements.clear();
  };
}

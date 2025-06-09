document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('drawButton').addEventListener('click', drawBar);
});

function drawBar() {
  const barLength = parseFloat(document.getElementById('barLength').value);
  const forcePos = parseFloat(document.getElementById('forcePos').value);
  const supportPos = parseFloat(document.getElementById('supportPos').value);

  const barVisual = document.getElementById('barVisual');
  barVisual.innerHTML = '';

  const barWidth = barVisual.clientWidth;
  const scale = barWidth / barLength;

  const force = document.createElement('div');
  force.className = 'force-arrow';
  force.style.left = (forcePos * scale) + 'px';
  barVisual.appendChild(force);

  const support = document.createElement('div');
  support.className = 'support';
  support.style.left = (supportPos * scale) + 'px';
  barVisual.appendChild(support);
}
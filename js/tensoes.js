function calcularTudo() {
  const L = parseFloat(document.getElementById('comprimento').value);
  const P = parseFloat(document.getElementById('carga').value);
  const b = parseFloat(document.getElementById('largura').value) / 1000; // mm to m
  const h = parseFloat(document.getElementById('altura').value) / 1000; // mm to m

  
  // Força cortante máxima
  const R = P / 2;
  const Vmax = R;

  // Momento Fletor máximo
  const Mmax = (P * L) / 4;


  const I = (b * Math.pow(h, 3)) / 12;
  const y = h / 2;

  // Tensão Normal Máxima
  const sigma_max = (Mmax * y) / I;

  // Tensão de Cisalhamento Máxima
  const tau_max = (3 / 2) * (Vmax / (b * h));

  document.getElementById('result').innerHTML = `
    <strong>Resultados:</strong><br>
    Reações nos apoios: ${R.toFixed(2)} N<br>
    Momento Fletor Máximo: ${Mmax.toFixed(2)} Nm<br>
    Força Cortante Máxima: ${Vmax.toFixed(2)} N<br>
    Tensão Normal Máxima: ${(sigma_max / 1e6).toFixed(2)} MPa<br>
    Tensão de Cisalhamento Máxima: ${(tau_max / 1e6).toFixed(2)} MPa
  `;

  // Desenha a viga com carga no centro
  drawBeam(L, P / 1000); // Passa P em kN para o desenho
}

const canvas = document.getElementById('beamCanvas');
const ctx = canvas.getContext('2d');

function drawBeam(L, P) {
  const beamY = canvas.height / 2;
  const beamStartX = 50;
  const beamEndX = canvas.width - 50;
  const beamWidth = beamEndX - beamStartX;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Desenhar viga - linha preta grossa
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(beamStartX, beamY);
  ctx.lineTo(beamEndX, beamY);
  ctx.stroke();

  // Desenhar apoios simples (triângulos azuis)
  ctx.fillStyle = 'blue';

  // Apoio esquerdo
  ctx.beginPath();
  ctx.moveTo(50, canvas.height / 2);
  ctx.lineTo(40, canvas.height / 2 + 20);
  ctx.lineTo(60, canvas.height / 2 + 20);
  ctx.closePath();
  ctx.fill();

  // Apoio direito
  ctx.beginPath();
  ctx.moveTo(canvas.width - 50, canvas.height / 2);
  ctx.lineTo(canvas.width - 60, canvas.height / 2 + 20);
  ctx.lineTo(canvas.width - 40, canvas.height / 2 + 20);
  ctx.closePath();
  ctx.fill();

  // Desenhar carga concentrada no centro - seta vermelha para baixo
  const centerX = beamStartX + beamWidth / 2;
  const arrowHeight = 40;
  ctx.strokeStyle = 'red';
  ctx.fillStyle = 'red';
  ctx.lineWidth = 3;

  // Linha da seta (carga para baixo, parando antes da viga)
  ctx.beginPath();
  ctx.moveTo(centerX, beamY - arrowHeight); // início da seta
  ctx.lineTo(centerX, beamY - 6);           // para um pouco antes da viga
  ctx.stroke();

  // Triângulo da seta (ponta para baixo)
  ctx.beginPath();
  ctx.moveTo(centerX - 7, beamY - 6);        // canto esquerdo da base
  ctx.lineTo(centerX + 7, beamY - 6);        // canto direito da base
  ctx.lineTo(centerX, beamY + 4);            // ponta abaixo da base (direção pra baixo)
  ctx.closePath();
  ctx.fill();

  // Texto da carga
  ctx.font = '16px Arial';
  ctx.fillText(`${P.toFixed(1)} kN`, centerX - 25, canvas.height / 2 - arrowHeight - 10);

  // Texto do comprimento da viga
  ctx.fillStyle = 'black';
  ctx.font = '14px Arial';
  ctx.fillText(`0 m`, 40, canvas.height / 2 + 40);
  ctx.fillText(`${L.toFixed(1)} m`, canvas.width - 80, canvas.height / 2 + 40);
}
function calcularTudo() {
  const L = parseFloat(document.getElementById('comprimento').value);
  const P = parseFloat(document.getElementById('carga').value);
  const b = parseFloat(document.getElementById('largura').value) / 1000; // mm to m
  const h = parseFloat(document.getElementById('altura').value) / 1000; // mm to m
  const a = parseFloat(document.getElementById('posicaoCarga').value);

  if (a < 0 || a > L) {
    alert('A posição da carga deve estar entre 0 e o comprimento da viga.');
    return;
  }

  // Suporte simples em ambas extremidades
  const b_resto = L - a;

  const R1 = (P * b_resto) / L;
  const R2 = (P * a) / L;

  // Força cortante máxima
  const Vmax = Math.max(R1, R2); // maior esforço cortante

  // Momento Fletor máximo
  const Mmax = R1 * a; // ocorre no ponto de carga


  const I = (b * Math.pow(h, 3)) / 12;
  const y = h / 2;

  // Tensão Normal Máxima
  const sigma_max = (Mmax * y) / I;

  // Tensão de Cisalhamento Máxima
  const tau_max = (3 / 2) * (Vmax / (b * h));

  document.getElementById('result').innerHTML = `
    <strong>Resultados:</strong><br>
    Reação à esquerda: ${R1.toFixed(2)} N<br>
    Reação à direita: ${R2.toFixed(2)} N<br>
    Momento Fletor Máximo: ${Mmax.toFixed(2)} Nm<br>
    Força Cortante Máxima: ${Vmax.toFixed(2)} N<br>
    Tensão Normal Máxima: ${(sigma_max / 1e6).toFixed(2)} MPa<br>
    Tensão de Cisalhamento Máxima: ${(tau_max / 1e6).toFixed(2)} MPa`;

  // Desenha a viga com carga no centro
  drawBeam(L, P / 1000, a); // Passa P em kN para o desenho

  // Gera a tabela dinâmica
  gerarTabelaEsforcos(L, P, Vmax);
  gerarGraficoEsforcos(L, P, Vmax);
}

const canvas = document.getElementById('beamCanvas');
const ctx = canvas.getContext('2d');

function drawBeam(L, P, a) {
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
  ctx.moveTo(beamStartX, beamY);
  ctx.lineTo(beamStartX - 10, beamY + 20);
  ctx.lineTo(beamStartX + 10, beamY + 20);
  ctx.closePath();
  ctx.fill();

  // Apoio direito
  ctx.beginPath();
  ctx.moveTo(beamEndX, beamY);
  ctx.lineTo(beamEndX - 10, beamY + 20);
  ctx.lineTo(beamEndX + 10, beamY + 20);
  ctx.closePath();
  ctx.fill();

  // Desenhar carga concentrada na posição a - seta vermelha para baixo
  const scale = beamWidth / L;
  const cargaX = beamStartX + a * scale;
  const arrowHeight = 40;

  ctx.strokeStyle = 'red';
  ctx.fillStyle = 'red';
  ctx.lineWidth = 3;

  // Linha da seta (carga para baixo, parando antes da viga)
  ctx.beginPath();
  ctx.moveTo(cargaX, beamY - arrowHeight); // início da seta
  ctx.lineTo(cargaX, beamY - 6);           // para um pouco antes da viga
  ctx.stroke();

  // Triângulo da seta (ponta para baixo)
  ctx.beginPath();
  ctx.moveTo(cargaX - 7, beamY - 6);        // canto esquerdo da base
  ctx.lineTo(cargaX + 7, beamY - 6);        // canto direito da base
  ctx.lineTo(cargaX, beamY + 4);            // ponta abaixo da base (direção pra baixo)
  ctx.closePath();
  ctx.fill();

  // Texto da carga
  ctx.font = '16px Arial';
  ctx.fillText(`${P.toFixed(1)} kN`, cargaX - 25, beamY - arrowHeight - 10);

  // Texto do comprimento da viga
  ctx.fillStyle = 'black';
  ctx.font = '14px Arial';
  ctx.fillText(`0 m`, beamStartX - 10, beamY + 40);
  ctx.fillText(`${L.toFixed(1)} m`, beamEndX - 30, beamY + 40);
}

function gerarTabelaEsforcos(L, P, Vmax) {
  const passo = 0.5;
  const tabelaDiv = document.getElementById('tabelaResultados');
  tabelaDiv.innerHTML = ''; // Limpa antes de recriar

  const tabela = document.createElement('table');
  tabela.border = '1';
  tabela.style.marginTop = '20px';
  tabela.style.width = '100%';
  tabela.style.borderCollapse = 'collapse';
  tabela.style.textAlign = 'center';
  tabela.style.fontFamily = 'Arial';

  // Cabeçalho
  const cabecalho = tabela.insertRow();
  ['x (m)', 'CORTANTE V (N)', 'AXIAL P (N)', 'MOMENTO M (Nm)'].forEach(titulo => {
    const th = document.createElement('th');
    th.textContent = titulo;
    th.style.padding = '8px';
    th.style.background = '#f0f0f0';
    th.style.border = '1px solid #ccc';
    cabecalho.appendChild(th);
  });

  // Linhas de dados
  for (let x = 0; x <= L + 0.001; x += passo) {
    const linha = tabela.insertRow();

    const cortante = Vmax.toFixed(2); // usando Vmax calculado
    const axial = 0;
    const momento = -((P * x) * x / 2).toFixed(2); // M = -(P * x) * x / 2

    [x.toFixed(2), cortante, axial, momento].forEach(valor => {
      const td = document.createElement('td');
      td.textContent = valor;
      td.style.padding = '6px';
      td.style.border = '1px solid #ccc';
      linha.appendChild(td);
    });
  }

  tabelaDiv.appendChild(tabela);
}

function gerarGraficoEsforcos(L, P, Vmax) {
  const passo = 0.5;
  const labels = [];
  const dadosCortante = [];
  const dadosAxial = [];
  const dadosMomento = [];

  for (let x = 0; x <= L + 0.001; x += passo) {
    labels.push(x.toFixed(2));
    dadosCortante.push(Vmax);
    dadosAxial.push(0);
    dadosMomento.push(-((P * x * x) / 2));
  }

  const ctxGrafico = document.getElementById('graficoEsforcos').getContext('2d');

  // Destroi gráfico anterior se existir
  if (window.graficoInstance) {
    window.graficoInstance.destroy();
  }

  window.graficoInstance = new Chart(ctxGrafico, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Cortante (V)',
          data: dadosCortante,
          borderColor: 'blue',
          fill: false
        },
        {
          label: 'Axial (P)',
          data: dadosAxial,
          borderColor: 'orange',
          fill: false
        },
        {
          label: 'Momento (M)',
          data: dadosMomento,
          borderColor: 'gray',
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Posição (m)'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Esforço'
          }
        }
      }
    }
  });
}
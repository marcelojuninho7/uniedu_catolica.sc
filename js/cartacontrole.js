let controlChartInstance = null;
let mrChartInstance = null;
let cpChartInstance = null;

function generateCharts() {
  const dataInput = document.getElementById("data-input").value;

  // Processar os dados colados
  const dataArray = dataInput
    .split(/\r?\n/) // Quebrar em linhas
    .map(line => parseFloat(line.trim())) // Converter para números
    .filter(value => !isNaN(value)); // Remover entradas inválidas

  if (dataArray.length < 2) {
    alert("Por favor, insira ao menos dois valores para gerar os gráficos.");
    return;
  }

  // ==============================
  // CÁLCULO: Estatísticas Básicas
  // ==============================
  const mean = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
  const sigma = Math.sqrt(dataArray.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / dataArray.length);

  const lie = Math.min(...dataArray); // LIE
  const lse = Math.max(...dataArray); // LSE
  const cp = (lse - lie) / (6 * sigma);
  const cpk = Math.min((lse - mean) / (3 * sigma), (mean - lie) / (3 * sigma));

  // Exibir os valores de Cp e Cpk acima do histograma
  document.getElementById("cp-value").innerText = cp.toFixed(2);
  document.getElementById("cpk-value").innerText = cpk.toFixed(2);

  // ==============================
  // CÁLCULO: Carta de Controle
  // ==============================
  const ucl = mean + 3 * sigma;
  const lcl = mean - 3 * sigma;
  const mzs = mean - 1 * sigma; //M-1s
  const mas = mean + 1 * sigma; //M+1s
  const mys = mean - 2 * sigma; //M-2s
  const mbs = mean + 2 * sigma; //M+2s

  const controlData = {
    labels: dataArray.map((_, index) => `${index + 1}`),
    datasets: [
      {
        label: "Dados",
        data: dataArray,
        borderColor: "black",
        //backgroundColor: "rgba(0, 123, 255, 0.2)",
        //fill: true,
      },
      {
        label: "Média",
        data: Array(dataArray.length).fill(mean),
        borderColor: "blue",
        //borderDash: [5, 5],
      },
      {
        label: "LSC",
        data: Array(dataArray.length).fill(ucl),
        borderColor: "red",
        //borderDash: [5, 5],
      },
      {
        label: "LIC",
        data: Array(dataArray.length).fill(lcl),
        borderColor: "red",
        //borderDash: [5, 5],
      },
      {
        label: "M - 1s",
        data: Array(dataArray.length).fill(mzs),
        borderColor: "green",
        //borderDash: [5, 5],
      },
      {
        label: "M + 1s",
        data: Array(dataArray.length).fill(mas),
        borderColor: "green",
        //borderDash: [5, 5],
      },
      {
        label: "M - 2s",
        data: Array(dataArray.length).fill(mys),
        borderColor: "yellow",
        //borderDash: [5, 5],
      },
      {
        label: "M + 2s",
        data: Array(dataArray.length).fill(mbs),
        borderColor: "yellow",
        //borderDash: [5, 5],
      },
    ],
  };

  // ==============================
  // CÁLCULO: Amplitude Móvel (MR)
  // ==============================
  const mrValues = dataArray.slice(1).map((value, index) => Math.abs(value - dataArray[index]));
  const mrMean = mrValues.reduce((sum, value) => sum + value, 0) / mrValues.length;
  const mrUcl = mrMean * 3.27;
  const mrlcl = mrMean * 0;

  const mrData = {
    labels: mrValues.map((_, index) => `${index + 1}`),
    datasets: [
      {
        label: "Amplitude Móvel",
        data: mrValues,
        borderColor: "black",
        //backgroundColor: "rgba(128, 0, 128, 0.2)",
        //fill: true,
      },
      {
        label: "Média MR",
        data: Array(mrValues.length).fill(mrMean),
        borderColor: "blue",
        //borderDash: [5, 5],
      },
      {
        label: "LSC",
        data: Array(mrValues.length).fill(mrUcl),
        borderColor: "red",
        //borderDash: [5, 5],
      },
      {
        label: "LIC",
        data: Array(mrValues.length).fill(mrlcl),
        borderColor: "red",
        //borderDash: [5, 5],
      },
    ],
  };

  // ==============================
  // CÁLCULO: Índice de Capacidade (Cp e Cpk)
  // ==============================
  // Determinar limites do histograma
  const binCount = Math.ceil(Math.sqrt(dataArray.length)); // Regra de Sturges
  const minValue = Math.min(...dataArray);
  const maxValue = Math.max(...dataArray);
  const binSize = 0.05;

  // Gerar bins e frequências
  const bins = Array(binCount).fill(0).map((_, i) => minValue + i * binSize);
  const frequencies = bins.map((_, i) =>
    dataArray.filter(value => value >= bins[i] && value < (bins[i + 1] || maxValue + 1)).length
  );

  // Gerar curva normal
  const normalCurve = bins.map(x => {
    const z = (x - mean) / sigma;
    const pdf = (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
    return pdf * dataArray.length * binSize; // Escalar para combinar com o histograma
  });

  const histogramData = {
    labels: bins.map(bin => bin.toFixed(2)),
    datasets: [
      {
        type: "bar",
        label: "Frequência",
        data: frequencies,
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "blue",
        borderWidth: 1,
      },
      {
        type: "line",
        label: "Curva Normal",
        data: normalCurve,
        borderColor: "black",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        fill: false,
        tension: 0.4,
      },
    ],
  };

  // ==============================
  // CRIAÇÃO DOS GRÁFICOS
  // ==============================

  // Carta de Controle
  if (controlChartInstance) controlChartInstance.destroy();
  const controlCtx = document.getElementById("controlChart").getContext("2d");
  controlChartInstance = new Chart(controlCtx, { type: "line", data: controlData });

  // Amplitude Móvel
  if (mrChartInstance) mrChartInstance.destroy();
  const mrCtx = document.getElementById("mrChart").getContext("2d");
  mrChartInstance = new Chart(mrCtx, { type: "line", data: mrData });

  // Histograma com Curva Normal
  if (cpChartInstance) cpChartInstance.destroy();
  const cpCtx = document.getElementById("cpChart").getContext("2d");
  cpChartInstance = new Chart(cpCtx, { type: "bar", data: histogramData });
}

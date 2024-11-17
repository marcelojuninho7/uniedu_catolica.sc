// script.js
let controlChartInstance = null; // Instância do gráfico de controle
let mrChartInstance = null; // Instância do gráfico MR

function generateCharts() {
  // Captura os dados inseridos pelo usuário
  const dataInput = document.getElementById("data-input").value;
  const dataArray = dataInput.split(",").map(Number);

  if (dataArray.some(isNaN)) {
    alert("Por favor, insira apenas números separados por vírgula.");
    return;
  }

  // ==============================
  // CÁLCULOS PARA O GRÁFICO DE CONTROLE
  // ==============================
  const mean = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
  const ucl = mean + 2; // Limite Superior
  const lcl = mean - 2; // Limite Inferior

  const controlLabels = dataArray.map((_, index) => `Ponto ${index + 1}`);
  const controlData = {
    labels: controlLabels,
    datasets: [
      {
        label: "Valores",
        data: dataArray,
        borderColor: "blue",
        backgroundColor: "rgba(0, 123, 255, 0.2)",
        fill: true,
      },
      {
        label: "Média",
        data: Array(dataArray.length).fill(mean),
        borderColor: "green",
        borderDash: [5, 5],
        pointRadius: 0,
      },
      {
        label: "Limite Superior (UCL)",
        data: Array(dataArray.length).fill(ucl),
        borderColor: "red",
        borderDash: [5, 5],
        pointRadius: 0,
      },
      {
        label: "Limite Inferior (LCL)",
        data: Array(dataArray.length).fill(lcl),
        borderColor: "orange",
        borderDash: [5, 5],
        pointRadius: 0,
      },
    ],
  };

  // ==============================
  // CÁLCULOS PARA O GRÁFICO MR
  // ==============================
  const mrValues = dataArray.slice(1).map((value, index) => Math.abs(value - dataArray[index]));
  const mrMean = mrValues.reduce((sum, value) => sum + value, 0) / mrValues.length;
  const mrUcl = mrMean * 3.27; // UCL para MR
  const mrLcl = 0; // LCL para MR (não pode ser negativo)

  const mrLabels = mrValues.map((_, index) => `MR ${index + 1}`);
  const mrData = {
    labels: mrLabels,
    datasets: [
      {
        label: "Amplitude Móvel",
        data: mrValues,
        borderColor: "purple",
        backgroundColor: "rgba(128, 0, 128, 0.2)",
        fill: true,
      },
      {
        label: "Média MR",
        data: Array(mrValues.length).fill(mrMean),
        borderColor: "green",
        borderDash: [5, 5],
        pointRadius: 0,
      },
      {
        label: "Limite Superior (UCL)",
        data: Array(mrValues.length).fill(mrUcl),
        borderColor: "red",
        borderDash: [5, 5],
        pointRadius: 0,
      },
      {
        label: "Limite Inferior (LCL)",
        data: Array(mrValues.length).fill(mrLcl),
        borderColor: "orange",
        borderDash: [5, 5],
        pointRadius: 0,
      },
    ],
  };

  // ==============================
  // RENDERIZAÇÃO DOS GRÁFICOS
  // ==============================

  // Gráfico de Controle
  if (controlChartInstance) {
    controlChartInstance.destroy();
  }
  const controlCtx = document.getElementById("controlChart").getContext("2d");
  controlChartInstance = new Chart(controlCtx, {
    type: "line",
    data: controlData,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Carta de Controle",
        },
      },
    },
  });

  // Gráfico MR
  if (mrChartInstance) {
    mrChartInstance.destroy();
  }
  const mrCtx = document.getElementById("mrChart").getContext("2d");
  mrChartInstance = new Chart(mrCtx, {
    type: "line",
    data: mrData,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Gráfico de Amplitude Móvel (MR)",
        },
      },
    },
  });
}

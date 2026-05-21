function calcularMecanismo() {
    // 1. Obter dados de entrada
    const l1 = parseFloat(document.getElementById('l1').value); // O2O4
    const l2 = parseFloat(document.getElementById('l2').value); // O2A
    const l3 = parseFloat(document.getElementById('l3').value); // AB
    const l4 = parseFloat(document.getElementById('l4').value); // O4B
    const psiDeg = parseFloat(document.getElementById('psi').value);
    const w2 = parseFloat(document.getElementById('omega2').value);
    
    const psi = psiDeg * (Math.PI / 180); // Converter para radianos

    // --- ANÁLISE DE POSIÇÃO (Slide 81 / Fonte [6, 7]) ---
    // Cálculo da diagonal L entre O4 e A
    const L = Math.sqrt(Math.pow(l1, 2) + Math.pow(l2, 2) - 2 * l1 * l2 * Math.cos(psi));
    
    // Ângulo de transmissão (gamma)
    const cosGamma = (Math.pow(l3, 2) + Math.pow(l4, 2) - Math.pow(L, 2)) / (2 * l3 * l4);
    const gamma = Math.acos(cosGamma);
    const gammaDeg = gamma * (180 / Math.PI);

    // --- ANÁLISE DE VELOCIDADE (Slide 99 / Fonte [4, 8, 9]) ---
    // vA = w2 * l2 (perpendicular à barra 2)
    const vA = w2 * l2;
    
    // Simplificação para obter velocidades angulares w3 e w4 (Base vetorial)
    // No material, as velocidades são resolvidas por diagramas ou sistemas lineares [9]
    // Abaixo, um exemplo de exibição das fórmulas conceituais:
    const w3 = (vA * Math.sin(psi - gamma)) / (l3 * Math.sin(gamma)); // Exemplo conceitual
    const w4 = (vA * Math.sin(psi)) / (l4 * Math.sin(gamma));

    // --- ANÁLISE DE ACELERAÇÃO (Slide 146 / Fonte [5, 10, 11]) ---
    // Aceleração Normal de A: anA = w2^2 * l2
    const anA = Math.pow(w2, 2) * l2;
    // Aceleração Normal de B em relação a A: anBA = w3^2 * l3
    const anBA = Math.pow(w3, 2) * l3;

    // 3. Exibir Resultados
    let res = `
        <table class="table table-bordered">
            <tr class="success"><th>Parâmetro</th><th>Valor</th></tr>
            <tr><td>Distância O4A (L)</td><td>${L.toFixed(2)} mm</td></tr>
            <tr><td>Ângulo de Transmissão (γ)</td><td>${gammaDeg.toFixed(2)}°</td></tr>
            <tr><td>Velocidade Linear vA</td><td>${vA.toFixed(2)} mm/s</td></tr>
            <tr><td>Aceleração Normal anA</td><td>${anA.toFixed(2)} mm/s²</td></tr>
        </table>
    `;
    
    // Alerta de Grashof (Slide 23 / Fonte [12, 13])
    const comprimentos = [l1, l2, l3, l4].sort((a, b) => a - b);
    if ((comprimentos + comprimentos[14]) <= (comprimentos[15] + comprimentos[16])) {
        res += "<div class='alert alert-info'><strong>Regra de Grashof:</strong> A barra curta pode girar continuamente.</div>";
    }

    document.getElementById('output').innerHTML = res;
    // CHAME A FUNÇÃO DE DESENHO AQUI
    desenharMecanismo(l1, l2, l3, l4, psi, gamma);
}

function desenharMecanismo(l1, l2, l3, l4, psi, gamma) {
    const canvas = document.getElementById('canvasMecanismo');
    const ctx = canvas.getContext('2d');
    
    // Limpar o desenho anterior
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Definir a origem (O2) no centro do canvas para facilitar a visualização
    const offsetX = 200;
    const offsetY = 300;

    // --- CÁLCULO DAS COORDENADAS DOS PONTOS (Baseado no Slide 25/Fonte) ---
    // Ponto O2 (Fixo)
    const xO2 = offsetX;
    const yO2 = offsetY;

    // Ponto O4 (Fixo na distância L1/Barra 1)
    const xO4 = offsetX + l1;
    const yO4 = offsetY;

    // Ponto A (Manivela - calculada pelo ângulo psi)
    const xA = offsetX + l2 * Math.cos(psi);
    const yA = offsetY - l2 * Math.sin(psi); // Y é invertido no Canvas

    // Ponto B (Acoplador/Seguidor)
    // Usando a diagonal L e o ângulo calculado nas fontes [4]
    // Para simplificar no Canvas, usamos as coordenadas derivadas de gamma
    const xB = xO4 + l4 * Math.cos(Math.PI - gamma); 
    const yB = yO4 - l4 * Math.sin(Math.PI - gamma);

    // --- DESENHO DAS BARRAS ---
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#333";

    // Função auxiliar para desenhar uma linha entre dois pontos
    function desenharBarra(x1, y1, x2, y2, cor) {
        ctx.beginPath();
        ctx.strokeStyle = cor;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    // Barra 1 (Fixa O2-O4)
    desenharBarra(xO2, yO2, xO4, yO4, "black");
    // Barra 2 (Manivela O2-A)
    desenharBarra(xO2, yO2, xA, yA, "red");
    // Barra 3 (Acoplador A-B)
    desenharBarra(xA, yA, xB, yB, "blue");
    // Barra 4 (Seguidor O4-B)
    desenharBarra(xO4, yO4, xB, yB, "green");

    // Desenhar as Juntas (Círculos) [5]
    function desenharJunta(x, y) {
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.stroke();
    }
    desenharJunta(xO2, yO2);
    desenharJunta(xA, yA);
    desenharJunta(xB, yB);
    desenharJunta(xO4, yO4);
}

let anguloAtual = 0;
function animar() {
    // 1. Calcular a posição para o ângulo atual (Slide 81/Fonte)
    // Chame sua função de cálculo aqui...
    
    // 2. Desenhar no Canvas
    desenharMecanismo(550, 300, 700, 510, anguloAtual, gammaCalculado);

    // 3. Incrementar o ângulo com base na velocidade angular w2 [8]
    anguloAtual += 0.02; 

    requestAnimationFrame(animar);
}
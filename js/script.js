document.addEventListener('DOMContentLoaded', function () {
    const apiKey = 'b8640be5-2dfb-4aca-9a3d-36168a169868';
    const input = document.getElementById('inputPoggers');
    const botao = document.getElementById('buttonPoggers');
    const resultado = document.getElementById('resultado');
    const vidaHTML = document.querySelector('.vida');
    const contadorVida = document.querySelector('.contador-vida');
    const bulbs = document.querySelectorAll('.bulb button');
    const dicaContainer = document.querySelector('.dica-invisivel');
    const imgDica = document.querySelector('.imgDica');
    const tentativasParaDesbloquear = [6, 8, 10];
    const vidaMaxima = 100;

    let jogoFinalizado = false;

    let streak = parseInt(localStorage.getItem('streak')) || 0;
    let vidaAtual = parseInt(localStorage.getItem('vida')) || vidaMaxima;
    let tentativas = parseInt(localStorage.getItem('tentativas')) || 0;
    let dicasUsadas = JSON.parse(localStorage.getItem('dicasUsadas')) || [false, false, false];

    let dadosTabela = localStorage.getItem('dadosTabela') ? JSON.parse(localStorage.getItem('dadosTabela')) : [];

    const acertosDisplay = document.getElementById('acertosDisplay');
    acertosDisplay.textContent = `${streak}`;

    function atualizarVidaDisplay() {
        contadorVida.textContent = `${vidaAtual}`;
        vidaHTML.style.width = `${(vidaAtual / vidaMaxima) * 100}%`;
    }

    async function cosmInfo() {
        const urlQuery = 'https://fortnite-api.com/v2/cosmetics/br/search/all/?language=pt-BR&type=outfit';
        try {
            const response = await fetch(urlQuery, { headers: { 'Authorization': apiKey } });
            if (!response.ok) throw new Error(`Erro na requisição: ${response.status}`);
            const data = await response.json();

            const cosmetics = data.data.filter(skin =>
                skin.name.toLowerCase() !== 'tbd' &&
                skin.name.toLowerCase() !== 'humano bill' &&
                skin.name.toLowerCase() !== 'unidade de autodefesa stark' &&
                skin.rarity.displayValue.toLowerCase() !== 'comum'
            );

            if (cosmetics.length > 0) {
                const skinDoDia = selecionarSkinAleatoria(cosmetics);
                const descricao = skinDoDia.description || 'não há';
                const set = skinDoDia.set && skinDoDia.set.value ? skinDoDia.set.value : 'não há';

                const dicas = [
                    `Descrição: ${descricao}`,
                    `Set: ${set}`,
                    `${skinDoDia.images.smallIcon}`
                ];

                configurarEventos(cosmetics, skinDoDia, dicas);
            } else {
                console.log('Índice fora do alcance ou array vazio.');
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
        }
    }

    function selecionarSkinAleatoria(data) {
        let skinArmazenada = localStorage.getItem('skinDoDia');
        if (skinArmazenada) {
            return JSON.parse(skinArmazenada);
        } else {
            const indiceAleatorio = Math.floor(Math.random() * data.length);
            const skinDoDia = data[indiceAleatorio];
            localStorage.setItem('skinDoDia', JSON.stringify(skinDoDia));
            return skinDoDia;
        }
    }

    function resetarStreak() {
        streak = 0;
        localStorage.setItem('streak', streak);
        acertosDisplay.textContent = `${streak}`;
    }

    function atualizarEstadoLampadas() {
        bulbs.forEach((bulb, index) => {
            if (tentativas >= tentativasParaDesbloquear[index]) {
                bulb.removeAttribute('disabled');
                bulb.classList.add('active');
            } else {
                bulb.setAttribute('disabled', true);
                bulb.classList.remove('active');
            }
        });
    }

    function exibirDica(indice, dicas) {
        if (tentativas >= tentativasParaDesbloquear[indice]) {
            dicasUsadas[indice] = true;
            localStorage.setItem('dicasUsadas', JSON.stringify(dicasUsadas));
            if (indice === dicas.length - 1) {
                imgDica.src = dicas[indice];
                imgDica.style.display = 'block';
                dicaContainer.innerHTML = '';
                dicaContainer.appendChild(imgDica);
            } else {
                dicaContainer.innerHTML = `${dicas[indice]}`;
                imgDica.style.display = 'none';
            }
            dicaContainer.style.display = 'flex';
        }
    }

    function configurarEventos(cosmetics, skinDoDia, dicas) {
        bulbs.forEach((bulb, index) => {
            bulb.addEventListener('click', () => {
                if (!jogoFinalizado) {
                    exibirDica(index, dicas);
                }
            });
        });

        botao.addEventListener('click', () => {
            verificarInput(input.value.toLowerCase().trim(), cosmetics, skinDoDia);
        });

        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                verificarInput(input.value.toLowerCase().trim(), cosmetics, skinDoDia);
            }
        });

        input.addEventListener('input', () => {
            if (!jogoFinalizado) {
                const valorInput = input.value.toLowerCase().trim();
                const sugestoes = cosmetics.filter(cosmetico => cosmetico.name.toLowerCase().includes(valorInput));
                mostrarSugestoes(sugestoes);
            }
        });
    }

    function verificarInput(valorInput, cosmetics, skinDoDia) {
        const isAcerto = validarSkin(valorInput, cosmetics, skinDoDia);
        if (!isAcerto) {
            Errou();
            verifLoose();
            atualizarEstadoLampadas();
        }
        input.value = '';
    }

    function validarSkin(inputValor, cosmetics, skinDoDia) {
        const cosmeticoEncontrado = cosmetics.find(cosmetico => cosmetico.name.toLowerCase() === inputValor);
        if (cosmeticoEncontrado) {
            criarTabela(cosmeticoEncontrado, skinDoDia);
            if (cosmeticoEncontrado.name.toLowerCase() === skinDoDia.name.toLowerCase()) {
                WIN();
                return true;
            }
        }
        resultado.textContent = `Nenhum cosmético encontrado com o nome "${inputValor}".`;
        return false;
    }

    function criarTabela(cosmeticoEncontrado, skinDoDia) {
        dadosTabela.push({
            nome: cosmeticoEncontrado.name,
            raridade: cosmeticoEncontrado.rarity.displayValue,
            skinDoDia: skinDoDia.name
        });

        localStorage.setItem('dadosTabela', JSON.stringify(dadosTabela));

        // Atualize a tabela na interface (caso exista)
        atualizarTabelaUI();
    }

    function atualizarTabelaUI() {
        const tabela = document.getElementById('tabelaSkins'); // A tabela deve existir no HTML
        tabela.innerHTML = ''; // Limpa o conteúdo anterior

        dadosTabela.forEach((item, index) => {
            const row = tabela.insertRow(index);
            const nomeCell = row.insertCell(0);
            const raridadeCell = row.insertCell(1);
            const skinDoDiaCell = row.insertCell(2);

            nomeCell.textContent = item.nome;
            raridadeCell.textContent = item.raridade;
            skinDoDiaCell.textContent = item.skinDoDia;
        });
    }

    function WIN() {
        input.disabled = true;
        botao.disabled = true;
        fireConfetti();
        resetarJogo();
        streak += 1;
        localStorage.setItem('streak', streak);
        acertosDisplay.textContent = `${streak}`;
        cosmInfo();
    }

    function verifLoose() {
        if (vidaAtual <= 0) {
            input.disabled = true;
            botao.disabled = true;
            alert("Você perdeu todas as vidas... Tente novamente.");
            resetarJogo();
            cosmInfo();
            resetarStreak();
        } else {
            localStorage.setItem('vida', vidaAtual);
        }
        atualizarVidaDisplay();
    }

    function resetarJogo() {
        localStorage.removeItem('dicasUsadas');
        localStorage.removeItem('tentativas');
        localStorage.removeItem('skinDoDia');
        localStorage.removeItem('vida');
        localStorage.removeItem('dadosTabela');
        tentativas = 0;
        dicasUsadas = [false, false, false];
        vidaAtual = vidaMaxima;
        atualizarVidaDisplay();
        dadosTabela = []; // Limpa o array ao resetar
    }

    function Errou() {
        vidaAtual -= 5;
        tentativas += 1;
        localStorage.setItem('tentativas', tentativas);
        localStorage.setItem('vida', vidaAtual);
        atualizarVidaDisplay();
    }

    atualizarEstadoLampadas();
    atualizarVidaDisplay();
    cosmInfo();
});

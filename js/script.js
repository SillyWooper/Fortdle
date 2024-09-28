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
    let tentativas = 0;
    let vidaAtual = vidaMaxima;
    let jogoFinalizado = false;
    let contadorAcertos = 0;  // Inicializa o contador de acertos

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
                skin.name.toLowerCase() !== 'Humano Bill' &&
                skin.name.toLowerCase() !== 'Unidade de Autodefesa Stark' &&
                skin.rarity.displayValue.toLowerCase() !== 'comum'
            ) || [];
    
            if (cosmetics.length > 0) {
                const skinDoDia = selecionarSkinAleatoria(cosmetics);
    
                const descricao = skinDoDia.description || 'não há';
                const set = skinDoDia.set && skinDoDia.set.value ? skinDoDia.set.value : 'não há';
    
                const dicas = [
                    `Descrição: ${descricao}`,
                    `Set: ${set}`,
                    `${skinDoDia.images.smallIcon}`  // Última dica é a URL da imagem
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
        const indiceAleatorio = Math.floor(Math.random() * data.length);
        const skinDoDia = data[indiceAleatorio];
    
        const capitulo = skinDoDia.introduction && skinDoDia.introduction.chapter ? skinDoDia.introduction.chapter : "0";
        const temporada = skinDoDia.introduction && skinDoDia.introduction.season ? skinDoDia.introduction.season : "0";
    
        console.log(`Icone: ${skinDoDia.images.smallIcon}`);
        console.log(`Nome: ${skinDoDia.name}`);
        console.log(`Raridade: ${skinDoDia.rarity.displayValue}`);
        console.log(`Capitulo: ${Number(capitulo)}`);
        console.log(`Temporada: ${Number(temporada)}`);
        console.log(`Ano de Lançamento: ${new Date(skinDoDia.added).getFullYear()}`);
        
        return skinDoDia;
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

            bulbs.forEach((bulb, i) => {
                if (i === indice) {
                    bulb.setAttribute('data-activated', 'true');
                } else {
                    bulb.removeAttribute('data-activated');
                }
            });
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
            if (!jogoFinalizado) {
                const valorInput = input.value.toLowerCase().trim();
                if (valorInput === "") {
                    resultado.textContent = "Por favor, digite o nome de uma skin.";
                    return;
                }

                const isAcerto = validarSkin(valorInput, cosmetics, skinDoDia);
                if (!isAcerto) {
                    tentativas += 1;
                    reduzirVida();
                    atualizarEstadoLampadas();
                }

                input.value = '';
            }
        });

        input.addEventListener('input', () => {
            if (!jogoFinalizado) {
                const valorInput = input.value.toLowerCase().trim();
                const sugestoes = cosmetics.filter(cosmetico =>
                    cosmetico.name.toLowerCase().includes(valorInput)
                );
                mostrarSugestoes(sugestoes);
            }
        });

        document.addEventListener('click', (event) => {
            if (!input.contains(event.target) && !resultado.contains(event.target)) {
                resultado.innerHTML = '';
            }
        });
    }

    // Função para atualizar o display de acertos
    function atualizarSequenciaAcertos() {
        contadorAcertos += 1;  // Incrementa o número de acertos
        const acertosDisplay = document.getElementById('acertosDisplay');
        acertosDisplay.textContent = `${contadorAcertos}`;  // Atualiza o número de acertos na tela
    }

    function validarSkin(inputValor, cosmetics, skinDoDia) {
        const cosmeticoEncontrado = cosmetics.find(cosmetico => cosmetico.name.toLowerCase() === inputValor);

        if (cosmeticoEncontrado) {
            if (cosmeticoEncontrado.name.toLowerCase() === skinDoDia.name.toLowerCase()) {
                resultado.textContent = `Você acertou! A skin é "${skinDoDia.name}".`;
                criarTabela(cosmeticoEncontrado, skinDoDia);
                atualizarSequenciaAcertos();  // Atualiza a sequência de acertos
                finalizarJogo(true);
                return true;
            } else {
                resultado.textContent = `Skin encontrada, mas não é a correta. Continue tentando!`;
                criarTabela(cosmeticoEncontrado, skinDoDia);
                return false;
            }
        } else {
            resultado.textContent = `Nenhum cosmético encontrado com o nome "${inputValor}".`;
            return false;
        }
    }

    function mostrarSugestoes(sugestoes) {
        resultado.innerHTML = '';
        resultado.style.display = 'flex';

        sugestoes.forEach(cosmetico => {
            const div = document.createElement('div');
            div.textContent = cosmetico.name;
            div.classList.add('sugestao-item');
            div.addEventListener('click', () => {
                input.value = cosmetico.name;
                resultado.innerHTML = '';
                resultado.style.display = 'none';
            });
            resultado.appendChild(div);
        });
    }

    function criarTabela(cosmetico, skinDoDia) {
        let tabela = document.querySelector('#subContainer table');
        let tbody;
    
        if (!tabela) {
            tabela = document.createElement('table');
            tabela.classList.add('table-fortnite', 'mt-4');
            tabela.innerHTML = `
                <thead>
                    <tr>
                        <th>Imagem</th>
                        <th>Nome</th>
                        <th>Raridade</th>
                        <th>Capítulo</th>
                        <th>Temporada</th>
                        <th>Ano de Lançamento</th>
                    </tr>
                </thead>
            `;
            tbody = document.createElement('tbody');
            tabela.appendChild(tbody);
            document.getElementById('subContainer').appendChild(tabela);
        } else {
            tbody = tabela.querySelector('tbody');
        }
    
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${cosmetico.images.smallIcon}" alt="${cosmetico.name}" id='imgGuess'></td>
            <td class="${cosmetico.name === skinDoDia.name ? 'bg-success' : 'bg-danger'}">${cosmetico.name}</td>
            <td class="${cosmetico.rarity.displayValue === skinDoDia.rarity.displayValue ? 'bg-success' : 'bg-danger'}">${cosmetico.rarity.displayValue}</td>
            <td class="${Number(cosmetico.introduction.chapter) === Number(skinDoDia.introduction.chapter) ? 'bg-success' : 'bg-danger'}">${Number(cosmetico.introduction.chapter)}</td>
            <td class="${Number(cosmetico.introduction.season) === Number(skinDoDia.introduction.season) ? 'bg-success' : 'bg-danger'}">${Number(cosmetico.introduction.season)}</td>
            <td class="${new Date(cosmetico.added).getFullYear() === new Date(skinDoDia.added).getFullYear() ? 'bg-success' : 'bg-danger'}">${new Date(cosmetico.added).getFullYear()}</td>
        `;
        tbody.appendChild(tr);
    }

    function reduzirVida() {
        vidaAtual -= 10;
        if (vidaAtual <= 0) {
            vidaAtual = 0;
            finalizarJogo(false);
        }
        atualizarVidaDisplay();
    }

    function finalizarJogo(acertou) {
        jogoFinalizado = true;
        resultado.innerHTML = acertou
            ? `<span class="resultado-acertou">Você venceu! Parabéns! A skin era ${skinDoDia.name}.</span>`
            : `<span class="resultado-errou">Você perdeu! A skin correta era ${skinDoDia.name}.</span>`;
    }

    cosmInfo();
});

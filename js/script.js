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

    // Não tirar isso aqui, não sei o porque mas é essa variavel que ta fazendo maioria do código funcionar
    let jogoFinalizado = false;

    // Armazenar as variaveis no localStorage
    // O "||" é pra caso nn tenha nada no armazenamento seja a o que esta após ela
    let streak = parseInt(localStorage.getItem('streak')) || 0;
    let vidaAtual = parseInt(localStorage.getItem('vida')) || vidaMaxima;
    console.log(vidaAtual)
    let tentativas = parseInt(localStorage.getItem('tentativas')) || 0;

    //dicas usadas ou não permanecem após refresh
    let dicasUsadas = JSON.parse(localStorage.getItem('dicasUsadas')) || [false, false, false];

    // Exibir streak na tela
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
                skin.name.toLowerCase() !== 'Humano Bill' &&
                skin.name.toLowerCase() !== 'Unidade de Autodefesa Stark' &&
                skin.name.toLowerCase() !== 'Saqueador Pesado' &&
                skin.name.toLowerCase() !== 'Tigresa' &&
                skin.name.toLowerCase() !== 'Jonesy — O Primeiro' &&
                skin.name.toLowerCase() !== 'Jonesy — O Segundeiro' &&
                skin.rarity.displayValue.toLowerCase() !== 'comum'
            );

            if (cosmetics.length > 0) {

                const skinDoDia = selecionarSkinAleatoria(cosmetics);

                // Verificação dos campos descrição e set
                const descricao = skinDoDia.description || 'não há';
                const set = skinDoDia.set && skinDoDia.set.value ? skinDoDia.set.value : 'não há';

                // Definir as dicas com base na skin do dia
                const dicas = [
                    `Descrição: ${descricao}`,
                    `Set: ${set}`,
                    `${skinDoDia.images.smallIcon}` // Última dica é a URL da imagem
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

        // Verificar se já existe uma skin no localStorage
        if (skinArmazenada) {
            console.log('Usando skin armazenada:', JSON.parse(skinArmazenada));
            return JSON.parse(skinArmazenada);  // Retorna a skin armazenada
        } else {
            // Se não houver skin armazenada, roleta uma nova
            const indiceAleatorio = Math.floor(Math.random() * data.length);
            const skinDoDia = data[indiceAleatorio];

            // Verificação dos campos "chapter" e "season"
            const capitulo = skinDoDia.introduction && skinDoDia.introduction.chapter ? skinDoDia.introduction.chapter : "0";
            const temporada = skinDoDia.introduction && skinDoDia.introduction.season ? skinDoDia.introduction.season : "0";

            console.log(`Icone: ${skinDoDia.images.smallIcon}`);
            console.log(`Nome: ${skinDoDia.name}`);
            console.log(`Raridade: ${skinDoDia.rarity.displayValue}`);
            console.log(`Capitulo: ${Number(capitulo)}`);
            console.log(`Temporada: ${Number(temporada)}`);
            console.log(`Ano de Lançamento: ${new Date(skinDoDia.added).getFullYear()}`);

            // Armazena a nova skin no localStorage
            localStorage.setItem('skinDoDia', JSON.stringify(skinDoDia));

            return skinDoDia;
        }
    }

    // Função para resetar a streak
    function resetarStreak() {
        streak = 0;
        localStorage.setItem('streak', streak); // Atualiza no localStorage
        acertosDisplay.textContent = `${streak}`; // Atualiza o display da streak
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

            // Atualiza estado de dicas usadas
            dicasUsadas[indice] = true;
            localStorage.setItem('dicasUsadas', JSON.stringify(dicasUsadas));

            // Exibe a dica
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
            if (!jogoFinalizado) {
                const valorInput = input.value.toLowerCase().trim();
                if (valorInput === "") {
                    resultado.textContent = "Por favor, digite o nome de uma skin.";
                    return;
                }

                const isAcerto = validarSkin(valorInput, cosmetics, skinDoDia);
                if (!isAcerto) {
                    Errou();
                    verifLoose();
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

    function validarSkin(inputValor, cosmetics, skinDoDia) {
        const cosmeticoEncontrado = cosmetics.find(cosmetico => cosmetico.name.toLowerCase() === inputValor);

        if (cosmeticoEncontrado) {
            if (cosmeticoEncontrado.name.toLowerCase() === skinDoDia.name.toLowerCase()) {
                resultado.textContent = `Você acertou! A skin é "${skinDoDia.name}".`;
                criarTabela(cosmeticoEncontrado, skinDoDia);
                WIN();
                return true;

            } else {
                resultado.textContent = `Skin encontrada, mas não é a correta. Continue tentando!`;
                criarTabela(cosmeticoEncontrado, skinDoDia);
                return false;
            }
        } else {
            resultado.textContent = `Nenhum cosmético encontrado com o nome "${inputValor}".`;
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


    // adicionando comentário so pra perguntar depois pra que serve. Não entendi lol
    document.addEventListener('DOMContentLoaded', function () {
        // Exemplo de dados fictícios para uma skin, substitua pelos dados reais
        const skinDoDia = {
            name: 'Midas',
            rarity: { displayValue: 'Lendário' },
            introduction: { chapter: 2, season: 2 },
            added: '2020-01-01T00:00:00Z',
            images: { smallIcon: 'https://example.com/midas-icon.png' }
        };

        const cosmetico = {
            name: 'Midas',
            rarity: { displayValue: 'Lendário' },
            introduction: { chapter: 2, season: 2 },
            added: '2020-01-01T00:00:00Z',
            images: { smallIcon: 'https://example.com/midas-icon.png' }
        };

        criarTabela(cosmetico, skinDoDia);
    });

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

        const nomeClasse = cosmetico.name === skinDoDia.name ? 'cell-similar' : 'cell-lower';
        const raridadeClasse = cosmetico.rarity.displayValue === skinDoDia.rarity.displayValue ? 'cell-similar' : 'cell-lower';
        const capituloEstilo = estiloCelula(Number(cosmetico.introduction.chapter), Number(skinDoDia.introduction.chapter));
        const temporadaEstilo = estiloCelula(Number(cosmetico.introduction.season), Number(skinDoDia.introduction.season));
        const anoEstilo = estiloCelula(new Date(cosmetico.added).getFullYear(), new Date(skinDoDia.added).getFullYear());

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${cosmetico.images && cosmetico.images.smallIcon ? cosmetico.images.smallIcon : ''}" alt="${cosmetico.name || 'Sem imagem'}" id='imgGuess'></td>
            <td class="${nomeClasse}">${cosmetico.name || ''}</td>
            <td class="${raridadeClasse}">${cosmetico.rarity.displayValue || ''}</td>
            <td class="${capituloEstilo.classe}">
                ${cosmetico.introduction.chapter || '0'} ${capituloEstilo.seta}
            </td>
            <td class="${temporadaEstilo.classe}">
                ${cosmetico.introduction.season || '0'} ${temporadaEstilo.seta}
            </td>
            <td class="${anoEstilo.classe}">
                ${new Date(cosmetico.added).getFullYear()} ${anoEstilo.seta}
            </td>
        `;
        tbody.insertBefore(tr, tbody.firstChild);

        // Salvar a tabela no localStorage com estilização
        salvarTabelaNoLocalStorage();
    }

    function estiloCelula(valor, valorSkinDoDia) {
        if (valor === valorSkinDoDia) {
            return { classe: 'cell-similar', seta: '' };
        } else if (valor > valorSkinDoDia) {
            return { classe: 'cell-higher', seta: '↓' };
        } else {
            return { classe: 'cell-lower', seta: '↑' };
        }
    }
    
    function salvarTabelaNoLocalStorage() {
        const tabela = document.querySelector('#subContainer table tbody');
        if (tabela) {
            const dadosTabela = Array.from(tabela.querySelectorAll('tr')).map(tr => {
                const cols = tr.querySelectorAll('td');
                return {
                    imagem: cols[0].querySelector('img') ? cols[0].querySelector('img').src : '',
                    nome: cols[1].textContent,
                    classeNome: cols[1].className,  // Salva a classe do nome
                    raridade: cols[2].textContent,
                    classeRaridade: cols[2].className,  // Salva a classe da raridade
                    capitulo: cols[3].textContent.trim(),
                    classeCapitulo: cols[3].className,  // Salva a classe do capítulo
                    temporada: cols[4].textContent.trim(),
                    classeTemporada: cols[4].className,  // Salva a classe da temporada
                    ano: cols[5].textContent.trim(),
                    classeAno: cols[5].className  // Salva a classe do ano
                };
            });
            localStorage.setItem('dadosTabela', JSON.stringify(dadosTabela));
        }
    }


    function carregarTabelaDoLocalStorage() {
        const dadosTabela = JSON.parse(localStorage.getItem('dadosTabela'));

        // Verifica se há dados a serem carregados
        if (dadosTabela && dadosTabela.length > 0) {
            let tabela = document.querySelector('#subContainer table');  // Procura a tabela
            let tbody;

            // Se a tabela não existir, cria uma nova tabela
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
                document.getElementById('subContainer').appendChild(tabela);  // Adiciona a tabela ao contêiner
            } else {
                tbody = tabela.querySelector('tbody');
            }

            // Limpa a tabela antes de adicionar os dados do localStorage
            tbody.innerHTML = '';

            // Recria as linhas da tabela
            dadosTabela.forEach(dado => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                <td><img src="${dado.imagem || ''}" alt="${dado.nome || 'Sem imagem'}" id='imgGuess'></td>
                <td class="${dado.classeNome || ''}">${dado.nome || ''}</td>
                <td class="${dado.classeRaridade || ''}">${dado.raridade || ''}</td>
                <td class="${dado.classeCapitulo || ''}">
                    ${dado.capitulo || ''}
                </td>
                <td class="${dado.classeTemporada || ''}">
                    ${dado.temporada || ''}
                </td>
                <td class="${dado.classeAno || ''}">
                    ${dado.ano || ''}
                </td>
            `;
                tbody.appendChild(tr);
            });
        }
    }

    // Chame essa função ao carregar a página
    carregarTabelaDoLocalStorage();

    function limparTabelaNoProximoRefresh() {
        localStorage.setItem('limparTabela', 'true'); // Coloca a flag no localStorage
    }

    function verificarLimparTabela() {
        const limparTabela = localStorage.getItem('limparTabela');

        if (limparTabela === 'true') {
            // Limpa a tabela e remove a flag
            localStorage.removeItem('dadosTabela');
            localStorage.removeItem('limparTabela');  // Remove a flag
            const tabela = document.querySelector('#subContainer table tbody');
            if (tabela) {
                tabela.innerHTML = '';  // Limpa a tabela visualmente
            }
        }
    }


    function fireConfetti() {

        const jsConfetti = new JSConfetti();
        jsConfetti.addConfetti({
            emojis: ['🎉', '✨', '🥳', '😁', '🎇', '😎'],
        })
        
    }
    
    function Errou() {
        vidaAtual -= 5;
        tentativas += 1;
        localStorage.setItem('tentativas', tentativas);
        localStorage.setItem('vida', vidaAtual);
        atualizarVidaDisplay();
    } 
    
    function WIN() {
        input.disabled = true;
        botao.disabled = true;
        // Exibe a skin no modal de vitória
        const skinDoDia = JSON.parse(localStorage.getItem('skinDoDia')); // Recupera a skin armazenada
        if (skinDoDia) {
            // Atualiza o modal com as informações da skin
            document.getElementById('vitoriaSkinImagem').src = skinDoDia.images.smallIcon;
            document.getElementById('vitoriaSkinNome').textContent = skinDoDia.name;
        }

        var victoryModal = new bootstrap.Modal(document.getElementById('victoryModal'));
        victoryModal.show();
        fireConfetti();
        atualizarSequenciaAcertos();

        
    
        // Marcar para limpar a tabela no próximo refresh
        limparTabelaNoProximoRefresh();
    
        // Reseta variáveis globais e localStorage (mantém essas partes)
        localStorage.removeItem('dicasUsadas');
        localStorage.removeItem('tentativas');
        localStorage.removeItem('skinDoDia');
        localStorage.removeItem('vida');
    
        tentativas = 0;
        dicasUsadas = [false, false, false];
        vidaAtual = vidaMaxima;
        atualizarVidaDisplay();
        cosmInfo();  // Seleciona uma nova skin após a vitória
    }
    
    function verifLoose() {
        if (vidaAtual <= 0) {
            input.disabled = true;
            botao.disabled = true;
            
            // Exibe a skin no modal de derrota
            const skinDoDia = JSON.parse(localStorage.getItem('skinDoDia')); // Recupera a skin armazenada
            if (skinDoDia) {
                // Atualiza o modal com as informações da skin
                document.getElementById('derrotaSkinImagem').src = skinDoDia.images.smallIcon;
                document.getElementById('derrotaSkinNome').textContent = skinDoDia.name;
            }
    
            var defeatModal = new bootstrap.Modal(document.getElementById('defeatModal'));
            defeatModal.show();
    
            // Marcar para limpar a tabela no próximo refresh
            limparTabelaNoProximoRefresh();
    
            // Reseta variáveis globais e localStorage (mantém essas partes)
            localStorage.removeItem('dicasUsadas');
            localStorage.removeItem('tentativas');
            localStorage.removeItem('skinDoDia');
            localStorage.removeItem('vida');
            
            tentativas = 0;
            dicasUsadas = [false, false, false];
            cosmInfo();  // Seleciona uma nova skin após a perda
            resetarStreak();
        } else {
            localStorage.setItem('vida', vidaAtual);
        }
        atualizarVidaDisplay();
    }
    

    function atualizarSequenciaAcertos() {
        streak += 1;
        localStorage.setItem('streak', streak); // Atualiza no localStorage
        acertosDisplay.textContent = `${streak}`; // Atualiza o display da streak
    }
    
    function Proximo(){
    const botaoProximo = document.getElementById('Proximo');
    botaoProximo.addEventListener('click', () => {
        location.reload(); // Recarrega a página
    });
    const botaoProximo2 = document.getElementById('Proximo2');
        botaoProximo2.addEventListener('click', () => {
            location.reload(); // Recarrega a página
        });
}

    cosmInfo();
    atualizarEstadoLampadas();
    atualizarVidaDisplay();
    verificarLimparTabela();
    verifLoose();
    Proximo();
});
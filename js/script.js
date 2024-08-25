document.addEventListener('DOMContentLoaded', function () {
    const apiKey = 'b8640be5-2dfb-4aca-9a3d-36168a169868';
    const input = document.getElementById('inputPoggers');
    const botao = document.getElementById('buttonPoggers');
    const resultado = document.getElementById('resultado');

    async function cosmInfo() {
        const urlQuery = `https://fortnite-api.com/v2/cosmetics/br/search/all/?language=pt-BR&type=outfit`;

        try {
            const response = await fetch(urlQuery, {
                headers: {
                    'Authorization': apiKey
                }
            });

            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status}`);
            }

            const data = await response.json();

            if (data.data && data.data.length > 0) {
                // Seleciona uma "skin do dia" aleatoriamente
                const indiceAleatorio = Math.floor(Math.random() * data.data.length);
                const skinDoDia = data.data[indiceAleatorio]; // Define a "skin do dia"

                const iconV = skinDoDia.images.smallIcon;
                const nomeV = skinDoDia.name;
                const raridadeV = skinDoDia.rarity.displayValue;
                const capituloV = Number(skinDoDia.introduction.chapter); // Transformando em número
                const temporadaV = skinDoDia.introduction.season;
                const anoLancamentoV = new Date(skinDoDia.added).getFullYear();

                console.log(`Icone: ${iconV}`);
                console.log(`Nome: ${nomeV}`);
                console.log(`Raridade: ${raridadeV}`);
                console.log(`Capitulo: ${capituloV}`);
                console.log(`Temporada: ${temporadaV}`);
                console.log(`Ano de Lançamento: ${anoLancamentoV}`);

                // Evento do Botão
                botao.addEventListener('click', () => {
                    const valorInput = input.value.toLowerCase().trim();

                    // Verifica se o nome inserido pelo usuário corresponde a qualquer skin na API
                    const cosmeticoEncontrado = data.data.find(cosmetico => cosmetico.name.toLowerCase() === valorInput);

                    if (cosmeticoEncontrado) {
                        const mensagem = validarCosmetico(cosmeticoEncontrado, skinDoDia.name, skinDoDia.rarity.displayValue, capituloV, skinDoDia.introduction.season);
                        resultado.textContent = mensagem;
                        criarTabela(cosmeticoEncontrado, skinDoDia); // Criar tabela com as informações da skin encontrada
                    } else {
                        resultado.textContent = `Nenhum cosmético encontrado com o nome "${valorInput}".`;
                    }

                    // Verifica se o nome inserido pelo usuário corresponde à "skin do dia"
                    if (skinDoDia.name.toLowerCase() === valorInput) {
                        criarTabela(skinDoDia, skinDoDia); // Criar tabela com as informações da "skin do dia"
                    }
                });
            } else {
                console.log('Índice fora do alcance ou array vazio.');
            }

        } catch (error) {
            console.error('Erro na requisição:', error);
        }
    }

    // Função para criar a tabela
    function criarTabela(cosmetico, skinDoDia) {
        let tabela = document.querySelector('#subContainer table');
        let tbody;
    
        if (!tabela) {
            tabela = document.createElement('table');
            tabela.classList.add('table', 'table-striped', 'mt-4');
            
            const thead = document.createElement('thead');
            thead.innerHTML = `
                <tr>
                    <th>Imagem</th>
                    <th>Nome</th>
                    <th>Raridade</th>
                    <th>Capítulo</th>
                    <th>Temporada</th>
                    <th>Ano de Lançamento</th>
                </tr>
            `;
            tabela.appendChild(thead);
    
            tbody = document.createElement('tbody');
            tabela.appendChild(tbody);
    
            document.getElementById('subContainer').appendChild(tabela);
        } else {
            tbody = tabela.querySelector('tbody');
        }

        // Função para determinar o estilo da célula
        function estiloCelula(valor, valorSkinDoDia) {
            if (valor === valorSkinDoDia) {
                return { classe: 'bg-success', seta: '' };
            } else if (valor > valorSkinDoDia) {
                return { classe: 'bg-warning', seta: '↓' };
            } else {
                return { classe: 'bg-warning', seta: '↑' };
            }
        }
    
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${cosmetico.images.smallIcon}" alt="${cosmetico.name}" ></td>
            <td class="${cosmetico.name === skinDoDia.name ? 'bg-success' : 'bg-danger'}">${cosmetico.name}</td>
            <td class="${cosmetico.rarity.displayValue === skinDoDia.rarity.displayValue ? 'bg-success' : 'bg-danger'}">${cosmetico.rarity.displayValue}</td>
            <td class="${estiloCelula(Number(cosmetico.introduction.chapter), Number(skinDoDia.introduction.chapter)).classe}">
                ${cosmetico.introduction.chapter} ${estiloCelula(Number(cosmetico.introduction.chapter), Number(skinDoDia.introduction.chapter)).seta}
            </td>
            <td class="${estiloCelula(cosmetico.introduction.season, skinDoDia.introduction.season).classe}">
                ${cosmetico.introduction.season} ${estiloCelula(cosmetico.introduction.season, skinDoDia.introduction.season).seta}
            </td>
            <td class="${estiloCelula(new Date(cosmetico.added).getFullYear(), new Date(skinDoDia.added).getFullYear()).classe}">
                ${new Date(cosmetico.added).getFullYear()} ${estiloCelula(new Date(cosmetico.added).getFullYear(), new Date(skinDoDia.added).getFullYear()).seta}
            </td>
        `;
    
        // Adiciona a nova linha como a primeira do tbody
        tbody.insertBefore(tr, tbody.firstChild);
    }

    // Função de Validação Separada
    function validarCosmetico(cosmeticoEncontrado, nome, raridade, capitulo, temporada) {
        let mensagem = `Nome: ${cosmeticoEncontrado.name}\n`;

        const raridadeJ = cosmeticoEncontrado.rarity.displayValue;
        const capituloJ = Number(cosmeticoEncontrado.introduction.chapter); // Transformando em número
        const temporadaJ = cosmeticoEncontrado.introduction.season;

        if (raridadeJ.toLowerCase() === raridade.toLowerCase()) {
            mensagem += `Mesma raridade: ${raridade}`;
        } else {
            mensagem += `Raridade diferente`;
        }

        if (capituloJ === capitulo) {
            mensagem += `Mesmo capítulo: ${capitulo}`;
        } else if (capituloJ > capitulo) {
            mensagem += `Capítulo menor: ${capituloJ}`;
        } else {
            mensagem += `Capítulo maior: ${capituloJ}`;
        }

        if (temporadaJ === temporada) {
            mensagem += `Mesma temporada: ${temporada}`;
        } else if (temporadaJ > temporada) {
            mensagem += `Temporada menor: ${temporadaJ}`;
        } else {
            mensagem += `Temporada maior: ${temporadaJ}`;
        }

        if (cosmeticoEncontrado.name.toLowerCase() === nome.toLowerCase()) {
            mensagem = `Você acertou! A skin do dia era: ${nome}`;
        }

        return mensagem;
    }

    cosmInfo();
});

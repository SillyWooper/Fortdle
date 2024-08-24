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

                const indiceAleatorio = Math.floor(Math.random() * data.data.length);
                const cosmetico = data.data[indiceAleatorio];

                const icon = cosmetico.images.smallIcon;
                const nome = cosmetico.name;
                const raridade = cosmetico.rarity.displayValue;
                const capitulo = cosmetico.introduction.chapter;
                const temporada = cosmetico.introduction.season;
                const anoLancamento = new Date(cosmetico.added).getFullYear();

                console.log(`Icone: ${icon}`)
                console.log(`Nome: ${nome}`)
                console.log(`Raridade: ${raridade}`)
                console.log(`Capitulo: ${capitulo}`)
                console.log(`Temporada: ${temporada}`)
                console.log(`Ano de Lançamento: ${anoLancamento}`)

                // Evento do Botão
                botao.addEventListener('click', () => {
                    const valorInput = input.value.toLowerCase().trim();
                    const cosmeticoEncontrado = data.data.find(cosmetico =>
                        cosmetico.name.toLowerCase().includes(valorInput)
                    );

                    if (cosmeticoEncontrado) {
                        const mensagem = validarCosmetico(cosmeticoEncontrado, cosmeticoEncontrado.name, cosmeticoEncontrado.rarity.displayValue, cosmeticoEncontrado.introduction.chapter, cosmeticoEncontrado.introduction.season);
                        resultado.textContent = mensagem;

                        // Criar tabela com as informações da skin encontrada
                        criarTabela(cosmeticoEncontrado);
                    } else {
                        resultado.textContent = `Nenhum cosmético encontrado com o nome "${valorInput}".`;
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
    function criarTabela(cosmetico) {
        let tabela = document.querySelector('#subContainer table');
        let tbody;
    
        if (!tabela) {
            tabela = document.createElement('table');
            tabela.classList.add('table', 'table-striped', 'mt-4');
            
            const thead = document.createElement('thead');
            thead.innerHTML = `
                <tr>
                    <th text-center>Imagem</th>
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
    
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class='' style:''><img src="${cosmetico.images.smallIcon}" alt="${cosmetico.name}" ></td>
            <td class='' style:''>${cosmetico.name}</td>
            <td class='' style:''>${cosmetico.rarity.displayValue}</td>
            <td class='' style:''>${cosmetico.introduction.chapter}</td>
            <td class='' style:''>${cosmetico.introduction.season}</td>
            <td class='' style:''>${new Date(cosmetico.added).getFullYear()}</td>
        `;
    
        // Adiciona a nova linha como a primeira do tbody
        tbody.insertBefore(tr, tbody.firstChild);
    }
    
    
    // Não sei o que aconteceu mas a validação parou de funcionar quando consegui a tabela das respostas, for mal bryan :(
    // Culpe o chat GPT
    // Função de Validação Separada
    function validarCosmetico(cosmeticoEncontrado, nome, raridade, capitulo, temporada) {
        let mensagem = `Nome: ${cosmeticoEncontrado.name}\n`;

        const raridadeJ = cosmeticoEncontrado.rarity.displayValue;
        const capituloJ = cosmeticoEncontrado.introduction.chapter;
        const temporadaJ = cosmeticoEncontrado.introduction.season;

        if (raridadeJ.toLowerCase() === raridade.toLowerCase()) {
            mensagem += `Mesma raridade: ${raridade}\n`;
        } else {
            mensagem += `Raridade diferente: ${raridadeJ} vs ${raridade}\n`;
        }

        if (capituloJ == capitulo) {
            mensagem += `Mesmo capítulo: ${capitulo}\n`;
        } else if (capituloJ > capitulo) {
            mensagem += `Capítulo maior: ${capituloJ} vs ${capitulo}\n`;
        } else {
            mensagem += `Capítulo menor: ${capituloJ} vs ${capitulo}\n`;
        }

        if (temporadaJ == temporada) {
            mensagem += `Mesma temporada: ${temporada}\n`;
        } else if (temporadaJ > temporada) {
            mensagem += `Temporada maior: ${temporadaJ} vs ${temporada}\n`;
        } else {
            mensagem += `Temporada menor: ${temporadaJ} vs ${temporada}\n`;
        }

        if (cosmeticoEncontrado.name.toLowerCase() === nome.toLowerCase()) {
            mensagem = `Você acertou! A skin do dia era: ${nome}`;
        } else {
            mensagem += `A skin do dia era: ${nome}`;
        }

        return mensagem;
    }

    cosmInfo();
});

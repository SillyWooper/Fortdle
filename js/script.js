document.addEventListener("DOMContentLoaded", function () {
    const logo = document.getElementById('logo_fortdle');
    const lamps = document.querySelectorAll('.lamp');
    const gearIcon = document.getElementById('gearIcon');
    const settingsPopup = document.getElementById('settingsPopup');
    const closePopup = document.getElementById('closePopup');
    const timerElement = document.getElementById('timer');
    const gameModeSelect = document.getElementById('gameModeSelect');
    const languageIcon = document.getElementById('languageIcon');
    const languagePopup = document.getElementById('languagePopup');
    const closeLanguagePopup = document.getElementById('closeLanguagePopup');
    const guessForm = document.getElementById('guessForm');
    const resultsContainer = document.getElementById('resultsContainer');
    const resultsTableBody = document.getElementById('resultsTableBody');
    const livesCountElement = document.getElementById('livesCount');
    const howToPlayPopup = document.getElementById('howToPlayPopup');
    const understoodButton = document.getElementById('understoodButton');
    const hintPopup = document.getElementById('hintPopup');
    const closeHintPopup = document.getElementById('closeHintPopup');
    const hintText = document.getElementById('hintText');
    const reportBugButton = document.getElementById('reportBugButton');
    const darkModeOption = document.getElementById('DarkModeOption');
    const clickToValidateOption = document.getElementById('clickToValidateOption');
    const muteSoundOption = document.getElementById('MuteSoundOption');
    const healthBarFill = document.getElementById('healthBarFill');
    const hintContainer = document.getElementById('hintContainer');

    let lives = 100;
    let rounds = 0;

    howToPlayPopup.style.display = 'block';

    understoodButton.addEventListener('click', function () {
        howToPlayPopup.style.display = 'none';
    });

    // Animação de pulo
    [gearIcon, languageIcon, h1, h2, button].forEach(element => {
        element.addEventListener('mouseover', () => element.style.transform = 'scale(1.1)');
        element.addEventListener('mouseout', () => element.style.transform = 'scale(1)');
    });

    // Abre as dicas
    lamps.forEach((lamp, index) => {
        lamp.addEventListener('click', function () {
            if (rounds >= 3) {
                lamp.classList.add('active');
                hintPopup.style.display = 'block';
                hintText.textContent = `Dica ${index + 1}: Esta é uma dica exemplo.`;
            } else {
                alert("Você só pode pedir dicas após 3 rodadas.");
            }
        });
    });

    // Fecha as dicas
    closeHintPopup.addEventListener('click', function () {
        hintPopup.style.display = 'none';
    });

    // Abre as config
    gearIcon.addEventListener('click', function () {
        settingsPopup.style.display = 'block';
    });

    // Fecha as config
    closePopup.addEventListener('click', function () {
        settingsPopup.style.display = 'none';
    });

    // Abre bandeirinha
    languageIcon.addEventListener('click', function () {
        languagePopup.style.display = 'block';
    });

    // Fecha bandeirinha
    closeLanguagePopup.addEventListener('click', function () {
        languagePopup.style.display = 'none';
    });

    // Timer
    function updateTimer() {
        let now = new Date();
        let tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        let diff = tomorrow - now;
        let hours = Math.floor(diff / 1000 / 60 / 60);
        let minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((diff % (1000 * 60)) / 1000);
        timerElement.textContent = `${hours}:${minutes}:${seconds}`;
    }

    setInterval(updateTimer, 1000);

    // Muda o modo de jogo e o placeholder do input
    gameModeSelect.addEventListener('change', function () {
        const mode = gameModeSelect.value;
        const input = document.getElementById('weaponInput');
        if (mode === 'guessWeapon') {
            input.placeholder = 'Digite o nome da arma';
        } else if (mode === 'guessPlayer') {
            input.placeholder = 'Digite o nome do player';
        } else if (mode === 'hardMode') {
            input.placeholder = 'Digite o nome de uma arma no modo difícil';
        }
    });

    // Função para evitar que a página recarregue ao enviar o formulário
    guessForm.addEventListener('submit', function (event) {
        event.preventDefault();
        rounds++;
        if (lives <= 0) {
            alert('Você não tem mais vidas. Tente novamente amanhã.');
            return;
        }

        if (rounds === 1) {
            hintContainer.style.display = 'block';
        }

        const guess = document.getElementById('weaponInput').value;
        const mode = gameModeSelect.value;

        const characteristics = [
            { name: 'Tipo', correct: 'Rifle', near: 'Pistola', wrong: 'Lança-foguetes' },
            { name: 'Cor', correct: 'Azul', near: 'Verde', wrong: 'Vermelho' },
            { name: 'Dano', correct: '50', near: '40', wrong: '20' },
        ];

        if (mode === 'hardMode') {
            characteristics[0] = { name: 'Tipo', correct: 'Submetralhadora', near: 'Escopeta', wrong: 'Sniper' };
            characteristics[1] = { name: 'Cor', correct: 'Cinza', near: 'Marrom', wrong: 'Preto' };
            characteristics[2] = { name: 'Dano', correct: '30', near: '25', wrong: '10' };
        }

        resultsTableBody.innerHTML = '';
        characteristics.forEach(characteristic => {
            const tr = document.createElement('tr');
            const tdName = document.createElement('td');
            const tdGuess = document.createElement('td');
            const tdResult = document.createElement('td');

            tdName.textContent = characteristic.name;
            tdGuess.textContent = guess;

            if (guess === characteristic.correct) {
                tdResult.textContent = 'Correto';
                tdResult.classList.add('correct');
            } else if (guess === characteristic.near) {
                tdResult.textContent = 'Próximo';
                tdResult.classList.add('near');
            } else {
                tdResult.textContent = 'Errado';
                tdResult.classList.add('wrong');

                lives -= 5;
                healthBarFill.style.width = `${lives}%`;
                if (lives > 50) {
                    healthBarFill.style.backgroundColor = '#28a745';
                } else if (lives > 20) {
                    healthBarFill.style.backgroundColor = '#ffc107';
                } else {
                    healthBarFill.style.backgroundColor = '#dc3545';
                }
            }

            tr.appendChild(tdName);
            tr.appendChild(tdGuess);
            tr.appendChild(tdResult);
            resultsTableBody.appendChild(tr);
        });

        resultsContainer.classList.remove('hidden');

        if (lives <= 0) {
            alert('Você não tem mais vidas. Tente novamente amanhã.');
        }
    });

    // Report Bug
    reportBugButton.addEventListener('click', function () {
        window.location.href = 'https://discord.gg/Y9PZbFF44x'; // Insira o link correto do Discord
    });

    // Modo Alto Contraste
    darkModeOption.addEventListener('change', function () {
        document.body.classList.toggle('dark-mode');
    });

    // Click to Validate
    let clickToValidateEnabled = false;
    clickToValidateOption.addEventListener('change', function () {
        clickToValidateEnabled = clickToValidateOption.checked;
    });

    guessForm.addEventListener('submit', function (event) {
        if (clickToValidateEnabled) {
            event.preventDefault();
            alert('Você precisa clicar em "Adivinhar" para validar sua resposta.');
        }
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const logo = document.getElementById('logo_fortdle');
    const lamps = document.querySelectorAll('.lamp');
    const gearIcon = document.getElementById('gearIcon');
    const settingsPopup = document.getElementById('settingsPopup');
    const closePopup = document.getElementById('closePopup');
    const timerElement = document.getElementById('timer');
    const gameModeSelect = document.getElementById('gameModeSelect');
    const languageIcon = document.getElementById('languageIcon');
    const languagePopup = document.getElementById('languagePopup');
    const closeLanguagePopup = document.getElementById('closeLanguagePopup');
    const guessForm = document.getElementById('guessForm');
    const resultsContainer = document.getElementById('resultsContainer');
    const resultsTableBody = document.getElementById('resultsTableBody');
    const livesCountElement = document.getElementById('livesCount');
    const howToPlayPopup = document.getElementById('howToPlayPopup');
    const understoodButton = document.getElementById('understoodButton');
    const hintPopup = document.getElementById('hintPopup');
    const closeHintPopup = document.getElementById('closeHintPopup');
    const hintText = document.getElementById('hintText');
    const reportBugButton = document.getElementById('reportBugButton');

    let lives = 5;

    howToPlayPopup.style.display = 'block';

    understoodButton.addEventListener('click', function () {
        howToPlayPopup.style.display = 'none';
    });

    logo.addEventListener('mouseover', function () {
        logo.style.transform = 'scale(1.1)';
    });

    logo.addEventListener('mouseout', function () {
        logo.style.transform = 'scale(1)';
    });

    // Abre as dicas
    lamps.forEach((lamp, index) => {
        lamp.addEventListener('click', function () {
            lamp.classList.add('active');
            hintPopup.style.display = 'block';
            hintText.textContent = `Dica ${index + 1}: Esta é uma dica exemplo.`;
        });
    });

    // Fecha as dicas
    closeHintPopup.addEventListener('click', function () {
        hintPopup.style.display = 'none';
    });

    // Abre as config
    gearIcon.addEventListener('click', function () {
        settingsPopup.style.display = 'block';
    });

    // Fecha as config
    closePopup.addEventListener('click', function () {
        settingsPopup.style.display = 'none';
    });

    // Abre bandeirinha
    languageIcon.addEventListener('click', function () {
        languagePopup.style.display = 'block';
    });

    // Fecha bandeirinha
    closeLanguagePopup.addEventListener('click', function () {
        languagePopup.style.display = 'none';
    });

    // Timer
    function updateTimer() {
        let now = new Date();
        let tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        let diff = tomorrow - now;
        let hours = Math.floor(diff / 1000 / 60 / 60);
        let minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((diff % (1000 * 60)) / 1000);
        timerElement.textContent = `${hours}:${minutes}:${seconds}`;
    }

    setInterval(updateTimer, 1000);

    // Muda o modo de jogo
    gameModeSelect.addEventListener('change', function () {
        const mode = gameModeSelect.value;
        const input = document.getElementById('weaponInput');
        if (mode === 'guessWeapon') {
            input.placeholder = 'Digite o nome da arma';
        } else if (mode === 'guessPlayer') {
            input.placeholder = 'Digite o nome do player';
        } else if (mode === 'hardMode') {
            input.placeholder = 'Digite o nome da arma (Modo Difícil)';
        }
    });

    guessForm.addEventListener('submit', function (event) {
        event.preventDefault();
        if (lives <= 0) {
            alert('Você não tem mais vidas. Tente novamente amanhã.');
            return;
        }
        
        const guess = document.getElementById('weaponInput').value;
        const mode = gameModeSelect.value;

        const characteristics = [
            { name: 'Tipo', correct: 'Rifle', near: 'Pistola', wrong: 'Lança-foguetes' },
            { name: 'Cor', correct: 'Azul', near: 'Verde', wrong: 'Vermelho' },
            { name: 'Dano', correct: '50', near: '40', wrong: '20' },
        ];

        if (mode === 'hardMode') {
            // Update para o hard mode
            characteristics[0] = { name: 'Tipo', correct: 'Submetralhadora', near: 'Escopeta', wrong: 'Sniper' };
            characteristics[1] = { name: 'Cor', correct: 'Cinza', near: 'Marrom', wrong: 'Preto' };
            characteristics[2] = { name: 'Dano', correct: '30', near: '25', wrong: '10' };
        }

        // Gerar tabela
        resultsTableBody.innerHTML = '';
        characteristics.forEach(characteristic => {
            const tr = document.createElement('tr');
            const tdName = document.createElement('td');
            const tdGuess = document.createElement('td');
            const tdResult = document.createElement('td');

            tdName.textContent = characteristic.name;
            tdGuess.textContent = guess; 
            // Errado, perto ou certo
            if (guess === characteristic.correct) {
                tdResult.textContent = 'Correto';
                tdResult.classList.add('correct');
            } else if (guess === characteristic.near) {
                tdResult.textContent = 'Próximo';
                tdResult.classList.add('near');
            } else {
                tdResult.textContent = 'Errado';
                tdResult.classList.add('wrong');
            }

            tr.appendChild(tdName);
            tr.appendChild(tdGuess);
            tr.appendChild(tdResult);
            resultsTableBody.appendChild(tr);
        });

        // mostra os resultados
        resultsContainer.classList.remove('hidden');

        // diminui a quantidade de vidas que vc tem
        lives--;
        livesCountElement.textContent = lives;

        // vai checar se tu ainda tem vidas
        if (lives <= 0) {
            alert('Você não tem mais vidas. Tente novamente amanhã.');
        }
    });

    // Report Bug
    reportBugButton.addEventListener('click', function () {
        alert('Obrigado por reportar um bug! Vamos verificar o problema.');
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const logo = document.querySelector('#logo_fortdle');
    const gearIcon = document.getElementById('gearIcon');
    const settingsPopup = document.getElementById('settingsPopup');
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
    languagePopup.addEventListener('click', function () {
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

    const guess = document.getElementById('weaponInput').value;
    const mode = gameModeSelect.value;

    resultsTableBody.innerHTML = '';

    resultsContainer.classList.remove('hidden');

    if (lives <= 0) {
        alert('Você não tem mais vidas. Tente novamente amanhã.');
    }
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
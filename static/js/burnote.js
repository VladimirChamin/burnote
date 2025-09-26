
    const textarea = document.getElementById('textarea');
    const saveBtn = document.getElementById('save-btn');
    const savedTexts = document.getElementById('saved-texts');
    const downloadBtn = document.getElementById('download-btn');
    let timer;
    let seconds = 0;
    let countdown;

    // Загрузка сохраненных текстов при загрузке страницы
    loadSavedTexts();

    function containsWordsWithT(AInputText) {
        const nonVerbsEndingWithT = [
            "мать",
            "треть",
            "четверть",
            "стабильность",
            "сидеть",
            "пять",
            "шесть",
            "семь",
            "восемь",
            "девять",
            "десять",
            "двадцать",
            "тридцать",
            "плоть",
            "рать",
            "масть",
            "власть",
            "страсть",
            "честь",
            "месть",
            "весть",
            "жесть",
            "шерсть",
            "прыть",
            "суть",
            "ртуть",
            "муть",
            "жуть",
            "грудь",
            "путь",
            "кисть",
            "горсть",
            "сеть",
            "блять",
            "память",
            "печать",
            "рукоять",
        ];

        const words = AInputText.toLowerCase().split(/\s+/);

        for (let word of words) {
            if (word.endsWith('ть') && !nonVerbsEndingWithT.includes(word)) {
                return true;
            }
        }

        return false;
    }

    function saveText() {
        startTimerPom();
        const text = textarea.value;
        if (!text.trim()) return;

        // Создаем новый элемент списка
        const newParagraph = document.createElement('p');
        const index = savedTexts.children.length + 1;
        newParagraph.textContent = `${index}. ${text}`;

        if (containsWordsWithT(text)) {
            newParagraph.classList.add('highlight');
        }

        const removeBtn = document.createElement('span');
        removeBtn.textContent = '✖️';
        removeBtn.classList.add('remove-btn');
        removeBtn.onclick = () => {
            savedTexts.removeChild(newParagraph);
            updateLineNumbers();
            saveToLocalStorage();
        };

        newParagraph.appendChild(removeBtn);
        savedTexts.appendChild(newParagraph);
        textarea.value = '';
        textarea.focus();

        saveToLocalStorage();

        if (savedTexts.children.length > 0) {
            downloadBtn.style.display = 'block';
        }
    }

    function saveToLocalStorage() {
        const texts = [];
        Array.from(savedTexts.children).forEach(paragraph => {
            texts.push(paragraph.textContent.replace('✖️', '').replace(/^\d+\.\s/, '').trim());
        });
        localStorage.setItem('savedTexts', JSON.stringify(texts));
    }

    function loadSavedTexts() {
        const saved = localStorage.getItem('savedTexts');
        if (saved) {
            const texts = JSON.parse(saved);
            texts.forEach(text => {
                const newParagraph = document.createElement('p');
                const index = savedTexts.children.length + 1;
                newParagraph.textContent = `${index}. ${text}`;

                if (containsWordsWithT(text)) {
                    newParagraph.classList.add('highlight');
                }

                const removeBtn = document.createElement('span');
                removeBtn.textContent = '✖️';
                removeBtn.classList.add('remove-btn');
                removeBtn.onclick = () => {
                    savedTexts.removeChild(newParagraph);
                    updateLineNumbers();
                    saveToLocalStorage();
                };

                newParagraph.appendChild(removeBtn);
                savedTexts.appendChild(newParagraph);
            });

            if (savedTexts.children.length > 0) {
                downloadBtn.style.display = 'block';
            }
        }
    }

    function updateLineNumbers() {
        const paragraphs = savedTexts.children;
        for (let i = 0; i < paragraphs.length; i++) {
            const paragraph = paragraphs[i];
            const text = paragraph.textContent.replace(/^\d+\.\s/, '').replace('✖️', '');
            paragraph.textContent = `${i + 1}. ${text}`;

            const removeBtn = document.createElement('span');
            removeBtn.textContent = '✖️';
            removeBtn.classList.add('remove-btn');
            removeBtn.onclick = () => {
                savedTexts.removeChild(paragraph);
                updateLineNumbers();
                saveToLocalStorage();
            };

            paragraph.appendChild(removeBtn);

            if (containsWordsWithT(text)) {
                paragraph.classList.add('highlight');
            } else {
                paragraph.classList.remove('highlight');
            }
        }

        if (savedTexts.children.length === 0) {
            downloadBtn.style.display = 'none';
        }
    }

    function startTimer() {
        clearTimeout(timer);
        clearInterval(countdown);
        seconds = 0;
        countdown = setInterval(() => {
            seconds++;
        }, 1000);

        timer = setTimeout(() => {
            clearInterval(countdown);
            saveText();
            textarea.value = '';
        }, 2000);
    }

    textarea.addEventListener('input', () => {
        startTimer();
    });

    downloadBtn.addEventListener('click', () => {
        let allText = '';
        Array.from(savedTexts.children).forEach(paragraph => {
            allText += paragraph.textContent.replace('✖️', '').trim() + '\n';
        });

        const blob = new Blob([allText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        const formattedDate = `${year}-${month}-${day}`;
        a.download = `focuses_${formattedDate}.txt`;
        a.click();
        URL.revokeObjectURL(url);

        // Очищаем список после скачивания
        savedTexts.innerHTML = '';
        downloadBtn.style.display = 'none';
        localStorage.removeItem('savedTexts');

        // Сбрасываем таймер Pomodoro
        resetTimer();
    });

    // Таймер Pomodoro
    let pomodoroTimer;
    let isRunning = false;
    let workTime = 25 * 60;
    let breakTime = 5 * 60;
    let timeLeft = workTime;
    let onBreak = false;

    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        document.getElementById('timerPom').textContent =
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    function parseTimeInput(timeStr) {
        const [minutes, seconds] = timeStr.split(':').map(num => parseInt(num));
        return (minutes * 60) + (seconds || 0);
    }

    document.getElementById('timerPom').addEventListener('blur', function () {
        if (!isRunning) {
            const inputTime = this.textContent;
            if (/^\d{1,2}:\d{2}$/.test(inputTime)) {
                timeLeft = parseTimeInput(inputTime);
                workTime = timeLeft;
                updateTimerDisplay();
            } else {
                alert('Please enter time in format MM:SS');
                updateTimerDisplay();
            }
        }
    });

    document.getElementById('timerPom').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.blur();
        }
    });

    function startTimerPom() {
        if (!isRunning) {
            isRunning = true;
            pomodoroTimer = setInterval(() => {
                if (timeLeft > 0) {
                    timeLeft--;
                    updateTimerDisplay();
                } else {
                    clearInterval(pomodoroTimer);
                    isRunning = false;
                    if (onBreak) {
                        timeLeft = workTime;
                        onBreak = false;
                    } else {
                        timeLeft = breakTime;
                        onBreak = true;
                    }
                    startTimerPom();
                }
            }, 1000);
        }
    }

    function resetTimer() {
        clearInterval(pomodoroTimer);
        isRunning = false;
        onBreak = false;
        timeLeft = workTime;
        updateTimerDisplay();
    }

    updateTimerDisplay();

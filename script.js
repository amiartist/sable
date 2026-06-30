const MONTHS = {
    'Январь': 0, 'Февраль': 1, 'Март': 2, 'Апрель': 3,
    'Май': 4, 'Июнь': 5, 'Июль': 6, 'Август': 7,
    'Сентябрь': 8, 'Октябрь': 9, 'Ноябрь': 10, 'Декабрь': 11,
};

const monthlyThemeEl = document.querySelector('.monthly-theme');
const taskTitleEl = document.querySelector('.task-title');
const todayEl = document.querySelector('.today');
const hintTextEl = document.querySelector('.hint p');
const lvlupTextEl = document.querySelector('.lvlup p');
const hintShowBtn = document.querySelector('.hint button');
const lvlupShowBtn = document.querySelector('.lvlup button');
const dayItems = document.querySelectorAll('.calendar .day');

let seaData = null;

function parseArray(text, key) {
    const match = text.match(new RegExp(`${key}:\\s*\\[(.*?)\\]`, 's'));
    if (!match) return [];
    return [...match[1].matchAll(/'([^']*)'/g)].map((m) => m[1]);
}

async function loadSeaData() {
    const response = await fetch('Темы%20месяца/Sea.md');
    const text = await response.text();
    return {
        tasks: parseArray(text, 'tasks'),
        hints: parseArray(text, 'hints'),
        lvlups: parseArray(text, 'lvlups'),
    };
}

function getCalendarDate() {
    const monthName = document.querySelector('.month span:first-child').textContent.trim();
    const year = Number(document.querySelector('.month span:last-child').textContent.trim());
    return { month: MONTHS[monthName], year };
}

function getCalendarContext() {
    const now = new Date();
    const { month, year } = getCalendarDate();
    const calendarMonth = new Date(year, month, 1);

    if (now < calendarMonth) {
        return { status: 'before', today: null };
    }

    if (now.getFullYear() > year || (now.getFullYear() === year && now.getMonth() > month)) {
        return { status: 'after', today: null };
    }

    return { status: 'current', today: now.getDate() };
}

function initCalendarState() {
    const { status, today } = getCalendarContext();

    dayItems.forEach((dayEl) => {
        const dayNumber = Number(dayEl.querySelector('.day-number').textContent);
        dayEl.classList.remove('active', 'disabled');

        if (status === 'before' || (status === 'current' && dayNumber > today)) {
            dayEl.classList.add('disabled');
        } else if (status === 'current' && dayNumber === today) {
            dayEl.classList.add('active');
        }
    });

    return today;
}

function resetBlur() {
    hintTextEl.classList.add('blur');
    lvlupTextEl.classList.add('blur');
}

function showDay(dayNumber) {
    if (!seaData || dayNumber < 1) return;

    const index = dayNumber - 1;
    taskTitleEl.textContent = seaData.tasks[index] ?? '';
    todayEl.textContent = `День #${dayNumber}`;
    hintTextEl.textContent = seaData.hints[index] ?? '';
    lvlupTextEl.textContent = seaData.lvlups[index] ?? '';
    resetBlur();
}

function selectDay(dayEl) {
    if (dayEl.classList.contains('disabled')) return;

    dayItems.forEach((item) => item.classList.remove('active'));
    dayEl.classList.add('active');

    const dayNumber = Number(dayEl.querySelector('.day-number').textContent);
    showDay(dayNumber);
}

function initShowButtons() {
    hintShowBtn.addEventListener('click', () => {
        hintTextEl.classList.remove('blur');
    });

    lvlupShowBtn.addEventListener('click', () => {
        lvlupTextEl.classList.remove('blur');
    });
}

function initDayClicks() {
    dayItems.forEach((dayEl) => {
        dayEl.addEventListener('click', () => selectDay(dayEl));
    });
}

async function init() {
    monthlyThemeEl.textContent = 'Море';

    try {
        seaData = await loadSeaData();
    } catch {
        taskTitleEl.textContent = 'Не удалось загрузить темы';
        return;
    }

    const today = initCalendarState();
    initShowButtons();
    initDayClicks();

    const initialDay = today ?? Number(
        document.querySelector('.calendar .day:not(.disabled) .day-number')?.textContent
    );

    if (initialDay) {
        showDay(initialDay);
    }
}

init();

// UK Bank Holidays 2025-2026
const UK_BANK_HOLIDAYS = {
    '2025': [
        { date: '2025-01-01', name: 'New Year\'s Day' },
        { date: '2025-04-18', name: 'Good Friday' },
        { date: '2025-04-21', name: 'Easter Monday' },
        { date: '2025-05-05', name: 'Early May Bank Holiday' },
        { date: '2025-05-26', name: 'Spring Bank Holiday' },
        { date: '2025-08-25', name: 'Summer Bank Holiday' },
        { date: '2025-12-25', name: 'Christmas Day' },
        { date: '2025-12-26', name: 'Boxing Day' }
    ],
    '2026': [
        { date: '2026-01-01', name: 'New Year\'s Day' },
        { date: '2026-04-03', name: 'Good Friday' },
        { date: '2026-04-06', name: 'Easter Monday' },
        { date: '2026-05-04', name: 'Early May Bank Holiday' },
        { date: '2026-05-25', name: 'Spring Bank Holiday' },
        { date: '2026-08-31', name: 'Summer Bank Holiday' },
        { date: '2026-12-25', name: 'Christmas Day' },
        { date: '2026-12-26', name: 'Boxing Day' }
    ]
};

// State
let currentDate = new Date();
let currentYear = new Date().getFullYear();
let totalHolidays = 20;
let holidays = {}; 
let selectedDate = null;
let currentView = 'month'; 
let multiSelectMode = false;
let selectedDates = []; 

document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    renderCalendar();
    renderYearView();
    attachEventListeners();
    updateStats();

    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.add('hidden');
    }
});


// Render the calendar
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    document.getElementById('monthYear').textContent = 
        currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    let startDate = firstDay.getDay();
    
    startDate = startDate === 0 ? 6 : startDate - 1;

    const calendarGrid = document.getElementById('calendar');
    calendarGrid.innerHTML = '';

    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();

    for (let i = startDate - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const date = new Date(prevYear, prevMonth, day);
        createDayElement(calendarGrid, day, date, true);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        createDayElement(calendarGrid, day, date, false);
    }

    let nextDayCounter = 1;
    const totalCells = calendarGrid.children.length;
    const remainingCells = 42 - totalCells;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;

    for (let i = 0; i < remainingCells; i++) {
        const date = new Date(nextYear, nextMonth, nextDayCounter);
        createDayElement(calendarGrid, nextDayCounter, date, true);
        nextDayCounter++;
    }
}

// Helper function to format date as YYYY-MM-DD in local time (not UTC)
function formatDateToString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Create day element
function createDayElement(container, day, date, isOtherMonth) {
    const dateStr = formatDateToString(date);
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    
    if (isOtherMonth) {
        dayElement.classList.add('other-month');
    }

    const dayOfWeek = date.getDay();
    const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    if (adjustedDay === 5 || adjustedDay === 6) {
        dayElement.classList.add('weekend');
    }

    const isBankHoliday = isBankHolidayDate(dateStr);
    if (isBankHoliday) {
        dayElement.classList.add('bank-holiday');
    }

    const isUserHoliday = dateStr in holidays;
    if (isUserHoliday) {
        dayElement.classList.add('holiday');
        const holidayData = holidays[dateStr];
        
        if (holidayData.type === 'sick') {
            dayElement.classList.add('sick-day');
        } else if (holidayData.type === 'unpaid') {
            dayElement.classList.add('unpaid-leave');
        }
        
        if (holidayData.type === 'holiday' || !holidayData.type) {
            dayElement.style.backgroundColor = holidayData.color;
            dayElement.style.color = getContrastColor(holidayData.color);
        }
    }

    if (dateStr === selectedDate || selectedDates.includes(dateStr)) {
        dayElement.classList.add('selected');
    }

    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    dayElement.appendChild(dayNumber);

    if (isBankHoliday) {
        const bankHolidayLabel = document.createElement('div');
        bankHolidayLabel.className = 'day-label';
        bankHolidayLabel.textContent = getBankHolidayName(dateStr);
        dayElement.appendChild(bankHolidayLabel);
    } else if (isUserHoliday) {
        const label = document.createElement('div');
        label.className = 'day-label';
        label.textContent = holidays[dateStr].label || 'Holiday';
        dayElement.appendChild(label);
    }

    if (!isOtherMonth) {
        dayElement.addEventListener('click', () => {
            if (multiSelectMode) {
                if (selectedDates.includes(dateStr)) {
                    selectedDates = selectedDates.filter(d => d !== dateStr);
                } else {
                    selectedDates.push(dateStr);
                }
                selectedDates.sort();
                updateMultiSelectDisplay();
                renderCalendar();
            } else {
                document.querySelectorAll('.calendar-day.selected').forEach(el => {
                    el.classList.remove('selected');
                });
                dayElement.classList.add('selected');
                selectedDate = dateStr;
                selectedDates = [];
                document.getElementById('selectedDate').value = 
                    new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                document.getElementById('selectedDatesContainer').style.display = 'none';
            }
        });
    }

    container.appendChild(dayElement);
}

// Switch between month and year views
function switchView(view) {
    currentView = view;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(view === 'month' ? 'monthViewTab' : 'yearViewTab').classList.add('active');
    document.querySelectorAll('.calendar-view').forEach(v => v.classList.remove('active'));
    document.getElementById(view === 'month' ? 'monthView' : 'yearView').classList.add('active');
}

// Render the year view
function renderYearView() {
    const yearContainer = document.getElementById('yearCalendar');
    document.getElementById('yearDisplay').textContent = currentYear;
    yearContainer.innerHTML = '';

    for (let month = 0; month < 12; month++) {
        const miniMonth = createMiniMonth(currentYear, month);
        yearContainer.appendChild(miniMonth);
    }
}

// Create a mini month for year view
function createMiniMonth(year, month) {
    const monthContainer = document.createElement('div');
    monthContainer.className = 'mini-month';

    const header = document.createElement('h4');
    header.textContent = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long' });
    monthContainer.appendChild(header);

    const weekdaysContainer = document.createElement('div');
    weekdaysContainer.className = 'mini-weekdays';
    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach(day => {
        const weekday = document.createElement('div');
        weekday.className = 'mini-weekday';
        weekday.textContent = day;
        weekdaysContainer.appendChild(weekday);
    });
    monthContainer.appendChild(weekdaysContainer);

    const calendarGrid = document.createElement('div');
    calendarGrid.className = 'mini-calendar-grid';

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    let startDate = firstDay.getDay();

    startDate = startDate === 0 ? 6 : startDate - 1;

    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();

    for (let i = startDate - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const date = new Date(prevYear, prevMonth, day);
        createMiniDayElement(calendarGrid, day, date, true);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        createMiniDayElement(calendarGrid, day, date, false);
    }

    let nextDayCounter = 1;
    const totalCells = calendarGrid.children.length;
    const remainingCells = 42 - totalCells;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;

    for (let i = 0; i < remainingCells; i++) {
        const date = new Date(nextYear, nextMonth, nextDayCounter);
        createMiniDayElement(calendarGrid, nextDayCounter, date, true);
        nextDayCounter++;
    }

    monthContainer.appendChild(calendarGrid);
    return monthContainer;
}

// Create mini day element for year view
function createMiniDayElement(container, day, date, isOtherMonth) {
    const dateStr = formatDateToString(date);
    const dayElement = document.createElement('div');
    dayElement.className = 'mini-day';
    dayElement.textContent = day;

    if (isOtherMonth) {
        dayElement.classList.add('other-month');
    }

    const dayOfWeek = date.getDay();
    const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; 
    if (adjustedDay === 5 || adjustedDay === 6) {
        dayElement.classList.add('weekend');
    }

    const isBankHoliday = isBankHolidayDate(dateStr);
    if (isBankHoliday) {
        dayElement.classList.add('bank-holiday');
    }

    const isUserHoliday = dateStr in holidays;
    if (isUserHoliday) {
        dayElement.classList.add('holiday');
        const holidayData = holidays[dateStr];

        if (holidayData.type === 'sick') {
            dayElement.classList.add('sick-day');
        } else if (holidayData.type === 'unpaid') {
            dayElement.classList.add('unpaid-leave');
        }
        
        if (holidayData.type === 'holiday' || !holidayData.type) {
            dayElement.style.backgroundColor = holidayData.color;
            dayElement.style.color = getContrastColor(holidayData.color);
        }
    }

    if (!isOtherMonth) {
        dayElement.addEventListener('click', () => {
            switchView('month');
            currentDate = new Date(dateStr);
            renderCalendar();
            
            const dayElements = document.querySelectorAll('.calendar-day');
            dayElements.forEach(el => el.classList.remove('selected'));
            dayElements.forEach(el => {
                if (el.textContent.split('\n')[0].trim() === String(date.getDate())) {
                    el.classList.add('selected');
                }
            });
            selectedDate = dateStr;
            document.getElementById('selectedDate').value = 
                date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        });
    }

    container.appendChild(dayElement);
}

// Check if date is a bank holiday
function isBankHolidayDate(dateStr) {
    const year = dateStr.split('-')[0];
    const holidays = UK_BANK_HOLIDAYS[year] || [];
    return holidays.some(h => h.date === dateStr);
}

// Get bank holiday name
function getBankHolidayName(dateStr) {
    const year = dateStr.split('-')[0];
    const holidays = UK_BANK_HOLIDAYS[year] || [];
    const holiday = holidays.find(h => h.date === dateStr);
    return holiday ? holiday.name : '';
}

// Get contrast color for text
function getContrastColor(hexColor) {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#2c3e50' : '#ffffff';
}

// Update multi-select display
function updateMultiSelectDisplay() {
    const container = document.getElementById('selectedDatesContainer');
    const list = document.getElementById('selectedDatesList');
    
    if (selectedDates.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'block';
    list.innerHTML = selectedDates.map(dateStr => {
        const date = new Date(dateStr);
        const dateDisplay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return `
            <div class="date-chip">
                ${dateDisplay}
                <button class="date-chip-remove" data-date="${dateStr}" type="button">✕</button>
            </div>
        `;
    }).join('');

    list.querySelectorAll('.date-chip-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const dateToRemove = btn.dataset.date;
            selectedDates = selectedDates.filter(d => d !== dateToRemove);
            updateMultiSelectDisplay();
            renderCalendar();
        });
    });
}

// Attach event listeners
function attachEventListeners() {
    const sidebar = document.getElementById('sidebar');
    
    document.getElementById('multiSelectMode').addEventListener('change', (e) => {
        multiSelectMode = e.target.checked;
        if (!multiSelectMode) {
            selectedDates = [];
            document.getElementById('selectedDatesContainer').style.display = 'none';
            renderCalendar();
        }
    });

    document.getElementById('clearSelectionBtn').addEventListener('click', () => {
        selectedDates = [];
        updateMultiSelectDisplay();
        renderCalendar();
    });

    document.getElementById('sidebarToggle').addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('hidden');
    });

    document.getElementById('sidebarClose').addEventListener('click', () => {
        sidebar.classList.add('hidden');
    });

    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && !sidebar.contains(e.target) && !document.getElementById('sidebarToggle').contains(e.target)) {
            sidebar.classList.add('hidden');
        }
    });


    document.getElementById('monthViewTab').addEventListener('click', () => {
        switchView('month');
    });

    document.getElementById('yearViewTab').addEventListener('click', () => {
        switchView('year');
    });

    document.getElementById('prevMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });


    document.getElementById('prevYear').addEventListener('click', () => {
        currentYear--;
        renderYearView();
    });

    document.getElementById('nextYear').addEventListener('click', () => {
        currentYear++;
        renderYearView();
    });


    document.getElementById('setHolidayBtn').addEventListener('click', () => {
        totalHolidays = parseInt(document.getElementById('totalHolidays').value) || 20;
        updateStats();
        saveToLocalStorage();
    });


    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.getElementById('holidayColor').value = e.target.dataset.color;
        });
    });

    document.getElementById('assignHolidayBtn').addEventListener('click', assignHoliday);

    document.getElementById('clearAllBtn').addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all holidays?')) {
            holidays = {};
            selectedDate = null;
            selectedDates = [];
            document.getElementById('selectedDate').value = '';
            document.getElementById('multiSelectMode').checked = false;
            multiSelectMode = false;
            document.getElementById('selectedDatesContainer').style.display = 'none';
            renderCalendar();
            renderYearView();
            updateHolidayList();
            updateStats();
            saveToLocalStorage();
        }
    });

    document.getElementById('exportBtn').addEventListener('click', exportSchedule);
}

// Assign holiday to selected date(s)
function assignHoliday() {
    let datesToAssign = [];
    
    if (multiSelectMode) {
        if (selectedDates.length === 0) {
            alert('Please select at least one date');
            return;
        }
        datesToAssign = selectedDates;
    } else {
        if (!selectedDate) {
            alert('Please select a date first');
            return;
        }
        datesToAssign = [selectedDate];
    }

    const label = document.getElementById('holidayLabel').value || 'Holiday';
    const color = document.getElementById('holidayColor').value;
    const dayType = document.getElementById('dayType').value;

    datesToAssign.forEach(dateStr => {
        holidays[dateStr] = { label, color, type: dayType };
    });
    
    document.getElementById('holidayLabel').value = '';
    document.getElementById('holidayColor').value = '#4ecdc4';
    document.getElementById('dayType').value = 'holiday';
    
    if (multiSelectMode) {
        selectedDates = [];
        document.getElementById('multiSelectMode').checked = false;
        multiSelectMode = false;
        document.getElementById('selectedDatesContainer').style.display = 'none';
    } else {
        selectedDate = null;
        document.getElementById('selectedDate').value = '';
    }

    renderCalendar();
    renderYearView();
    updateHolidayList();
    updateStats();
    saveToLocalStorage();
}

// Remove holiday
function removeHoliday(dateStr) {
    delete holidays[dateStr];
    if (selectedDate === dateStr) {
        selectedDate = null;
        document.getElementById('selectedDate').value = '';
    }
    renderCalendar();
    renderYearView();
    updateHolidayList();
    updateStats();
    saveToLocalStorage();
}

// Update holiday list
function updateHolidayList() {
    const list = document.getElementById('holidayList');
    const sortedDates = Object.keys(holidays).sort();

    if (sortedDates.length === 0) {
        list.innerHTML = '<p class="empty-state">No holidays assigned yet</p>';
        return;
    }

    list.innerHTML = sortedDates.map(dateStr => {
        const date = new Date(dateStr);
        const holidayData = holidays[dateStr];
        const dateDisplay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        
        return `
            <div class="holiday-item" style="border-color: ${holidayData.color};">
                <div class="holiday-info">
                    <div class="holiday-date">${dateDisplay}</div>
                    <div class="holiday-label">${holidayData.label}</div>
                </div>
                <button class="holiday-remove" onclick="removeHoliday('${dateStr}')">Remove</button>
            </div>
        `;
    }).join('');
}

// Update statistics
function updateStats() {
    const usedDays = Object.keys(holidays).filter(dateStr => {
        const dayData = holidays[dateStr];
        return dayData.type === 'holiday' || !dayData.type;
    }).length;
    
    const remainingDays = totalHolidays - usedDays;

    document.getElementById('totalDaysValue').textContent = totalHolidays;
    document.getElementById('usedDaysValue').textContent = usedDays;
    document.getElementById('remainingDaysValue').textContent = Math.max(0, remainingDays);
    document.getElementById('totalHolidays').value = totalHolidays;
}

// Export schedule as text
function exportSchedule() {
    if (Object.keys(holidays).length === 0) {
        alert('No holidays to export');
        return;
    }

    const sortedDates = Object.keys(holidays).sort();
    const usedHolidayDays = sortedDates.filter(dateStr => {
        const dayData = holidays[dateStr];
        return dayData.type === 'holiday' || !dayData.type;
    }).length;
    
    let exportText = '=== Holiday Schedule ===\n\n';
    exportText += `Total Holiday Days: ${totalHolidays}\n`;
    exportText += `Days Used (Holiday): ${usedHolidayDays}\n`;
    exportText += `Days Remaining: ${Math.max(0, totalHolidays - usedHolidayDays)}\n\n`;

    const sickDays = sortedDates.filter(d => holidays[d].type === 'sick').length;
    const unpaidDays = sortedDates.filter(d => holidays[d].type === 'unpaid').length;
    
    if (sickDays > 0 || unpaidDays > 0) {
        exportText += '--- Other Days ---\n';
        if (sickDays > 0) exportText += `Sick Days: ${sickDays}\n`;
        if (unpaidDays > 0) exportText += `Unpaid Leave: ${unpaidDays}\n\n`;
    }
    
    exportText += '--- All Dates ---\n';

    sortedDates.forEach(dateStr => {
        const date = new Date(dateStr);
        const holidayData = holidays[dateStr];
        const dayType = holidayData.type || 'holiday';
        const dateDisplay = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const typeLabel = dayType === 'sick' ? '(Sick)' : dayType === 'unpaid' ? '(Unpaid)' : '';
        exportText += `${dateDisplay}: ${holidayData.label} ${typeLabel}\n`;
    });

    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `holiday-schedule-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
}

// Local Storage functions
function saveToLocalStorage() {
    const data = {
        totalHolidays,
        holidays,
        selectedDate
    };
    localStorage.setItem('holidayPlannerData', JSON.stringify(data));
}

function loadFromLocalStorage() {
    const data = localStorage.getItem('holidayPlannerData');
    if (data) {
        try {
            const parsed = JSON.parse(data);
            totalHolidays = parsed.totalHolidays || 20;
            holidays = parsed.holidays || {};
            selectedDate = parsed.selectedDate || null;
        } catch (e) {
            console.error('Error loading data:', e);
        }
    }
}

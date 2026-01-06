// ==================== FIREBASE AUTH & API ====================
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider,
    GithubAuthProvider, 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signOut 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Firebase config - REPLACE WITH YOUR CONFIG FROM FIREBASE CONSOLE
const firebaseConfig = {
  apiKey: "AIzaSyD3NhtdeWWHGZ9XROABJQ0tIhHV6CvmjDE",
  authDomain: "annual-leave-calendar-8fb34.firebaseapp.com",
  projectId: "annual-leave-calendar-8fb34",
  storageBucket: "annual-leave-calendar-8fb34.firebasestorage.app",
  messagingSenderId: "731129247576",
  appId: "1:731129247576:web:40da9b08b04ca995fdd72d"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

let currentUser = null;
let authToken = null;

// API helper function
async function apiRequest(endpoint, method = 'GET', body = null) {
    if (!authToken) throw new Error('Not authenticated');
    
    const options = {
        method,
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        }
    };
    
    if (body) {
        options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`/api${endpoint}`, options);
    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }
    return response.json();
}

// Login function with email/password
async function loginWithEmail(email, password) {
    hideAuthError();
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error('Login error:', error);
        showAuthError('Login failed. Please check your email and password.');
    }
}

// Sign up function
async function signUpWithEmail(email, password) {
    hideAuthError();
    try {
        await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error('Signup error:', error);
        showAuthError('Signup failed. Please try a different email or check your password.');
    }
}

// Handle signup form submission
async function handleSignup() {
    const firstName = document.getElementById('signupFirstName').value;
    const lastName = document.getElementById('signupLastName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const passwordConfirm = document.getElementById('signupPasswordConfirm').value;
    
    if (!firstName || !lastName || !email || !password || !passwordConfirm) {
        showAuthError('Please fill in all fields');
        return;
    }
    
    if (password !== passwordConfirm) {
        showAuthError('Passwords do not match');
        return;
    }
    
    if (password.length < 6) {
        showAuthError('Password must be at least 6 characters');
        return;
    }
    
    await signUpWithEmail(email, password);
}

// Show auth error message
function showAuthError(message) {
    const errorEl = document.getElementById('authError');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorEl.classList.add('hidden');
        }, 5000);
    }
}

// Hide auth error message
function hideAuthError() {
    const errorEl = document.getElementById('authError');
    if (errorEl) {
        errorEl.classList.add('hidden');
    }
}

// Login function
async function loginWithGoogle() {
    hideAuthError();
    try {
        await signInWithPopup(auth, googleProvider);
    } catch (error) {
        // Ignore popup closed errors
        if (error.code === 'auth/popup-closed-by-user') {
            return;
        }
        console.error('Login error:', error);
        showAuthError('Login failed. Please try again.');
    }
}

// GitHub login function
async function loginWithGithub() {
    hideAuthError();
    try {
        await signInWithPopup(auth, githubProvider);
    } catch (error) {
        // Ignore popup closed errors
        if (error.code === 'auth/popup-closed-by-user') {
            return;
        }
        console.error('Login error:', error);
        showAuthError('Login failed. Please try again.');
    }
}

// Logout function
async function logout() {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Toggle between login and signup modes
function toggleAuthMode() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    loginForm.classList.toggle('hidden');
    signupForm.classList.toggle('hidden');
    
    // Update toggle text
    const toggleText = document.getElementById('toggleAuthText');
    if (loginForm.classList.contains('hidden')) {
        toggleText.textContent = 'Already have an account? ';
        const link = document.createElement('a');
        link.href = 'javascript:void(0)';
        link.id = 'toggleAuthLink';
        link.textContent = 'Sign in';
        link.addEventListener('click', toggleAuthMode);
        toggleText.appendChild(link);
    } else {
        toggleText.textContent = 'Don\'t have an account? ';
        const link = document.createElement('a');
        link.href = 'javascript:void(0)';
        link.id = 'toggleAuthLink';
        link.textContent = 'Sign up';
        link.addEventListener('click', toggleAuthMode);
        toggleText.appendChild(link);
    }
}

// Setup auth event listeners
function setupAuthEventListeners() {
    // Login with email button
    const loginEmailBtn = document.getElementById('loginEmailBtn');
    if (loginEmailBtn) {
        loginEmailBtn.addEventListener('click', () => {
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            if (!email || !password) {
                showAuthError('Please fill in all fields');
                return;
            }
            
            loginWithEmail(email, password);
        });
    }
    
    // Signup button
    const signupBtn = document.getElementById('signupBtn');
    if (signupBtn) {
        signupBtn.addEventListener('click', handleSignup);
    }
    
    // Toggle auth mode link
    const toggleAuthLink = document.getElementById('toggleAuthLink');
    if (toggleAuthLink) {
        toggleAuthLink.addEventListener('click', (e) => {
            e.preventDefault();
            toggleAuthMode();
        });
    }
    
    // Google login button
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', loginWithGoogle);
    }

    // GitHub login button
    const githubLoginBtn = document.getElementById('githubLoginBtn');
    if (githubLoginBtn) {
        githubLoginBtn.addEventListener('click', loginWithGithub);
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
}

// Auth state listener - main app initialization
onAuthStateChanged(auth, async (user) => {
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loginContainer = document.getElementById('loginContainer');
    const appContainer = document.getElementById('appContainer');
    
    if (user) {
        try {
            currentUser = user;
            authToken = await user.getIdToken();
            
            // Sync with backend (create user if new)
            await apiRequest('/auth/login', 'POST');
            
            // Load user data from database
            await loadFromDatabase();
            
            // Show app, hide login
            loadingOverlay.classList.add('hidden');
            loginContainer.classList.remove('visible');
            appContainer.classList.add('visible');
            
            // Initialize UI
            renderCalendar();
            renderYearView();
            attachEventListeners();
            attachNavigationListeners();
            setupAuthEventListeners();
            updateStats();
            updateDashboard();
            updateTimeOffTable();
            
            if (window.innerWidth <= 768) {
                document.getElementById('sidebar').classList.add('collapsed');
            }
        } catch (error) {
            console.error('Error initializing app:', error);
            loadingOverlay.classList.add('hidden');
            loginContainer.classList.add('visible');
            appContainer.classList.remove('visible');
        }
    } else {
        currentUser = null;
        authToken = null;
        loadingOverlay.classList.add('hidden');
        loginContainer.classList.add('visible');
        appContainer.classList.remove('visible');
        setupAuthEventListeners();
    }
});

// Load data from database (replaces loadFromLocalStorage)
async function loadFromDatabase() {
    try {
        const data = await apiRequest('/data');
        totalHolidays = data.totalHolidays || 20;
        holidays = data.holidays || {};
        attendanceData = data.attendanceData || {};
        if (data.attendanceConfig) {
            attendanceConfig = data.attendanceConfig;
        }
        if (data.currentAttendanceMonth) {
            currentAttendanceMonth = new Date(data.currentAttendanceMonth);
        }
        
        // Update user info in sidebar
        if (data.name) {
            document.getElementById('userName').textContent = data.name;
        }
        if (data.email) {
            document.getElementById('userEmail').textContent = data.email;
        }
    } catch (error) {
        console.error('Error loading data from database:', error);
        // Fall back to defaults
        totalHolidays = 20;
        holidays = {};
        attendanceData = {};
    }
}

// Save data to database (replaces saveToLocalStorage)
async function saveToDatabase() {
    if (!authToken) return; // Not authenticated
    
    try {
        await apiRequest('/data', 'POST', {
            totalHolidays,
            holidays,
            attendanceData,
            attendanceConfig,
            currentAttendanceMonth: currentAttendanceMonth.toISOString()
        });
    } catch (error) {
        console.error('Error saving data to database:', error);
    }
}

// Alias for backward compatibility - all saveToLocalStorage calls now save to database
function saveToLocalStorage() {
    saveToDatabase();
}

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
let currentMainView = 'dashboard';

// Note: DOMContentLoaded is replaced by onAuthStateChanged listener above
// The app initialization now happens after successful authentication

// Navigation Management
function attachNavigationListeners() {
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view-container');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const viewName = item.dataset.view;
            switchMainView(viewName);
        });
    });
}

// Switch main view (dashboard, calendar, attendance)
function switchMainView(viewName) {
    currentMainView = viewName;

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.view === viewName) {
            item.classList.add('active');
        }
    });
    
    document.querySelectorAll('.view-container').forEach(view => {
        view.classList.remove('active');
    });
    
    const viewElement = document.getElementById(viewName + 'View');
    if (viewElement) {
        viewElement.classList.add('active');
        
        if (viewName === 'dashboard') {
            updateDashboard();
            updateTimeOffTable();
        } else if (viewName === 'attendance') {
            initializeAttendanceView();
        }
    }
    
    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.add('collapsed');
    }
}

// Update dashboard stats and cards
function updateDashboard() {
    const usedHolidayDays = Object.keys(holidays).filter(dateStr => {
        const dayData = holidays[dateStr];
        return dayData.type === 'holiday' || !dayData.type;
    }).length;
    
    const availableDays = Math.max(0, totalHolidays - usedHolidayDays);
    const sickDaysList = Object.keys(holidays).filter(dateStr => holidays[dateStr].type === 'sick');
    const sickDayCount = sickDaysList.length;

    let sickPeriods = 0;
    if (sickDayCount > 0) {
        const sortedSickDates = sickDaysList.sort();
        sickPeriods = 1;
        for (let i = 1; i < sortedSickDates.length; i++) {
            const prevDate = new Date(sortedSickDates[i-1]);
            const currDate = new Date(sortedSickDates[i]);
            const diffTime = currDate - prevDate;
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            if (diffDays > 1) {
                sickPeriods++;
            }
        }
    }
    
    document.getElementById('dashTotalDays').textContent = totalHolidays;
    document.getElementById('dashUsedDays').textContent = usedHolidayDays;
    document.getElementById('dashAvailableDays').textContent = availableDays;
    document.getElementById('dashSickPeriods').textContent = sickPeriods;
    document.getElementById('dashSickDays').textContent = sickDayCount;
    
    // Calculate current month attendance percentage
    const now = new Date();
    const monthAttendancePercentage = calculateMonthlyAttendancePercentage(now.getFullYear(), now.getMonth());
    
    document.getElementById('attendancePercentage').textContent = monthAttendancePercentage + '%';
    
    const canvas = document.getElementById('attendanceChart');
    if (canvas) {
        drawPieChart(canvas, monthAttendancePercentage);
    }
    
    // Draw dashboard pie charts
    updateDashboardPieCharts();
}

// Update dashboard dual pie charts
function updateDashboardPieCharts() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    // Draw projected chart (full month)
    const projectedStats = drawAttendancePieChart('dashProjectedChart', year, month, false);
    if (projectedStats) {
        document.getElementById('dashProjectedOffice').textContent = projectedStats.officeCount;
        document.getElementById('dashProjectedHoliday').textContent = projectedStats.holidayCount;
        document.getElementById('dashProjectedSick').textContent = projectedStats.sickCount;
        document.getElementById('dashProjectedUnselected').textContent = projectedStats.unselectedCount;
    }
    
    // Draw current chart (up to today)
    const currentStats = drawAttendancePieChart('dashCurrentChart', year, month, true);
    if (currentStats) {
        document.getElementById('dashCurrentOffice').textContent = currentStats.officeCount;
        document.getElementById('dashCurrentHoliday').textContent = currentStats.holidayCount;
        document.getElementById('dashCurrentSick').textContent = currentStats.sickCount;
        document.getElementById('dashCurrentUnselected').textContent = currentStats.unselectedCount;
    }
}

// Draw a simple pie chart on canvas
function drawPieChart(canvas, percentage) {
    if (!canvas || !canvas.getContext) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 2 - 5;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#e1e8ed';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = '#4ecdc4';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, (-Math.PI / 2) + (percentage / 100) * 2 * Math.PI);
    ctx.lineTo(centerX, centerY);
    ctx.fill();

    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(percentage + '%', centerX, centerY);
}

// Update time off table
function updateTimeOffTable() {
    const tbody = document.getElementById('timeOffTableBody');
    const filterSelect = document.getElementById('filterTimeOff');
    const filter = filterSelect ? filterSelect.value : 'all';
    
    if (Object.keys(holidays).length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="5">No time off recorded</td></tr>';
        return;
    }
    
    const sortedDates = Object.keys(holidays).sort();
    let filteredDates = sortedDates;
    
    if (filter !== 'all') {
        filteredDates = sortedDates.filter(dateStr => {
            const dayType = holidays[dateStr].type || 'holiday';
            return dayType === filter;
        });
    }
    
    if (filteredDates.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="5">No records for this filter</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredDates.map(dateStr => {
        const date = new Date(dateStr);
        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dateFormatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const holidayData = holidays[dateStr];
        const dayType = holidayData.type || 'holiday';
        const typeLabel = dayType === 'sick' ? 'Sick Day' : dayType === 'unpaid' ? 'Unpaid Leave' : 'Holiday';
        
        return `
            <tr>
                <td>${dateFormatted}</td>
                <td>${dayOfWeek}</td>
                <td>${typeLabel}</td>
                <td>${holidayData.label}</td>
                <td><button class="remove-btn" onclick="removeHoliday('${dateStr}')">Remove</button></td>
            </tr>
        `;
    }).join('');
    
    const style = document.createElement('style');
    if (!document.querySelector('#table-button-styles')) {
        style.id = 'table-button-styles';
        style.textContent = `
            .remove-btn {
                background: #ff6b6b;
                color: white;
                border: none;
                padding: 4px 8px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.8em;
                transition: all 0.2s ease;
            }
            .remove-btn:hover {
                background: #ee5a52;
            }
        `;
        document.head.appendChild(style);
    }
}


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
                document.getElementById('selectedDateRight').value = 
                    new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                document.getElementById('selectedDatesContainerRight').style.display = 'none';
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
    const container = document.getElementById('selectedDatesContainerRight');
    const list = document.getElementById('selectedDatesListRight');
    
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
    
    // Sidebar toggle
    document.getElementById('sidebarToggleBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('collapsed');
    });

    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && !sidebar.contains(e.target) && !document.getElementById('sidebarToggleBtn').contains(e.target)) {
            sidebar.classList.add('collapsed');
        }
    });

    // Multi-select mode (right sidebar)
    document.getElementById('multiSelectModeRight').addEventListener('change', (e) => {
        multiSelectMode = e.target.checked;
        if (!multiSelectMode) {
            selectedDates = [];
            document.getElementById('selectedDatesContainerRight').style.display = 'none';
            renderCalendar();
        }
    });

    document.getElementById('clearSelectionBtnRight').addEventListener('click', () => {
        selectedDates = [];
        updateMultiSelectDisplay();
        renderCalendar();
    });

    // Calendar view tabs
    document.getElementById('monthViewTab').addEventListener('click', () => {
        switchView('month');
    });

    document.getElementById('yearViewTab').addEventListener('click', () => {
        switchView('year');
    });

    // Month navigation
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    // Year navigation
    document.getElementById('prevYear').addEventListener('click', () => {
        currentYear--;
        renderYearView();
    });

    document.getElementById('nextYear').addEventListener('click', () => {
        currentYear++;
        renderYearView();
    });

    // Holiday allowance setting (right sidebar)
    document.getElementById('setHolidayBtnRight').addEventListener('click', () => {
        totalHolidays = parseInt(document.getElementById('totalHolidaysInput').value) || 20;
        updateStats();
        updateDashboard();
        saveToLocalStorage();
    });

    // Color picker buttons (right sidebar)
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.getElementById('holidayColorRight').value = e.target.dataset.color;
        });
    });

    // Assign holiday button (right sidebar)
    document.getElementById('assignHolidayBtnRight').addEventListener('click', assignHoliday);

    // Clear all button (right sidebar)
    document.getElementById('clearAllBtnRight').addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all holidays?')) {
            holidays = {};
            selectedDate = null;
            selectedDates = [];
            document.getElementById('selectedDateRight').value = '';
            document.getElementById('multiSelectModeRight').checked = false;
            multiSelectMode = false;
            document.getElementById('selectedDatesContainerRight').style.display = 'none';
            renderCalendar();
            renderYearView();
            updateHolidayListRight();
            updateStats();
            updateDashboard();
            updateTimeOffTable();
            saveToLocalStorage();
        }
    });

    // Export button (right sidebar)
    document.getElementById('exportBtnRight').addEventListener('click', exportSchedule);

    // Filter select on dashboard
    const filterTimeOff = document.getElementById('filterTimeOff');
    if (filterTimeOff) {
        filterTimeOff.addEventListener('change', updateTimeOffTable);
    }
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

    const label = document.getElementById('holidayLabelRight').value || 'Holiday';
    const color = document.getElementById('holidayColorRight').value;
    const dayType = document.getElementById('dayTypeRight').value;

    datesToAssign.forEach(dateStr => {
        holidays[dateStr] = { label, color, type: dayType };
    });
    
    document.getElementById('holidayLabelRight').value = '';
    document.getElementById('holidayColorRight').value = '#4ecdc4';
    document.getElementById('dayTypeRight').value = 'holiday';
    
    if (multiSelectMode) {
        selectedDates = [];
        document.getElementById('multiSelectModeRight').checked = false;
        multiSelectMode = false;
        document.getElementById('selectedDatesContainerRight').style.display = 'none';
    } else {
        selectedDate = null;
        document.getElementById('selectedDateRight').value = '';
    }

    renderCalendar();
    renderYearView();
    updateHolidayListRight();
    updateStats();
    updateDashboard();
    renderCalendar();
    renderYearView();
    updateHolidayListRight();
    updateStats();
    updateDashboard();
    updateTimeOffTable();
    saveToLocalStorage();
}

// Remove holiday
function removeHoliday(dateStr) {
    delete holidays[dateStr];
    if (selectedDate === dateStr) {
        selectedDate = null;
        document.getElementById('selectedDateRight').value = '';
    }
    renderCalendar();
    renderYearView();
    updateHolidayListRight();
    updateStats();
    updateDashboard();
    updateTimeOffTable();
    saveToLocalStorage();
}

// Update holiday list (right sidebar)
function updateHolidayListRight() {
    const list = document.getElementById('holidayListRight');
    const sortedDates = Object.keys(holidays).sort();

    if (sortedDates.length === 0) {
        list.innerHTML = '<p class="empty-state">No leave assigned</p>';
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

    document.getElementById('totalHolidaysInput').value = totalHolidays;
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

// ==================== ATTENDANCE VIEW FUNCTIONALITY ====================

let attendanceData = {}; 
let currentAttendanceMonth = new Date();
let selectedAttendanceDates = [];
let attendanceConfig = {
    requiredDaysType: 'percentage',
    requiredDaysValue: 100,
    countBankHolidays: true,
    countAnnualLeave: true,
    countSickDays: true
};

function initializeAttendanceView() {
    // Set up event listeners for attendance controls
    const requiredDaysInput = document.getElementById('requiredDaysValue');
    const requiredDaysType = document.getElementById('requiredDaysType');
    const countBankHolidaysCheckbox = document.getElementById('countBankHolidays');
    const countAnnualLeaveCheckbox = document.getElementById('countAnnualLeave');
    const countSickDaysCheckbox = document.getElementById('countSickDays');

    // Restore form values from attendanceConfig
    if (requiredDaysInput) {
        requiredDaysInput.value = attendanceConfig.requiredDaysValue;
    }
    if (requiredDaysType) {
        requiredDaysType.value = attendanceConfig.requiredDaysType;
    }
    if (countBankHolidaysCheckbox) {
        countBankHolidaysCheckbox.checked = attendanceConfig.countBankHolidays;
    }
    if (countAnnualLeaveCheckbox) {
        countAnnualLeaveCheckbox.checked = attendanceConfig.countAnnualLeave;
    }
    if (countSickDaysCheckbox) {
        countSickDaysCheckbox.checked = attendanceConfig.countSickDays;
    }

    if (requiredDaysInput) {
        requiredDaysInput.addEventListener('change', () => {
            attendanceConfig.requiredDaysValue = parseInt(requiredDaysInput.value);
            saveToLocalStorage();
            updateAttendanceStats();
            updateDashboard();
        });
        requiredDaysInput.addEventListener('input', () => {
            attendanceConfig.requiredDaysValue = parseInt(requiredDaysInput.value);
            saveToLocalStorage();
            updateAttendanceStats();
            updateDashboard();
        });
    }

    if (requiredDaysType) {
        requiredDaysType.addEventListener('change', (e) => {
            attendanceConfig.requiredDaysType = e.target.value;
            const label = document.querySelector('label[for="requiredDaysValue"]');
            if (label) {
                label.textContent = e.target.value === 'days' ? 'Required Days' : 'Required Percentage';
            }
            saveToLocalStorage();
            updateAttendanceStats();
            updateDashboard();
        });
    }

    if (countBankHolidaysCheckbox) {
        countBankHolidaysCheckbox.addEventListener('change', () => {
            attendanceConfig.countBankHolidays = countBankHolidaysCheckbox.checked;
            saveToLocalStorage();
            updateAttendanceStats();
            updateDashboard();
        });
    }
    if (countAnnualLeaveCheckbox) {
        countAnnualLeaveCheckbox.addEventListener('change', () => {
            attendanceConfig.countAnnualLeave = countAnnualLeaveCheckbox.checked;
            saveToLocalStorage();
            updateAttendanceStats();
            updateDashboard();
        });
    }
    if (countSickDaysCheckbox) {
        countSickDaysCheckbox.addEventListener('change', () => {
            attendanceConfig.countSickDays = countSickDaysCheckbox.checked;
            saveToLocalStorage();
            updateAttendanceStats();
            updateDashboard();
        });
    }

    // Month navigation
    const prevMonthBtn = document.getElementById('attendancePrevMonth');
    const nextMonthBtn = document.getElementById('attendanceNextMonth');

    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            currentAttendanceMonth.setMonth(currentAttendanceMonth.getMonth() - 1);
            saveToLocalStorage();
            renderAttendanceCalendar();
            updateAttendanceStats();
            updateDashboard();
        });
    }

    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', () => {
            currentAttendanceMonth.setMonth(currentAttendanceMonth.getMonth() + 1);
            saveToLocalStorage();
            renderAttendanceCalendar();
            updateAttendanceStats();
            updateDashboard();
        });
    }

    // Day type buttons
    const markOfficeBtn = document.getElementById('markOfficeBtn');
    const markRemoteBtn = document.getElementById('markRemoteBtn');
    const markSickBtn = document.getElementById('markSickBtn');
    const markAnnualLeaveBtn = document.getElementById('markAnnualLeaveBtn');
    const clearSelectionBtn = document.getElementById('clearSelectionBtn');

    if (markOfficeBtn) markOfficeBtn.addEventListener('click', () => markSelectedDays('office'));
    if (markRemoteBtn) markRemoteBtn.addEventListener('click', () => markSelectedDays('remote'));
    if (markSickBtn) markSickBtn.addEventListener('click', () => markSelectedDays('sick'));
    if (markAnnualLeaveBtn) markAnnualLeaveBtn.addEventListener('click', () => markSelectedDays('leave'));
    if (clearSelectionBtn) clearSelectionBtn.addEventListener('click', () => clearSelectedDays());

    // Initialize month selector dropdown
    populateMonthSelector();
    handleMonthSelection();

    // Initialize calendar
    initializeAttendanceDataWithDefaults();
    renderAttendanceCalendar();
    updateAttendanceStats();
    updateAttendanceCharts();
}

function initializeAttendanceDataWithDefaults() {
    // Initialize all days as 'remote' if not already set
    const year = currentAttendanceMonth.getFullYear();
    const month = currentAttendanceMonth.getMonth();
    
    // Get all days in the month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dateStr = formatDateToString(new Date(year, month, day));
        if (!(dateStr in attendanceData)) {
            attendanceData[dateStr] = 'remote';
        }
    }
    
    // Add bank holidays
    insertBankHolidaysIntoAttendance(year);
}

function insertBankHolidaysIntoAttendance(year) {
    const yearStr = year.toString();
    if (UK_BANK_HOLIDAYS[yearStr]) {
        UK_BANK_HOLIDAYS[yearStr].forEach(holiday => {
            attendanceData[holiday.date] = 'bank-holiday';
        });
    }
}

function renderAttendanceCalendar() {
    const year = currentAttendanceMonth.getFullYear();
    const month = currentAttendanceMonth.getMonth();

    // Update header
    const header = document.querySelector('.attendance-calendar .calendar-nav h2');
    if (header) {
        header.textContent = currentAttendanceMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    let startDate = firstDay.getDay();
    
    startDate = startDate === 0 ? 6 : startDate - 1;

    const gridContainer = document.getElementById('attendanceGridContainer');
    gridContainer.innerHTML = '';

    // Add previous month's days
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();

    for (let i = startDate - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const date = new Date(prevYear, prevMonth, day);
        createAttendanceDayElement(gridContainer, day, date, true);
    }

    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        createAttendanceDayElement(gridContainer, day, date, false);
    }

    // Add next month's days
    let nextDayCounter = 1;
    const totalCells = gridContainer.children.length;
    const remainingCells = 42 - totalCells;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;

    for (let i = 0; i < remainingCells; i++) {
        const date = new Date(nextYear, nextMonth, nextDayCounter);
        createAttendanceDayElement(gridContainer, nextDayCounter, date, true);
        nextDayCounter++;
    }
}

function createAttendanceDayElement(container, day, date, isOtherMonth) {
    const dateStr = formatDateToString(date);
    const dayElement = document.createElement('div');
    dayElement.className = 'attendance-day';
    
    if (isOtherMonth) {
        dayElement.classList.add('other-month');
    }

    const dayOfWeek = date.getDay();
    const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    if (adjustedDay === 5 || adjustedDay === 6) {
        dayElement.classList.add('weekend');
    }

    // Add day type class and label
    const dayType = attendanceData[dateStr] || 'remote';
    dayElement.classList.add(dayType);

    let typeLabel = '';
    switch (dayType) {
        case 'office': typeLabel = 'Office'; break;
        case 'remote': typeLabel = 'Remote'; break;
        case 'sick': typeLabel = 'Sick'; break;
        case 'leave': typeLabel = 'Leave'; break;
        case 'bank-holiday': typeLabel = 'Bank Holiday'; break;
    }

    // Check if selected
    if (selectedAttendanceDates.includes(dateStr)) {
        dayElement.classList.add('selected');
    }

    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    dayElement.appendChild(dayNumber);

    const label = document.createElement('div');
    label.className = 'day-label';
    label.textContent = typeLabel;
    dayElement.appendChild(label);

    if (!isOtherMonth && dayOfWeek !== 0 && dayOfWeek !== 6) { // Not weekend
        dayElement.addEventListener('click', (e) => {
            if (e.shiftKey) {
                // Range select
                if (selectedAttendanceDates.length > 0) {
                    const lastSelected = selectedAttendanceDates[selectedAttendanceDates.length - 1];
                    const dateA = new Date(lastSelected);
                    const dateB = new Date(dateStr);
                    const rangeStart = dateA < dateB ? dateA : dateB;
                    const rangeEnd = dateA > dateB ? dateA : dateB;

                    selectedAttendanceDates = [];
                    for (let d = new Date(rangeStart); d <= rangeEnd; d.setDate(d.getDate() + 1)) {
                        selectedAttendanceDates.push(formatDateToString(new Date(d)));
                    }
                } else {
                    selectedAttendanceDates.push(dateStr);
                }
            } else {
                // Toggle selection
                if (selectedAttendanceDates.includes(dateStr)) {
                    selectedAttendanceDates = selectedAttendanceDates.filter(d => d !== dateStr);
                } else {
                    selectedAttendanceDates.push(dateStr);
                }
            }
            renderAttendanceCalendar();
        });
    }

    container.appendChild(dayElement);
}

function markSelectedDays(type) {
    if (selectedAttendanceDates.length === 0) return;

    selectedAttendanceDates.forEach(dateStr => {
        attendanceData[dateStr] = type;
    });

    selectedAttendanceDates = [];
    saveToLocalStorage();
    renderAttendanceCalendar();
    updateAttendanceStats();
    updateDashboard();
}


function clearSelectedDays() {
    selectedAttendanceDates = [];
    renderAttendanceCalendar();
}

function calculateWeekdays(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    let weekdayCount = 0;

    for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not weekend
            weekdayCount++;
        }
    }

    return weekdayCount;
}

function calculateMonthlyAttendancePercentage(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    let offDaysCount = 0;
    let weekdayCount = 0;

    for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay();
        
        // Only count weekdays
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            weekdayCount++;
            
            const dateStr = formatDateToString(date);
            const dayType = attendanceData[dateStr] || 'remote';
            
            // Count non-office days as "off"
            if (dayType !== 'office') {
                offDaysCount++;
            }
        }
    }

    if (weekdayCount === 0) return 100;
    
    const attendanceDays = weekdayCount - offDaysCount;
    const percentage = Math.round((attendanceDays / weekdayCount) * 100);
    return percentage;
}

function calculateRequiredDays() {
    const year = currentAttendanceMonth.getFullYear();
    const month = currentAttendanceMonth.getMonth();
    
    const totalWeekdays = calculateWeekdays(year, month);
    
    let requiredDaysValue = attendanceConfig.requiredDaysValue;
    const type = attendanceConfig.requiredDaysType;

    // Count days of each type
    const bankHolidayCount = Object.keys(attendanceData).filter(dateStr => {
        const date = new Date(dateStr);
        return date.getMonth() === month && date.getFullYear() === year && attendanceData[dateStr] === 'bank-holiday';
    }).length;

    const annualLeaveCount = Object.keys(attendanceData).filter(dateStr => {
        const date = new Date(dateStr);
        return date.getMonth() === month && date.getFullYear() === year && attendanceData[dateStr] === 'leave';
    }).length;

    const sickDaysCount = Object.keys(attendanceData).filter(dateStr => {
        const date = new Date(dateStr);
        return date.getMonth() === month && date.getFullYear() === year && attendanceData[dateStr] === 'sick';
    }).length;

    // Calculate available days based on which categories count
    let availableDays = totalWeekdays;
    if (!attendanceConfig.countBankHolidays) {
        availableDays -= bankHolidayCount;
    }
    if (!attendanceConfig.countAnnualLeave) {
        availableDays -= annualLeaveCount;
    }
    if (!attendanceConfig.countSickDays) {
        availableDays -= sickDaysCount;
    }

    // Calculate required days based on percentage or absolute number
    let requiredDays = requiredDaysValue;
    if (type === 'percentage') {
        requiredDays = Math.ceil((requiredDaysValue / 100) * availableDays);
    }

    return {
        totalWeekdays,
        requiredDays: Math.max(0, requiredDays),
        availableDays
    };
}

function updateAttendanceStats() {
    const year = currentAttendanceMonth.getFullYear();
    const month = currentAttendanceMonth.getMonth();
    
    const stats = calculateRequiredDays();
    
    document.getElementById('totalWeekdaysCount').textContent = stats.totalWeekdays;
    document.getElementById('requiredDaysCount').textContent = stats.requiredDays;

    // Count office days met
    const officeDaysMet = Object.keys(attendanceData).filter(dateStr => {
        const date = new Date(dateStr);
        const dayOfWeek = date.getDay();
        return date.getMonth() === month && 
               date.getFullYear() === year && 
               attendanceData[dateStr] === 'office' &&
               dayOfWeek !== 0 && dayOfWeek !== 6; // Exclude weekends
    }).length;

    document.getElementById('officeDaysMet').textContent = officeDaysMet + ' / ' + stats.requiredDays;
    
    // Update the pie charts
    updateAttendanceCharts();
}

// Note: saveToLocalStorage and loadFromLocalStorage are now defined at the top of the file
// as saveToDatabase and loadFromDatabase, with saveToLocalStorage as an alias

// ==================== DUAL PIE CHART FUNCTIONS ====================

function populateMonthSelector() {
    const selector = document.getElementById('attendanceMonthSelector');
    if (!selector) return;
    
    selector.innerHTML = '';
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear() - 2, 0, 1); // Go back 2 years
    
    for (let date = new Date(startDate); date <= new Date(currentDate.getFullYear() + 1, 11, 31); date.setMonth(date.getMonth() + 1)) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const option = document.createElement('option');
        option.value = `${year}-${month}`;
        option.textContent = monthName;
        
        // Select current month by default
        if (year === currentAttendanceMonth.getFullYear() && month === currentAttendanceMonth.getMonth()) {
            option.selected = true;
        }
        
        selector.appendChild(option);
    }
}

function handleMonthSelection() {
    const selector = document.getElementById('attendanceMonthSelector');
    if (!selector) return;
    
    selector.addEventListener('change', (e) => {
        const [year, month] = e.target.value.split('-').map(Number);
        currentAttendanceMonth = new Date(year, month, 1);
        saveToLocalStorage();
        renderAttendanceCalendar();
        updateAttendanceStats();
        updateDashboard();
    });
}

function drawAttendancePieChart(canvasId, year, month, includeUnpast = false) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    
    // Calculate cutoff date for "current" chart
    let endDate;
    if (includeUnpast) {
        const today = new Date();
        endDate = today.getDate();
    } else {
        const lastDay = new Date(year, month + 1, 0);
        endDate = lastDay.getDate();
    }
    
    // Count day types for weekdays only
    let officeCount = 0;
    let holidayCount = 0;
    let sickCount = 0;
    let unselectedCount = 0;
    
    for (let day = 1; day <= endDate; day++) {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay();
        
        // Only count weekdays
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            const dateStr = formatDateToString(date);
            const dayType = attendanceData[dateStr] || null;
            
            if (dayType === 'office') {
                officeCount++;
            } else if (dayType === 'leave') {
                holidayCount++;
            } else if (dayType === 'sick') {
                sickCount++;
            } else if (dayType === 'bank-holiday') {
                holidayCount++;
            } else {
                unselectedCount++;
            }
        }
    }
    
    const total = officeCount + holidayCount + sickCount + unselectedCount;
    if (total === 0) return;
    
    // Calculate angles
    const officeAngle = (officeCount / total) * 2 * Math.PI;
    const holidayAngle = (holidayCount / total) * 2 * Math.PI;
    const sickAngle = (sickCount / total) * 2 * Math.PI;
    const unselectedAngle = (unselectedCount / total) * 2 * Math.PI;
    
    // Colors
    const colors = {
        office: '#4ecdc4',      // Teal/cyan
        holiday: '#ff6b6b',     // Red
        sick: '#ffa500',        // Orange
        unselected: '#e0e0e0'   // Light gray
    };
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw pie slices
    let currentAngle = -Math.PI / 2; // Start from top
    
    // Office days
    if (officeCount > 0) {
        ctx.fillStyle = colors.office;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + officeAngle);
        ctx.closePath();
        ctx.fill();
        currentAngle += officeAngle;
    }
    
    // Holiday days
    if (holidayCount > 0) {
        ctx.fillStyle = colors.holiday;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + holidayAngle);
        ctx.closePath();
        ctx.fill();
        currentAngle += holidayAngle;
    }
    
    // Sick days
    if (sickCount > 0) {
        ctx.fillStyle = colors.sick;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sickAngle);
        ctx.closePath();
        ctx.fill();
        currentAngle += sickAngle;
    }
    
    // Unselected days
    if (unselectedCount > 0) {
        ctx.fillStyle = colors.unselected;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + unselectedAngle);
        ctx.closePath();
        ctx.fill();
    }
    
    // Draw border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Return counts for stats display
    return { officeCount, holidayCount, sickCount, unselectedCount };
}

function updateAttendanceCharts() {
    // This function is kept for compatibility but pie charts have been removed from attendance page
}

// Make functions available globally for HTML onclick handlers
window.removeHoliday = removeHoliday;

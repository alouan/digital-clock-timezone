const clocksContainer = document.getElementById('clocksContainer');
const addTimezoneSelect = document.getElementById('addTimezone');
const addBtn = document.getElementById('addBtn');
const resetBtn = document.getElementById('resetBtn');

// Common timezones
const timezones = [
    { name: 'New York (EST)', zone: 'America/New_York' },
    { name: 'London (GMT)', zone: 'Europe/London' },
    { name: 'Paris (CET)', zone: 'Europe/Paris' },
    { name: 'Tokyo (JST)', zone: 'Asia/Tokyo' },
    { name: 'Sydney (AEDT)', zone: 'Australia/Sydney' },
    { name: 'Dubai (GST)', zone: 'Asia/Dubai' },
    { name: 'Singapore (SGT)', zone: 'Asia/Singapore' },
    { name: 'Hong Kong (HKT)', zone: 'Asia/Hong_Kong' },
    { name: 'Los Angeles (PST)', zone: 'America/Los_Angeles' },
    { name: 'Chicago (CST)', zone: 'America/Chicago' },
    { name: 'Mexico City (CST)', zone: 'America/Mexico_City' },
    { name: 'São Paulo (BRT)', zone: 'America/Sao_Paulo' },
    { name: 'Moscow (MSK)', zone: 'Europe/Moscow' },
    { name: 'Istanbul (EET)', zone: 'Europe/Istanbul' },
    { name: 'Mumbai (IST)', zone: 'Asia/Kolkata' },
    { name: 'Bangkok (ICT)', zone: 'Asia/Bangkok' },
    { name: 'Auckland (NZDT)', zone: 'Pacific/Auckland' },
    { name: 'Toronto (EST)', zone: 'America/Toronto' },
    { name: 'Amsterdam (CET)', zone: 'Europe/Amsterdam' },
    { name: 'Berlin (CET)', zone: 'Europe/Berlin' }
];

let selectedTimezones = JSON.parse(localStorage.getItem('selectedTimezones')) || [
    'America/New_York',
    'Europe/London',
    'Asia/Tokyo'
];

// Initialize
populateTimezoneSelect();
displayClocks();
setInterval(updateClocks, 1000);

// Populate timezone select
function populateTimezoneSelect() {
    timezones.forEach(tz => {
        const option = document.createElement('option');
        option.value = tz.zone;
        option.textContent = tz.name;
        addTimezoneSelect.appendChild(option);
    });
}

// Add timezone
addBtn.addEventListener('click', () => {
    const selectedZone = addTimezoneSelect.value;
    if (!selectedZone) return;
    
    if (!selectedTimezones.includes(selectedZone)) {
        selectedTimezones.push(selectedZone);
        saveTimezones();
        displayClocks();
    }
    addTimezoneSelect.value = '';
});

// Reset to default
resetBtn.addEventListener('click', () => {
    selectedTimezones = [
        'America/New_York',
        'Europe/London',
        'Asia/Tokyo'
    ];
    saveTimezones();
    displayClocks();
});

// Display all clock cards
function displayClocks() {
    clocksContainer.innerHTML = '';
    
    if (selectedTimezones.length === 0) {
        clocksContainer.innerHTML = '<div class="no-clocks">No timezones selected. Add one to get started!</div>';
        return;
    }
    
    selectedTimezones.forEach(zone => {
        const tzName = timezones.find(tz => tz.zone === zone)?.name || zone;
        const clockCard = createClockCard(tzName, zone);
        clocksContainer.appendChild(clockCard);
    });
    
    updateClocks();
}

// Create a clock card
function createClockCard(name, zone) {
    const card = document.createElement('div');
    card.className = 'clock-card';
    card.dataset.zone = zone;
    
    card.innerHTML = `
        <button class="remove-btn" onclick="removeTimezone('${zone}')">×</button>
        <div class="timezone-name">${name}</div>
        <div class="digital-time" data-time></div>
        <div class="time-period" data-period></div>
        <div class="analog-clock">
            <div class="hand hour-hand" data-hour-hand></div>
            <div class="hand minute-hand" data-minute-hand></div>
            <div class="hand second-hand" data-second-hand></div>
            <div class="clock-center"></div>
        </div>
    `;
    
    return card;
}

// Update all clocks
function updateClocks() {
    const cards = document.querySelectorAll('.clock-card');
    
    cards.forEach(card => {
        const zone = card.dataset.zone;
        const now = new Date();
        
        try {
            const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: zone,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
            
            const parts = formatter.formatToParts(now);
            const timeObj = {};
            parts.forEach(part => {
                if (part.type !== 'literal') {
                    timeObj[part.type] = part.value;
                }
            });
            
            const hours = parseInt(timeObj.hour);
            const minutes = parseInt(timeObj.minute);
            const seconds = parseInt(timeObj.second);
            
            // Update digital time
            const digitalTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            card.querySelector('[data-time]').textContent = digitalTime;
            
            // Update period
            const period = hours >= 12 ? 'PM' : 'AM';
            card.querySelector('[data-period]').textContent = period;
            
            // Update analog clock hands
            const secondDegrees = (seconds / 60) * 360;
            const minuteDegrees = (minutes / 60) * 360 + (seconds / 60) * 6;
            const hourDegrees = (hours % 12 / 12) * 360 + (minutes / 60) * 30;
            
            card.querySelector('[data-hour-hand]').style.transform = `rotate(${hourDegrees}deg)`;
            card.querySelector('[data-minute-hand]').style.transform = `rotate(${minuteDegrees}deg)`;
            card.querySelector('[data-second-hand]').style.transform = `rotate(${secondDegrees}deg)`;
        } catch (e) {
            console.error(`Invalid timezone: ${zone}`, e);
        }
    });
}

// Remove timezone
function removeTimezone(zone) {
    selectedTimezones = selectedTimezones.filter(z => z !== zone);
    saveTimezones();
    displayClocks();
}

// Save to local storage
function saveTimezones() {
    localStorage.setItem('selectedTimezones', JSON.stringify(selectedTimezones));
}
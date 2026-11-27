const API_URL = "http://localhost:5000/api/events";
const REGISTRATION_URL = "http://localhost:5000/api/registrations";
const DEMO_STUDENT_ID = "demo-student-001";

let displayedMonth = new Date(2026, 11, 1);
let calendarEvents = [];
let selectedDate = null;
let activeView = "calendar";
let calendarState = "loading";
let savedRequestNumber = 0;

// API REQUESTS
async function getEvents(organizationName = "") {
    const url = new URL(API_URL);

    if (organizationName) {
        url.searchParams.set("organization", organizationName);
    }

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const events = await response.json();

    if (!Array.isArray(events)) {
        throw new Error("Invalid response format: Expected an array of events.");
    }

    return events;
}

async function getStudentRegistrations() {
    const response = await fetch(
        `${REGISTRATION_URL}/student/${encodeURIComponent(DEMO_STUDENT_ID)}`
    );

    if (!response.ok) {
        throw new Error("Failed to retrieve registrations");
    }

    const registrations = await response.json();

    if (!Array.isArray(registrations)) {
        throw new Error("Invalid registration response.");
    }

    return registrations;
}

// HELPERS
function createElement(tag, className = "", text = "") {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    if (text) {
        element.textContent = text;
    }

    return element;
}

function getDetailsSection() {
    return document.getElementById("event-details");
}

function setPanelTitle(title) {
    document.querySelector(".event-panel-header h2").textContent = title;
}

function formatDate(date) {
    return new Date(date).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
    });
}

function formatTime(date) {
    return new Date(date).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit"
    });
}

function isSameDate(first, second) {
    return first.getFullYear() === second.getFullYear() &&
        first.getMonth() === second.getMonth() &&
        first.getDate() === second.getDate();
}

function createIcon(name) {
    const icons = {
        calendar: `
            <rect x="3" y="5" width="18" height="16" rx="2"/>
            <path d="M16 3v4M8 3v4M3 10h18"/>
        `,
        clock: `
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 7v5l3 2"/>
        `,
        location: `
            <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/>
            <circle cx="12" cy="10" r="2.5"/>
        `,
        organization: `
            <circle cx="9" cy="8" r="3"/>
            <path d="M3 21v-3a6 6 0 0 1 12 0v3"/>
            <path d="M16 5a3 3 0 0 1 0 6M21 21v-3a6 6 0 0 0-4-5"/>
        `,
        bookmark: `
            <path d="M6 4h12v17l-6-4-6 4z"/>
        `,
        error: `
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 7v6M12 16h.01"/>
        `,
        back: `
            <path d="m15 18-6-6 6-6"/>
        `,
        check: `
            <circle cx="12" cy="12" r="9"/>
            <path d="m8 12 3 3 5-6"/>
        `
    };

    const svg = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
    );

    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "1.7");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");

    svg.innerHTML = icons[name] || icons.calendar;

    return svg;
}

function createMetaRow(icon, text) {
    const row = createElement("div", "event-meta-row");

    row.appendChild(
        createElement("span", "", text)
    );

    return row;
}

function createBackButton(text, onClick) {
    const button = createElement("button", "back-button");

    button.type = "button";

    button.append(
        createIcon("back"),
        document.createTextNode(text)
    );

    button.addEventListener("click", onClick);

    return button;
}


// EMPTY, LOADING AND ERROR MESSAGES
function displayState(
    title,
    message,
    type = "empty",
    icon = "calendar",
    retryAction = null
) {
    const detailsSection = getDetailsSection();
    const state = createElement("div", `${type}-state`);

    state.append(
        createElement("h3", "", title),
        createElement("p", "", message)
    );

    if (retryAction) {
        const retryButton = createElement(
            "button",
            "retry-button",
            "Try Again"
        );

        retryButton.type = "button";
        retryButton.addEventListener("click", retryAction);

        state.appendChild(retryButton);
    }

    detailsSection.replaceChildren(state);
}

function displayDatePrompt() {
    displayState(
        "Select a date",
        "Choose a date on the calendar to view upcoming campus events."
    );
}

// EVENT PREVIEW
function createEventCard(event, onClick, registered = false) {
    const card = createElement(
        "article",
        registered ? "saved-event-card" : "event-card"
    );

    const title = createElement("h3", "", event.title);

    const organization = createElement(
        "p",
        "event-organization",
        event.organization
    );

    const meta = createElement("div", "event-meta");

    meta.append(
        createMetaRow("calendar", formatDate(event.date)),
        createMetaRow("clock", formatTime(event.date)),
        createMetaRow("location", event.location)
    );

    card.append(title, organization, meta);

    if (registered) {
        const badge = createElement(
            "span",
            "registration-badge"
        );

        badge.textContent = "Registered";

        card.appendChild(badge);
    }

    const detailsButton = createElement(
        "button",
        "view-details-button",
        "View Details"
    );

    detailsButton.type = "button";
    detailsButton.addEventListener("click", onClick);

    card.appendChild(detailsButton);

    return card;
}

function displayDateEvents(date) {
    const detailsSection = getDetailsSection();

    setPanelTitle("Upcoming Events");

    const matchingEvents = calendarEvents.filter(event =>
        isSameDate(new Date(event.date), date)
    );

    if (matchingEvents.length === 0) {
        displayState(
            "No upcoming events",
            `There are no upcoming events on ${formatDate(date)}. Select another date.`
        );

        return;
    }

    const dateHeading = createElement(
        "p",
        "selected-date",
        formatDate(date)
    );

    const eventCount = createElement(
        "p",
        "selected-date",
        `${matchingEvents.length} ${
            matchingEvents.length === 1 ? "event" : "events"
        } available`
    );

    const eventList = createElement("div", "event-list");

    matchingEvents.forEach(event => {
        const card = createEventCard(event, () => {
            displayEventDetails(event, () => {
                displayDateEvents(date);
            });
        });

        eventList.appendChild(card);
    });

    detailsSection.replaceChildren(
        dateHeading,
        eventCount,
        eventList
    );
}

// EVENT DETS AND REGISTRATION
function displayEventDetails(event, onBack = null) {
    const detailsSection = getDetailsSection();

    setPanelTitle("Event Details");

    const card = createElement("article", "event-detail-card");

    if (onBack) {
        card.appendChild(
            createBackButton("Back to events", onBack)
        );
    }

    const status = createElement(
        "span",
        "event-status",
        event.status === "canceled" ? "Canceled" : "Upcoming Event"
    );

    const title = createElement("h3", "", event.title);

    const meta = createElement("div", "event-meta");

    meta.append(
        createMetaRow("organization", event.organization),
        createMetaRow("calendar", formatDate(event.date)),
        createMetaRow("clock", formatTime(event.date)),
        createMetaRow("location", event.location)
    );

    const description = createElement(
        "div",
        "event-description"
    );

    description.append(
        createElement("h4", "", "About this event"),
        createElement("p", "", event.description)
    );

    const registerButton = createElement(
        "button",
        "register-button",
        "Checking registration status..."
    );

    registerButton.type = "button";
    registerButton.disabled = true;

    const feedback = createElement(
        "p",
        "registration-feedback"
    );

    feedback.setAttribute("role", "status");

    function setRegistered(message) {
        registerButton.textContent = "Registered";
        registerButton.disabled = true;

        feedback.classList.remove("error");
        feedback.textContent = message;
    }

    function setAvailable() {
        registerButton.textContent = "Save & Register";
        registerButton.disabled = false;
    }

    function registrationClosed() {
        return event.status === "canceled" ||
            new Date(event.date) <= new Date();
    }

    function setClosed() {
        registerButton.textContent = "Registration Closed";
        registerButton.disabled = true;
    }

    // Verify whether the demo student is already registered.
    getStudentRegistrations()
        .then(registrations => {
            const alreadyRegistered = registrations.some(
                registration =>
                    registration.event &&
                    registration.event._id === event._id &&
                    registration.status === "registered"
            );

            if (alreadyRegistered) {
                setRegistered(
                    "You are already registered for this event."
                );
            } else if (registrationClosed()) {
                setClosed();
            } else {
                setAvailable();
            }
        })
        .catch(error => {
            console.error(
                "Unable to check registration status:",
                error
            );

            if (registrationClosed()) {
                setClosed();
            } else {
                setAvailable();

                feedback.classList.add("error");
                feedback.textContent =
                    "Unable to verify registration status. You may still attempt registration.";
            }
        });

    // Register the student through the existing API.
    registerButton.addEventListener("click", async () => {
        registerButton.disabled = true;
        registerButton.textContent = "Registering...";

        feedback.classList.remove("error");
        feedback.textContent = "Registering for this event...";

        try {
            const response = await fetch(REGISTRATION_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    eventId: event._id,
                    studentId: DEMO_STUDENT_ID
                })
            });

            const result = await response.json();

            if (response.status === 409) {
                setRegistered(
                    "A registration already exists for this event."
                );
                return;
            }

            if (!response.ok) {
                throw new Error(
                    result.message || "Registration failed."
                );
            }

            setRegistered(
                "Registration successful! You can find this event under Saved Events."
            );

        } catch (error) {
            feedback.classList.add("error");
            feedback.textContent = error.message;

            if (registrationClosed()) {
                setClosed();
            } else {
                setAvailable();
            }
        }
    });

    card.append(
        status,
        title,
        meta,
        description,
        registerButton,
        feedback
    );

    detailsSection.replaceChildren(card);
}

// SAVED EVENTS
async function displaySavedEvents() {
    const requestNumber = ++savedRequestNumber;

    setPanelTitle("Saved Events");

    displayState(
        "Loading saved events",
        "Retrieving your registrations...",
        "loading",
        "bookmark"
    );

    try {
        const registrations = await getStudentRegistrations();

        if (
            requestNumber !== savedRequestNumber ||
            activeView !== "saved"
        ) {
            return;
        }

        const activeRegistrations = registrations.filter(
            registration =>
                registration.status === "registered" &&
                registration.event
        );

        if (activeRegistrations.length === 0) {
            displayState(
                "No saved events",
                "Register for a campus event to find it here.",
                "empty",
                "bookmark"
            );

            return;
        }

        const eventList = createElement(
            "div",
            "saved-events-list"
        );

        const heading = createElement(
            "p",
            "selected-date",
            `${activeRegistrations.length} registered ${
                activeRegistrations.length === 1 ? "event" : "events"
            }`
        );

        activeRegistrations.forEach(registration => {
            const event = registration.event;

            const card = createEventCard(
                event,
                () => {
                    displayEventDetails(event, displaySavedEvents);
                },
                true
            );

            eventList.appendChild(card);
        });

        getDetailsSection().replaceChildren(
            heading,
            eventList
        );

    } catch (error) {
        console.error("Error loading saved events:", error);

        if (
            requestNumber !== savedRequestNumber ||
            activeView !== "saved"
        ) {
            return;
        }

        displayState(
            "Unable to load saved events",
            "Your registrations could not be retrieved.",
            "error",
            "error",
            displaySavedEvents
        );
    }
}

// CALENDAR
function renderCalendar() {
    const calendarGrid = document.getElementById("calendar-grid");
    const monthHeading = document.getElementById("calendar-month");

    if (!calendarGrid || !monthHeading) {
        return;
    }

    calendarGrid.replaceChildren();

    monthHeading.textContent = displayedMonth.toLocaleDateString(
        "en-US",
        {
            month: "long",
            year: "numeric"
        }
    );

    const year = displayedMonth.getFullYear();
    const month = displayedMonth.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const today = new Date();

    // Weekday headings
    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        .forEach(day => {
            calendarGrid.appendChild(
                createElement("div", "calendar-weekday", day)
            );
        });

    // Empty cells before the first day
    for (let i = 0; i < firstDay; i++) {
        calendarGrid.appendChild(
            createElement("div", "calendar-empty")
        );
    }

    // Generate each calendar date
    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month, day);

        const dateButton = createElement(
            "button",
            "calendar-day"
        );

        dateButton.type = "button";

        const dateLabel = createElement(
            "span",
            "day-number",
            String(day)
        );

        dateButton.appendChild(dateLabel);

        const matchingEvents = calendarEvents.filter(event =>
            isSameDate(new Date(event.date), currentDate)
        );

        const isSelected = selectedDate !== null &&
            isSameDate(selectedDate, currentDate);

        dateButton.setAttribute(
            "aria-pressed",
            String(isSelected)
        );

        dateButton.setAttribute(
            "aria-label",
            `${formatDate(currentDate)}, ${matchingEvents.length} events`
        );

        if (isSelected) {
            dateButton.classList.add("selected-day");
        }

        if (isSameDate(today, currentDate)) {
            dateButton.classList.add("today");
        }

        // Display up to two event labels per calendar cell.
        matchingEvents.slice(0, 2).forEach(event => {
            const eventLabel = createElement(
                "span",
                "calendar-event",
                event.title
            );

            eventLabel.title = event.title;

            dateButton.appendChild(eventLabel);
        });

        if (matchingEvents.length > 2) {
            dateButton.appendChild(
                createElement(
                    "span",
                    "more-events",
                    `+${matchingEvents.length - 2} more`
                )
            );
        }

        dateButton.disabled =
            calendarState === "loading" ||
            calendarState === "error" ||
            activeView === "saved";

        dateButton.addEventListener("click", () => {
            selectedDate = currentDate;

            renderCalendar();
            displayDateEvents(currentDate);

            const selectedButton = calendarGrid.querySelector(
                '[aria-pressed="true"]'
            );

            selectedButton?.focus({ preventScroll: true });
        });

        calendarGrid.appendChild(dateButton);
    }

    // Complete the final calendar row.
    const remainingCells =
        (7 - ((firstDay + daysInMonth) % 7)) % 7;

    for (let i = 0; i < remainingCells; i++) {
        calendarGrid.appendChild(
            createElement("div", "calendar-empty")
        );
    }
}


// EVENTS PAGE CLASS FROM FR-1: VIEW UPCOMING EVENTS
class EventsPage {
    constructor() {
        this.latestSearch = 0;
        this.detailsSection = document.getElementById("event-details");
    }

    async viewUpcomingEvents(organizationName = "") {
        const searchNumber = ++this.latestSearch;

        calendarState = "loading";
        selectedDate = null;
        calendarEvents = [];

        setPanelTitle("Upcoming Events");

        renderCalendar();

        displayState(
            "Loading upcoming events",
            "Retrieving campus events...",
            "loading"
        );

        try {
            const events = await getEvents(organizationName);

            // Ignore outdated search responses.
            if (searchNumber !== this.latestSearch) {
                return;
            }

            if (events.length > 0) {
                this.displayEvents(events);
            } else {
                this.displayEmptyState();
            }

        } catch (error) {
            console.error("Error loading events:", error);

            if (searchNumber !== this.latestSearch) {
                return;
            }

            this.displayErrorState();
        }
    }

    displayEvents(events) {
        calendarState = "ready";
        calendarEvents = events;
        selectedDate = null;

        // Move to a matching month if the current month
        // does not contain any of the retrieved events.
        const hasEventsInMonth = events.some(event => {
            const date = new Date(event.date);

            return date.getFullYear() === displayedMonth.getFullYear() &&
                date.getMonth() === displayedMonth.getMonth();
        });

        if (!hasEventsInMonth) {
            const firstEventDate = new Date(events[0].date);

            displayedMonth = new Date(
                firstEventDate.getFullYear(),
                firstEventDate.getMonth(),
                1
            );
        }

        renderCalendar();
        displayDatePrompt();
    }

    displayEmptyState() {
        calendarState = "empty";
        calendarEvents = [];
        selectedDate = null;

        renderCalendar();

        displayState(
            "No upcoming events found",
            "Try searching for another organization."
        );
    }

    displayErrorState() {
        calendarState = "error";
        calendarEvents = [];
        selectedDate = null;

        renderCalendar();

        displayState(
            "Unable to load events",
            "Check your connection or try again in a moment.",
            "error",
            "error",
            () => {
                const searchInput = document.getElementById(
                    "organization-search"
                );

                this.viewUpcomingEvents(
                    searchInput.value.trim()
                );
            }
        );
    }

    invalidatePendingSearches() {
        this.latestSearch++;
    }
}


// NAV
function setActiveTab(view) {
    activeView = view;

    const tabs = {
        calendar: document.getElementById("calendar-tab"),
        organizations: document.getElementById("organizations-tab"),
        saved: document.getElementById("saved-tab")
    };

    Object.entries(tabs).forEach(([name, tab]) => {
        if (!tab) return;

        tab.classList.toggle("active", name === view);

        if (name === view) {
            tab.setAttribute("aria-current", "page");
        } else {
            tab.removeAttribute("aria-current");
        }
    });

    const previousButton = document.getElementById("previous-month");
    const nextButton = document.getElementById("next-month");

    previousButton.disabled = view === "saved";
    nextButton.disabled = view === "saved";
}

// FRONTEND
document.addEventListener("DOMContentLoaded", () => {
    const eventsPage = new EventsPage();

    const searchInput = document.getElementById(
        "organization-search"
    );

    const calendarTab = document.getElementById("calendar-tab");
    const organizationsTab = document.getElementById("organizations-tab");
    const savedTab = document.getElementById("saved-tab");

    const previousMonthButton = document.getElementById(
        "previous-month"
    );

    const nextMonthButton = document.getElementById(
        "next-month"
    );

    // Load upcoming events when the application opens.
    setActiveTab("calendar");
    eventsPage.viewUpcomingEvents();

    function changeMonth(amount) {
        displayedMonth.setMonth(
            displayedMonth.getMonth() + amount
        );

        selectedDate = null;

        renderCalendar();

        if (calendarState === "ready") {
            setPanelTitle("Upcoming Events");
            displayDatePrompt();
        }
    }

    previousMonthButton.addEventListener("click", () => {
        changeMonth(-1);
    });

    nextMonthButton.addEventListener("click", () => {
        changeMonth(1);
    });

    // Search for events by organization.
    searchInput.addEventListener("input", () => {
        savedRequestNumber++;

        setActiveTab("organizations");

        eventsPage.viewUpcomingEvents(
            searchInput.value.trim()
        );
    });

    // Return to the complete calendar.
    calendarTab.addEventListener("click", event => {
        event.preventDefault();

        savedRequestNumber++;

        setActiveTab("calendar");

        searchInput.value = "";

        eventsPage.viewUpcomingEvents();
    });

    // Use the existing organization search functionality.
    organizationsTab.addEventListener("click", event => {
        event.preventDefault();

        savedRequestNumber++;

        setActiveTab("organizations");

        eventsPage.viewUpcomingEvents(
            searchInput.value.trim()
        );

        searchInput.focus();
    });

    // Display registrations retrieved from MongoDB.
    savedTab.addEventListener("click", event => {
        event.preventDefault();

        eventsPage.invalidatePendingSearches();

        setActiveTab("saved");

        selectedDate = null;

        renderCalendar();
        displaySavedEvents();
    });
});

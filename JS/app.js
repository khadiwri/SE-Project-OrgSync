
const API_URL = "http://localhost:5000/api/events";
const REGISTRATION_URL = "http://localhost:5000/api/registrations";
const DEMO_STUDENT_ID = "demo-student-001";

// Retrieve upcoming events from the OrgSync backend
async function getEvents(organizationName = "") {
    try {
        const url = new URL(API_URL);

        if (organizationName) {
            url.searchParams.set("organization", organizationName);
        }

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const events = await response.json();
        console.log("Events retrieved successfully:", events);

        return events;
    } catch (error) {
        console.error("Error retrieving events:", error);
        return [];
    }
}

// Retrieve registrations for the demo student
async function getStudentRegistrations() {
    const response = await fetch(
        `${REGISTRATION_URL}/student/${encodeURIComponent(DEMO_STUDENT_ID)}`
    );

    if (!response.ok) {
        throw new Error("Failed to retrieve registrations");
    }

    return await response.json();
}

// Display the details of a selected event
function displayEventDetails(event) {
    const detailsSection = document.getElementById("event-details");

    detailsSection.replaceChildren();

    const title = document.createElement("h2");
    title.textContent = event.title;

    const description = document.createElement("p");
    description.textContent = event.description;

    const organization = document.createElement("p");
    organization.textContent = `Organization: ${event.organization}`;

    const location = document.createElement("p");
    location.textContent = `Location: ${event.location}`;

    const date = document.createElement("p");
    date.textContent = `Date: ${new Date(event.date).toLocaleString()}`;

    const status = document.createElement("p");
    status.textContent = `Status: ${event.status}`;

    detailsSection.append(
        title,
        description,
        organization,
        location,
        date,
        status
    );

    // Register for the selected event
    const registerButton = document.createElement("button");
    registerButton.type = "button";
    registerButton.textContent = "Register for Event";

    const feedback = document.createElement("p");
    feedback.setAttribute("role", "status");

    // Check whether the demo student is already registered
    getStudentRegistrations()
        .then(registrations => {
            const alreadyRegistered = registrations.some(
                registration =>
                    registration.event &&
                    registration.event._id === event._id &&
                    registration.status === "registered"
            );

            if (alreadyRegistered) {
                registerButton.textContent = "Registered";
                registerButton.disabled = true;
                feedback.textContent = "You are already registered for this event.";
            }
        })
        .catch(error => {
            console.error("Unable to check registration status:", error);
        });

    registerButton.addEventListener("click", async () => {
        registerButton.disabled = true;
        feedback.textContent = "Registering...";

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
                feedback.textContent =
                    "You are already registered for this event.";
                registerButton.textContent = "Registered";
                return;
            }

            if (!response.ok) {
                throw new Error(
                    result.message || "Registration failed"
                );
            }

            feedback.textContent = "Registration successful!";
            registerButton.textContent = "Registered";

        } catch (error) {
            feedback.textContent = error.message;
        } finally {
            if (registerButton.textContent !== "Registered") {
                registerButton.disabled = false;
            }
        }
    });

    detailsSection.append(registerButton, feedback);
}

// Display events that the demo student has registered for
async function displaySavedEvents() {
    const detailsSection = document.getElementById("event-details");

    detailsSection.replaceChildren();

    const heading = document.createElement("h2");
    heading.textContent = "My Registered Events";

    detailsSection.appendChild(heading);

    const loadingMessage = document.createElement("p");
    loadingMessage.textContent = "Loading registered events...";
    detailsSection.appendChild(loadingMessage);

    try {
        const registrations = await getStudentRegistrations();

        loadingMessage.remove();

        const activeRegistrations = registrations.filter(
            registration =>
                registration.status === "registered" &&
                registration.event
        );

        if (activeRegistrations.length === 0) {
            const message = document.createElement("p");
            message.textContent =
                "You haven't registered for any events yet.";

            detailsSection.appendChild(message);
            return;
        }

        activeRegistrations.forEach(registration => {
            const event = registration.event;

            const eventButton = document.createElement("button");
            eventButton.type = "button";

            eventButton.textContent =
                `${event.title} — ${new Date(event.date).toLocaleString()}`;

            eventButton.addEventListener("click", () => {
                displayEventDetails(event);
            });

            detailsSection.appendChild(eventButton);
        });

    } catch (error) {
        console.error("Error loading registered events:", error);

        loadingMessage.remove();

        const message = document.createElement("p");
        message.textContent = "Unable to load registered events.";

        detailsSection.appendChild(message);
    }
}



let displayedMonth = new Date(2026, 11, 1);
let calendarEvents = [];

function renderCalendar() {
    const calendarGrid = document.getElementById("calendar-grid");
    const monthHeading = document.getElementById("calendar-month");

    if (!calendarGrid || !monthHeading) return;

    calendarGrid.replaceChildren();

    monthHeading.textContent = displayedMonth.toLocaleDateString(
        "en-US",
        { month: "long", year: "numeric" }
    );

    const year = displayedMonth.getFullYear();
    const month = displayedMonth.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Weekday headings
    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach(day => {
        const heading = document.createElement("div");
        heading.className = "calendar-weekday";
        heading.textContent = day;
        calendarGrid.appendChild(heading);
    });

    // Empty cells before the first day
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement("div");
        emptyCell.className = "calendar-empty";
        calendarGrid.appendChild(emptyCell);
    }

    // Generate calendar dates
    for (let day = 1; day <= daysInMonth; day++) {
        const dateButton = document.createElement("button");
        dateButton.type = "button";
        dateButton.className = "calendar-day";

        const dateLabel = document.createElement("span");
        dateLabel.textContent = day;
        dateButton.appendChild(dateLabel);

        const matchingEvents = calendarEvents.filter(event => {
            const eventDate = new Date(event.date);

            return (
                eventDate.getFullYear() === year &&
                eventDate.getMonth() === month &&
                eventDate.getDate() === day
            );
        });

        matchingEvents.forEach(event => {
            const eventLabel = document.createElement("span");
            eventLabel.className = "calendar-event";
            eventLabel.textContent = event.title;
            dateButton.appendChild(eventLabel);
        });

        dateButton.addEventListener("click", () => {
            if (matchingEvents.length === 0) {
                const detailsSection = document.getElementById("event-details");
                detailsSection.replaceChildren();

                const message = document.createElement("p");
                message.textContent = "No upcoming events on this date.";
                detailsSection.appendChild(message);
            } else {
                displayEventDetails(matchingEvents[0]);
            }
        });

        calendarGrid.appendChild(dateButton);
    }
}

// replace with actual "mock" data
// keys are YYYY-MM-DD so a day cell can look itself up
const events = {
  '2026-12-05': [
    {
      title: 'Welcome Mixer',
      org: 'Student Government',
      time: '6:00 PM',
      location: 'Student Center',
      description: 'Meet fellow students and learn about campus orgs.'
    }
  ]
};

const dialog = document.getElementById('event-dialog');
const dialogTitle = document.getElementById('event-dialog-title');
const dialogBody = document.getElementById('event-dialog-body');

function formatDate(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric'
  });
}

function buildEventCard(ev) {
  const card = document.createElement('article');
  card.className = 'event-card';

  const title = document.createElement('h3');
  title.textContent = ev.title;

  const org = document.createElement('p');
  org.className = 'event-org';
  org.textContent = ev.org;

  const details = document.createElement('dl');
  [['Time', ev.time], ['Location', ev.location]].forEach(([label, value]) => {
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = value;
    details.append(dt, dd);
  });

  const desc = document.createElement('p');
  desc.className = 'event-desc';
  desc.textContent = ev.description;

  card.append(title, org, details, desc);
  return card;
}

function openEventDialog(isoDate) {
  const dayEvents = events[isoDate] || [];

  dialogTitle.textContent = formatDate(isoDate);
  dialogBody.replaceChildren();

  //check for event free days
  if (dayEvents.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'event-empty';
    empty.textContent = 'No events scheduled. Enjoy the day!';
    dialogBody.append(empty);
  } else {
    dayEvents.forEach(ev => dialogBody.append(buildEventCard(ev)));
  }

  dialog.showModal();
}

// One listener on the grid handles every day, even after re-rendering months
document.getElementById('calendar-grid').addEventListener('click', (e) => {
  const day = e.target.closest('.calendar-day');
  if (day && day.dataset.date) openEventDialog(day.dataset.date);
});

dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());

//click outside the dialog's box to close it
dialog.addEventListener('click', (e) => {
  if (e.target === dialog) dialog.close();
});
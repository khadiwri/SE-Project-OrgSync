// Initialize the frontend
document.addEventListener("DOMContentLoaded", async () => {
    const searchInput = document.querySelector(
        '.search-section input[type="search"]'
    );

    const detailsSection = document.getElementById("event-details");

    const savedTab = document.querySelector(
        ".app-tabs a:nth-child(3)"
    );

    const calendarTab = document.querySelector(
        ".app-tabs a:nth-child(1)"
    );

    /* Profile Card */
    const profileToggle = document.querySelector('.profile-toggle');
    const profileCard = document.getElementById('profile-menu');

    function setProfileMenu(open) {
    profileToggle.setAttribute('aria-expanded', String(open));
    profileCard.hidden = !open;
    }

    profileToggle.addEventListener('click', () => {
    setProfileMenu(profileToggle.getAttribute('aria-expanded') !== 'true');
    });

    //close when clicking elsewhere
    document.addEventListener('click', (e) => {
    if (!e.target.closest('.profile')) setProfileMenu(false);
    });

    //close using Escape and return focus to the toggle
    document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !profileCard.hidden) {
        setProfileMenu(false);
        profileToggle.focus();
    }
    });

    // Prevent older searches from overwriting newer results
    let latestSearch = 0;

    async function loadEvents(organizationName = "") {
        const searchNumber = ++latestSearch;
        const events = await getEvents(organizationName);
        calendarEvents = events;
        renderCalendar();

        if (searchNumber !== latestSearch) {
            return;
        }

        if (events.length > 0) {
            displayEventDetails(events[0]);
        } else {
            detailsSection.replaceChildren();

            const message = document.createElement("p");
            message.textContent = "No upcoming events found.";

            detailsSection.appendChild(message);
        }
    }

    // Load upcoming events when the page opens
    await loadEvents();

    const previousMonthButton = document.getElementById("previous-month");
    const nextMonthButton = document.getElementById("next-month");

    if (previousMonthButton) {
        previousMonthButton.addEventListener("click", () => {
            displayedMonth.setMonth(displayedMonth.getMonth() - 1);
            renderCalendar();
        });
    }

    if (nextMonthButton) {
        nextMonthButton.addEventListener("click", () => {
            displayedMonth.setMonth(displayedMonth.getMonth() + 1);
            renderCalendar();
        });
    }


    // Search by organization name
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            loadEvents(searchInput.value.trim());
        });
    }

    // Display registered events when Saved is clicked
    if (savedTab) {
        savedTab.addEventListener("click", async (event) => {
            event.preventDefault();

            // Invalidate pending searches
            latestSearch++;

            await displaySavedEvents();
        });
    }

    // Return to upcoming events when calendar is clicked
    if (calendarTab) {
        calendarTab.addEventListener("click", (event) => {
            event.preventDefault();

            loadEvents(searchInput ? searchInput.value.trim() : "");
        });
    }
});
class User {
  // UML visibility mapping
  // - userId: int
  // - displayName: String
  // - email: String
  // - passwordHash: String
  // - dateJoined: Date
  // + login(email: String, password: String): boolean
  // + updateProfile(name: String): void
  #userId;
  #displayName;
  #email;
  #passwordHash;
  #dateJoined;

  constructor(userId, displayName, email, passwordHash, dateJoined) {
    this.#userId = userId;
    this.#displayName = displayName;
    this.#email = email;
    this.#passwordHash = passwordHash;
    this.#dateJoined = dateJoined;
  }

  login(email, password) {
    return this.#email === email && this.#passwordHash === password;
  }

  updateProfile(name) {
    this.#displayName = name;
  }
}

class Student extends User {
  // Student: Actor
  // Student 1..1 -> EventsPage 1..1
  #studentId;
  #major;
  #eventsPage;

  constructor(userId, displayName, email, passwordHash, dateJoined, studentId, major, eventsPage = null) {
    super(userId, displayName, email, passwordHash, dateJoined);
    this.#studentId = studentId;
    this.#major = major;
    this.#eventsPage = eventsPage;
  }

  setEventsPage(eventsPage) {
    this.#eventsPage = eventsPage;
  }

  viewUpcomingEvents() {
    if (!this.#eventsPage) {
      return [];
    }

    return this.#eventsPage.viewUpcomingEvents();
  }
}

class EventTag {
  #tagId;
  #tagName;
  #category;

  constructor(tagId, tagName, category) {
    this.#tagId = tagId;
    this.#tagName = tagName;
    this.#category = category;
  }

  get tagName() {
    return this.#tagName;
  }
}

class Event {
  #eventId;
  #title;
  #description;
  #dateTime;
  #location;
  #tags;

  constructor(eventId, title, description, dateTime, location, tags = []) {
    this.#eventId = eventId;
    this.#title = title;
    this.#description = description;
    this.#dateTime = dateTime;
    this.#location = location;
    this.#tags = tags;
  }

  get title() {
    return this.#title;
  }

  get description() {
    return this.#description;
  }

  get dateTime() {
    return this.#dateTime;
  }

  get location() {
    return this.#location;
  }

  get tags() {
    return this.#tags;
  }
}

class EventsPage {
  // EventsPage: Interface
  // EventsPage 1..1 -> EventService 1..1
  #eventService;
  #sequenceLogger;

  constructor(eventService, sequenceLogger = () => {}) {
    this.#eventService = eventService;
    this.#sequenceLogger = sequenceLogger;
  }

  viewUpcomingEvents() {
    this.#sequenceLogger('1. Student -> EventsPage | Message: viewUpcomingEvents()');
    this.#sequenceLogger('2. EventsPage -> EventService | Message: getUpcomingEvents()');

    const events = this.#eventService.getUpcomingEvents();

    if (events.length === 0) {
      return this.displayEmptyState();
    }

    this.#sequenceLogger('6. EventsPage -> EventsPage | Message: displayEvents(events)');
    return this.displayEvents(events);
  }

  displayEvents(events) {
    const list = document.querySelector('#event-list');
    list.innerHTML = '';

    events.forEach((event) => {
      const item = document.createElement('li');
      item.className = 'event-item';
      item.innerHTML = `
        <h3>${event.title}</h3>
        <p>${event.dateTime.toLocaleString()}</p>
        <p>${event.location}</p>
        <p>${event.description}</p>
      `;
      list.appendChild(item);
    });

    return events;
  }

  displayEmptyState() {
    this.#sequenceLogger('EventsPage -> EventsPage | Message: displayEmptyState()');
    const list = document.querySelector('#event-list');
    list.innerHTML = '';

    const item = document.createElement('li');
    item.className = 'empty-state';
    item.textContent = 'No upcoming events available right now.';
    list.appendChild(item);

    return [];
  }
}

class EventService {
  // EventService: Logic
  // EventService 1..1 -> EventRepo 1..1
  #eventRepo;
  #sequenceLogger;

  constructor(eventRepo, sequenceLogger = () => {}) {
    this.#eventRepo = eventRepo;
    this.#sequenceLogger = sequenceLogger;
  }

  getUpcomingEvents() {
    this.#sequenceLogger('3. EventService -> EventRepo | Message: findUpcomingEvents()');
    const events = this.#eventRepo.findUpcomingEvents();
    this.#sequenceLogger('5. EventService -> EventsPage | Message: events: Event[]');
    return events;
  }
}

class EventRepo {
  // EventRepo: Storage
  #events;
  #sequenceLogger;

  constructor(initialEvents = [], sequenceLogger = () => {}) {
    this.#events = [...initialEvents];
    this.#sequenceLogger = sequenceLogger;
  }

  findUpcomingEvents() {
    const now = new Date();
    const upcoming = this.#events.filter((event) => new Date(event.dateTime) >= now);
    this.#sequenceLogger('4. EventRepo -> EventService | Message: events: Event[]');
    return upcoming;
  }
}

class EventRepository extends EventRepo {}

function renderSequence(messages) {
  const list = document.querySelector('#sequence-log');
  list.innerHTML = '';

  messages.forEach((message) => {
    const item = document.createElement('li');
    item.textContent = message;
    list.appendChild(item);
  });
}

function buildSampleEvents() {
  const techTag = new EventTag(1, 'Technology', 'Academic');
  const leadershipTag = new EventTag(2, 'Leadership', 'Campus');

  return [
    new Event(
      1,
      'AI & Data Meetup',
      'Networking and research discussion for students interested in AI.',
      new Date('2026-11-20T18:00:00'),
      'Innovation Hall 204',
      [techTag]
    ),
    new Event(
      2,
      'Leadership Roundtable',
      'Student leaders share ideas about community organizing and club growth.',
      new Date('2026-11-24T17:30:00'),
      'Student Union 110',
      [leadershipTag]
    )
  ];
}

function initializeApp() {
  const sequenceMessages = [];
  const logStep = (message) => {
    sequenceMessages.push(message);
    renderSequence(sequenceMessages);
  };

  const eventRepo = new EventRepo(buildSampleEvents(), logStep);
  const eventService = new EventService(eventRepo, logStep);
  const eventsPage = new EventsPage(eventService, logStep);
  const student = new Student(1, 'Ava Martinez', 'ava@orgsync.edu', 'hash', new Date('2025-08-15'), 'S-1001', 'Computer Science', eventsPage);

  const showUpcoming = () => {
    sequenceMessages.length = 0;
    student.viewUpcomingEvents();
  };

  const showEmpty = () => {
    sequenceMessages.length = 0;
    const emptyRepo = new EventRepo([], logStep);
    const emptyService = new EventService(emptyRepo, logStep);
    const page = new EventsPage(emptyService, logStep);
    page.viewUpcomingEvents();
  };

  document.querySelector('#view-events-button').addEventListener('click', showUpcoming);
  document.querySelector('#empty-events-button').addEventListener('click', showEmpty);

  showUpcoming();
}

document.addEventListener('DOMContentLoaded', initializeApp);

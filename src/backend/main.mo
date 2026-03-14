import Map "mo:core/Map";
import Array "mo:core/Array";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  module Email {
    public func compare(a : Email, b : Email) : Order.Order {
      Text.compare(a.id, b.id);
    };
  };

  module CalendarEvent {
    public func compare(a : CalendarEvent, b : CalendarEvent) : Order.Order {
      Text.compare(a.id, b.id);
    };
  };

  module Task {
    public func compare(a : Task, b : Task) : Order.Order {
      Text.compare(a.id, b.id);
    };
  };

  type Email = {
    id : Text;
    senderName : Text;
    senderEmail : Text;
    subject : Text;
    body : Text;
    timestamp : Int;
    category : Text;
    isRead : Bool;
    isStarred : Bool;
  };

  type CalendarEvent = {
    id : Text;
    title : Text;
    description : Text;
    startTime : Int;
    endTime : Int;
    location : Text;
  };

  type Task = {
    id : Text;
    title : Text;
    dueDate : Int;
    priority : Text;
    isCompleted : Bool;
  };

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let userEmails = Map.empty<Principal, [Email]>();
  let userEvents = Map.empty<Principal, [CalendarEvent]>();
  let userTasks = Map.empty<Principal, [Task]>();
  let demoSeededUsers = Set.empty<Principal>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getEmails() : async [Email] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get emails");
    };
    getEmailsForCaller(caller);
  };

  func getEmailsForCaller(caller : Principal) : [Email] {
    switch (userEmails.get(caller)) {
      case (null) { [] };
      case (?emails) { emails };
    };
  };

  public query ({ caller }) func getEmailById(id : Text) : async ?Email {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get emails");
    };
    switch (userEmails.get(caller)) {
      case (null) { null };
      case (?emails) {
        emails.find(func(email) { email.id == id });
      };
    };
  };

  public shared ({ caller }) func markEmailRead(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update emails");
    };
    switch (userEmails.get(caller)) {
      case (null) { Runtime.trap("No emails found") };
      case (?emails) {
        let updatedEmails = emails.map(
          func(email) {
            if (email.id == id) { { email with isRead = true } } else {
              email;
            };
          }
        );
        userEmails.add(caller, updatedEmails);
      };
    };
  };

  public shared ({ caller }) func toggleStarEmail(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update emails");
    };
    switch (userEmails.get(caller)) {
      case (null) { Runtime.trap("No emails found") };
      case (?emails) {
        let updatedEmails = emails.map(
          func(email) {
            if (email.id == id) { { email with isStarred = not email.isStarred } } else {
              email;
            };
          }
        );
        userEmails.add(caller, updatedEmails);
      };
    };
  };

  public query ({ caller }) func getEvents() : async [CalendarEvent] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get events");
    };
    switch (userEvents.get(caller)) {
      case (null) { [] };
      case (?events) { events };
    };
  };

  public shared ({ caller }) func createEvent(title : Text, description : Text, startTime : Int, endTime : Int, location : Text) : async CalendarEvent {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create events");
    };
    let event : CalendarEvent = {
      id = title.concat(Time.now().toText());
      title;
      description;
      startTime;
      endTime;
      location;
    };
    let events = getOrCreateUserStore(userEvents, caller);
    let updatedEvents = events.concat([event]);
    userEvents.add(caller, updatedEvents);
    event;
  };

  public shared ({ caller }) func deleteEvent(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete events");
    };
    switch (userEvents.get(caller)) {
      case (null) { Runtime.trap("No events found") };
      case (?events) {
        let filteredEvents = events.filter(func(event) { event.id != id });
        userEvents.add(caller, filteredEvents);
      };
    };
  };

  public query ({ caller }) func getTasks() : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get tasks");
    };
    switch (userTasks.get(caller)) {
      case (null) { [] };
      case (?tasks) { tasks };
    };
  };

  public shared ({ caller }) func createTask(title : Text, dueDate : Int, priority : Text) : async Task {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create tasks");
    };
    let task : Task = {
      id = title.concat(Time.now().toText());
      title;
      dueDate;
      priority;
      isCompleted = false;
    };
    let tasks = getOrCreateUserStore(userTasks, caller);
    let updatedTasks = tasks.concat([task]);
    userTasks.add(caller, updatedTasks);
    task;
  };

  public shared ({ caller }) func toggleTask(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update tasks");
    };
    switch (userTasks.get(caller)) {
      case (null) { Runtime.trap("No tasks found") };
      case (?tasks) {
        let updatedTasks = tasks.map(
          func(task) {
            if (task.id == id) { { task with isCompleted = not task.isCompleted } } else {
              task;
            };
          }
        );
        userTasks.add(caller, updatedTasks);
      };
    };
  };

  public shared ({ caller }) func deleteTask(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete tasks");
    };
    switch (userTasks.get(caller)) {
      case (null) { Runtime.trap("No tasks found") };
      case (?tasks) {
        let filteredTasks = tasks.filter(func(task) { task.id != id });
        userTasks.add(caller, filteredTasks);
      };
    };
  };

  public shared ({ caller }) func summarizeEmail(id : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can summarize emails");
    };
    // Verify the email belongs to the caller
    switch (userEmails.get(caller)) {
      case (null) { Runtime.trap("No emails found") };
      case (?emails) {
        switch (emails.find(func(email) { email.id == id })) {
          case (null) { Runtime.trap("Email not found") };
          case (_email) {
            // Email exists and belongs to caller
          };
        };
      };
    };
    "This is a simulated summary of the email. Actual AI integration would generate a real summary.";
  };

  public shared ({ caller }) func rewriteBody(body : Text, tone : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can rewrite text");
    };
    "Rewritten to " # tone # " tone: " # body;
  };

  func getOrCreateUserStore<T>(store : Map.Map<Principal, [T]>, principal : Principal) : [T] {
    switch (store.get(principal)) {
      case (null) {
        let emptyArray : [T] = [];
        store.add(principal, emptyArray);
        emptyArray;
      };
      case (?existingArray) { existingArray };
    };
  };

  public shared ({ caller }) func initDemoData() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can initialize demo data");
    };
    if (demoSeededUsers.contains(caller)) { return };

    let emails : [Email] = [
      {
        id = "email1";
        senderName = "Alice";
        senderEmail = "alice@example.com";
        subject = "Welcome!";
        body = "Welcome to our platform.";
        timestamp = Time.now() - 1_000_000_000_000;
        category = "General";
        isRead = false;
        isStarred = false;
      },
      {
        id = "email2";
        senderName = "Bob";
        senderEmail = "bob@example.com";
        subject = "Meeting Invitation";
        body = "Please join our meeting.";
        timestamp = Time.now() - 500_000_000_000;
        category = "Work";
        isRead = false;
        isStarred = false;
      },
    ];
    userEmails.add(caller, emails);

    let events : [CalendarEvent] = [
      {
        id = "event1";
        title = "Project Kickoff";
        description = "Initial project meeting.";
        startTime = Time.now() + 1_000_000_000_000;
        endTime = Time.now() + 1_000_100_000_000;
        location = "Conference Room 1";
      },
    ];
    userEvents.add(caller, events);

    let tasks : [Task] = [
      {
        id = "task1";
        title = "Task 1";
        dueDate = Time.now() + 2_000_000_000_000;
        priority = "High";
        isCompleted = false;
      },
    ];
    userTasks.add(caller, tasks);

    demoSeededUsers.add(caller);
  };
};

// ================= SECTION TOGGLER =================

function showSection(sectionId) {
  document.querySelectorAll('.page-section').forEach(section => {
    section.style.display = 'none';
  });

  document.getElementById(sectionId).style.display = 'block';
}


// ================= LOGOUT =================

function logout() {

  localStorage.removeItem('currentUser');

  showSection('login-section');

}


// ================= REGISTRATION =================

document.getElementById('register-form').addEventListener('submit', function (e) {

  e.preventDefault();

  const user = {
    name: document.getElementById('register-name').value,
    email: document.getElementById('register-email').value,
    password: document.getElementById('register-password').value,
    role: document.getElementById('register-role').value
  };

  const users = JSON.parse(localStorage.getItem('autoform-users')) || [];

  // prevent duplicate users
  const exists = users.find(u => u.email === user.email);

  if (exists) {
    alert('User already exists!');
    return;
  }

  users.push(user);

  localStorage.setItem('autoform-users', JSON.stringify(users));

  alert('Registered successfully! Please log in.');

  showSection('login-section');

});


// ================= LOGIN =================

document.getElementById('login-form').addEventListener('submit', function (e) {

  e.preventDefault();

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  const users = JSON.parse(localStorage.getItem('autoform-users')) || [];

  const storedUser = users.find(
    user => user.email === email && user.password === password
  );

  if (storedUser) {

    localStorage.setItem('currentUser', JSON.stringify(storedUser));

    alert(`Welcome, ${storedUser.name}!`);

    // employee dashboard
    if (storedUser.role === 'employee') {

      showSection('dashboard-section');

    }

    // manager dashboard
    else if (storedUser.role === 'manager') {

      showSection('manager-dashboard-section');

      loadManagerRequests();

    }

    // HR dashboard
    else if (storedUser.role === 'hr') {

      showSection('hr-dashboard-section');

      loadHRRequests();

    }

  } else {

    alert('Invalid credentials. Please try again.');

  }

});


// ================= REQUEST FORM =================

document.getElementById('request-type-form').addEventListener('submit', function (e) {

  e.preventDefault();

  const requestType = document.getElementById('request-type').value;

  if (!requestType) {
    alert('Please select a request type.');
    return;
  }

  const form = document.getElementById('fill-form');

  form.innerHTML = '';

  let title = '';

  let additionalFields = '';

  // ===== LEAVE =====
  if (requestType === 'leave') {

    title = 'Leave Application';

    additionalFields = `
      <label for="leave-dates">Leave Dates</label>
      <input type="text" id="leave-dates" placeholder="e.g. Oct 1 - Oct 5" required>

      <label for="leave-reason">Reason</label>
      <textarea id="leave-reason" rows="4" placeholder="Reason for leave..." required></textarea>
    `;

  }

  // ===== PERMISSION =====
  else if (requestType === 'permission') {

    title = 'Permission Request';

    additionalFields = `
      <label for="permission-date">Date</label>
      <input type="date" id="permission-date" required>

      <label for="permission-reason">Reason</label>
      <textarea id="permission-reason" rows="4" placeholder="Reason for permission..." required></textarea>
    `;

  }

  // ===== IT SUPPORT =====
  else if (requestType === 'it') {

    title = 'IT Support Request';

    additionalFields = `
      <label for="it-issue">Issue</label>
      <input type="text" id="it-issue" placeholder="Describe the problem" required>

      <label for="it-priority">Priority</label>

      <select id="it-priority">

        <option>Low</option>
        <option>Medium</option>
        <option>High</option>

      </select>
    `;

  }

  document.getElementById('form-title').innerText = title;

  form.innerHTML = `

    <label for="full-name">Full Name</label>
    <input type="text" id="full-name" placeholder="Your Name" required>

    <label for="department">Department</label>
    <input type="text" id="department" placeholder="Your Department" required>

    ${additionalFields}

    <button type="submit">Submit Request</button>

  `;

  // ===== SUBMIT REQUEST =====

  form.onsubmit = function (event) {

    event.preventDefault();

    const statusList = JSON.parse(localStorage.getItem('autoform-status')) || [];

    statusList.push({

      employee: document.getElementById('full-name').value,

      type: title,

      status: 'Pending Manager Approval',

      date: new Date().toLocaleDateString()

    });

    localStorage.setItem('autoform-status', JSON.stringify(statusList));

    alert(`${title} submitted successfully!`);

    showSection('status-section');

    loadStatusList();

  };

  showSection('fill-form-section');

});


// ================= STATUS LIST =================

function loadStatusList() {

  const list = document.getElementById('status-list');

  list.innerHTML = '';

  const items = JSON.parse(localStorage.getItem('autoform-status')) || [];

  if (items.length === 0) {

    list.innerHTML = '<li>No requests submitted yet.</li>';

    return;

  }

  items.forEach(item => {

    const li = document.createElement('li');

    li.textContent =
      `${item.type} — ${item.status} (${item.date})`;

    list.appendChild(li);

  });

}


// ================= FEEDBACK =================

document.getElementById('feedback-form').addEventListener('submit', function (e) {

  e.preventDefault();

  alert('Thank you for your feedback!');

  document.getElementById('feedback-text').value = '';

  showSection('dashboard-section');

});


// ================= MANAGER REQUESTS =================

function loadManagerRequests() {

  const requests = JSON.parse(localStorage.getItem('autoform-status')) || [];

  const list = document.getElementById('manager-request-list');

  list.innerHTML = '';

  const pendingRequests = requests.filter(
    req => req.status === 'Pending Manager Approval'
  );

  if (pendingRequests.length === 0) {

    list.innerHTML = '<li>No pending requests.</li>';

    return;

  }

  pendingRequests.forEach((req) => {

    const originalIndex = requests.indexOf(req);

    const li = document.createElement('li');

    li.innerHTML = `

      <strong>${req.employee}</strong><br>

      ${req.type}<br>

      Status: ${req.status}<br><br>

      <button onclick="approveByManager(${originalIndex})">
        Approve
      </button>

      <button onclick="rejectRequest(${originalIndex})">
        Reject
      </button>

    `;

    list.appendChild(li);

  });

}


// ================= MANAGER APPROVE =================

function approveByManager(index) {

  const requests = JSON.parse(localStorage.getItem('autoform-status')) || [];

  requests[index].status = 'Pending HR Approval';

  localStorage.setItem('autoform-status', JSON.stringify(requests));

  alert('Request approved by Manager.');

  loadManagerRequests();

}


// ================= HR REQUESTS =================

function loadHRRequests() {

  const requests = JSON.parse(localStorage.getItem('autoform-status')) || [];

  const list = document.getElementById('hr-request-list');

  list.innerHTML = '';

  const hrRequests = requests.filter(
    req => req.status === 'Pending HR Approval'
  );

  if (hrRequests.length === 0) {

    list.innerHTML = '<li>No requests pending HR approval.</li>';

    return;

  }

  hrRequests.forEach((req) => {

    const originalIndex = requests.indexOf(req);

    const li = document.createElement('li');

    li.innerHTML = `

      <strong>${req.employee}</strong><br>

      ${req.type}<br>

      Status: ${req.status}<br><br>

      <button onclick="approveByHR(${originalIndex})">
        Final Approve
      </button>

      <button onclick="rejectRequest(${originalIndex})">
        Reject
      </button>

    `;

    list.appendChild(li);

  });

}


// ================= HR APPROVE =================

function approveByHR(index) {

  const requests = JSON.parse(localStorage.getItem('autoform-status')) || [];

  requests[index].status = 'Approved';

  localStorage.setItem('autoform-status', JSON.stringify(requests));

  alert('Request finally approved by HR.');

  loadHRRequests();

}


// ================= REJECT REQUEST =================

function rejectRequest(index) {

  const requests = JSON.parse(localStorage.getItem('autoform-status')) || [];

  requests[index].status = 'Rejected';

  localStorage.setItem('autoform-status', JSON.stringify(requests));

  alert('Request rejected.');

  loadManagerRequests();

  loadHRRequests();

}


// ================= PAGE LOAD =================

window.onload = function () {

  const user = JSON.parse(localStorage.getItem('currentUser'));

  if (user) {

    if (user.role === 'employee') {

      showSection('dashboard-section');

    }

    else if (user.role === 'manager') {

      showSection('manager-dashboard-section');

      loadManagerRequests();

    }

    else if (user.role === 'hr') {

      showSection('hr-dashboard-section');

      loadHRRequests();

    }

  }

  else {

    showSection('login-section');

  }

  loadStatusList();

};
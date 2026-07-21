// بيانات المستخدم الأولية فارغة
let currentUser = {
  name: '',
  faculty: '',
  email: '',
  phone: '',
  avatar: '?'
};

let lostItems = [];
let foundItems = [];
let notifications = [];

let pendingDeleteId = null;
let currentTab = 'lost';

// توليد id بسيط
function generateId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

// ============ تحديث الواجهة ============
function updateStats() {
  const lostCount = lostItems.length;
  const foundCount = foundItems.length;
  const returnedCount = lostItems.filter(i => i.status === 'delivered').length + foundItems.filter(i => i.status === 'delivered').length;
  const trustPoints = returnedCount * 50 + 10;
  document.getElementById('statsContainer').innerHTML = `
    <div class="stat-box">
      <div class="icon"><i class="fa-solid fa-circle-question"></i></div>
      <div class="number">${lostCount}</div>
      <div class="label">مفقودات</div>
    </div>
    <div class="stat-box">
      <div class="icon"><i class="fa-solid fa-box"></i></div>
      <div class="number">${foundCount}</div>
      <div class="label">موجودات</div>
    </div>
    <div class="stat-box">
      <div class="icon"><i class="fa-solid fa-check-circle"></i></div>
      <div class="number">${returnedCount}</div>
      <div class="label">مرتجعات</div>
    </div>
    <div class="stat-box">
      <div class="icon"><i class="fa-solid fa-star"></i></div>
      <div class="number">${trustPoints}</div>
      <div class="label">نقاط الثقة</div>
    </div>
  `;
}

function updateProfileDisplay() {
  document.getElementById('displayName').textContent = currentUser.name || 'غير محدد';
  document.getElementById('displayFaculty').textContent = currentUser.faculty || 'غير محدد';
  document.getElementById('displayEmail').textContent = currentUser.email || 'غير محدد';
  document.getElementById('displayPhone').textContent = currentUser.phone || 'غير محدد';
  document.getElementById('profileAvatar').textContent = currentUser.avatar || '?';
}

function renderItems(items, type) {
  const container = document.getElementById('tabContent');
  let html = '';
  html += `<div class="tab-header">
    <h3>${type === 'lost' ? 'مفقوداتي' : 'موجوداتي'}</h3>
    <button class="add-btn" onclick="openAddItem('${type}')"><i class="fa-solid fa-plus"></i> إضافة ${type === 'lost' ? 'مفقود' : 'موجود'}</button>
  </div>`;

  if (!items.length) {
    html += `<div class="empty-state"><i class="fa-solid fa-face-frown fa-2x"></i><p>لا توجد بلاغات حالياً</p></div>`;
    container.innerHTML = html;
    return;
  }

  html += items.map(item => {
    let statusText = '';
    let statusClass = '';
    if (item.status === 'open') { statusText = 'قيد البحث'; statusClass = 'open'; }
    else if (item.status === 'found') { statusText = 'تم العثور'; statusClass = 'found'; }
    else if (item.status === 'delivered') { statusText = 'تم التسليم'; statusClass = 'delivered'; }
    const icon = item.image ? `<img src="${item.image}" style="width:100%;height:100%;object-fit:cover;border-radius:10px;">` : `<i class="fa-solid fa-box"></i>`;
    return `
      <div class="item-card">
        <div class="item-img">${icon}</div>
        <div class="item-details">
          <h4>${item.title}</h4>
          <span class="date"><i class="fa-regular fa-calendar"></i> ${item.date}</span>
          <span class="status ${statusClass}">${statusText}</span>
        </div>
        <div class="item-actions">
          ${item.status === 'open' || item.status === 'found' ? `<button class="btn btn-outline" onclick="editItem(${item.id}, '${type}')">تعديل</button>` : ''}
          ${item.status === 'open' ? `<button class="btn btn-success" onclick="markDelivered(${item.id}, '${type}')">تسليم</button>` : ''}
          <button class="btn btn-danger" onclick="confirmDelete(${item.id}, '${type}')">حذف</button>
        </div>
      </div>
    `;
  }).join('');
  container.innerHTML = html;
}

function renderNotifications() {
  const container = document.getElementById('tabContent');
  let html = `<div class="tab-header"><h3>التنبيهات</h3></div>`;
  if (!notifications.length) {
    html += `<div class="empty-state"><i class="fa-solid fa-bell-slash fa-2x"></i><p>لا توجد تنبيهات</p></div>`;
  } else {
    html += notifications.map(n => `
      <div class="notification">
        <i class="fa-solid fa-circle-info"></i>
        <div>
          <p>${n.text}</p>
          <small>${n.date}</small>
        </div>
      </div>
    `).join('');
  }
  container.innerHTML = html;
}

function loadTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelector(`.tab[data-tab="${tab}"]`).classList.add('active');
  
  if (tab === 'lost') renderItems(lostItems, 'lost');
  else if (tab === 'found') renderItems(foundItems, 'found');
  else renderNotifications();
}

function switchTab(tab) {
  loadTab(tab);
}

// ============ الملف الشخصي ============
function openEditProfile() {
  document.getElementById('editName').value = currentUser.name || '';
  document.getElementById('editFaculty').value = currentUser.faculty || '';
  document.getElementById('editEmail').value = currentUser.email || '';
  document.getElementById('editPhone').value = currentUser.phone || '';
  document.getElementById('editProfileModal').classList.add('active');
}
function closeEditProfile() {
  document.getElementById('editProfileModal').classList.remove('active');
}
function saveProfile() {
  currentUser.name = document.getElementById('editName').value.trim();
  currentUser.faculty = document.getElementById('editFaculty').value.trim();
  currentUser.email = document.getElementById('editEmail').value.trim();
  currentUser.phone = document.getElementById('editPhone').value.trim();
  currentUser.avatar = currentUser.name ? currentUser.name.charAt(0) : '?';
  updateProfileDisplay();
  closeEditProfile();
}

// ============ إضافة بلاغ ============
function openAddItem(type) {
  document.getElementById('addItemType').value = type;
  document.getElementById('addItemTitle').textContent = type === 'lost' ? 'إضافة مفقود' : 'إضافة موجود';
  document.getElementById('addItemName').value = '';
  document.getElementById('addItemDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('addItemModal').classList.add('active');
}
function closeAddItem() {
  document.getElementById('addItemModal').classList.remove('active');
}
function addItem() {
  const type = document.getElementById('addItemType').value;
  const title = document.getElementById('addItemName').value.trim();
  const date = document.getElementById('addItemDate').value;
  if (!title) { alert('يرجى إدخال اسم الغرض'); return; }
  const newItem = {
    id: generateId(),
    title: title,
    date: date || new Date().toISOString().split('T')[0],
    status: 'open',
    image: ''
  };
  if (type === 'lost') {
    lostItems.push(newItem);
    notifications.unshift({ id: generateId(), text: `تمت إضافة "${newItem.title}" إلى مفقوداتك.`, date: new Date().toISOString().split('T')[0] });
  } else {
    foundItems.push(newItem);
    notifications.unshift({ id: generateId(), text: `تمت إضافة "${newItem.title}" إلى موجوداتك.`, date: new Date().toISOString().split('T')[0] });
  }
  loadTab(currentTab);
  updateStats();
  closeAddItem();
}

// ============ تعديل وحذف البلاغات ============
function editItem(id, type) {
  const newTitle = prompt('أدخل الاسم الجديد للغرض:');
  if (newTitle) {
    if (type === 'lost') {
      const item = lostItems.find(i => i.id === id);
      if (item) item.title = newTitle;
    } else {
      const item = foundItems.find(i => i.id === id);
      if (item) item.title = newTitle;
    }
    loadTab(currentTab);
  }
}

function markDelivered(id, type) {
  if (type === 'lost') {
    const item = lostItems.find(i => i.id === id);
    if (item) item.status = 'delivered';
  } else {
    const item = foundItems.find(i => i.id === id);
    if (item) item.status = 'delivered';
  }
  loadTab(currentTab);
  updateStats();
  notifications.unshift({ id: generateId(), text: `تم تسليم الغرض بنجاح.`, date: new Date().toISOString().split('T')[0] });
}

function confirmDelete(id, type) {
  pendingDeleteId = { id, type };
  document.getElementById('deleteModal').classList.add('active');
}
function closeDeleteModal() {
  document.getElementById('deleteModal').classList.remove('active');
  pendingDeleteId = null;
}
document.getElementById('confirmDeleteBtn').addEventListener('click', function() {
  if (!pendingDeleteId) return;
  const { id, type } = pendingDeleteId;
  if (type === 'lost') {
    lostItems = lostItems.filter(i => i.id !== id);
  } else {
    foundItems = foundItems.filter(i => i.id !== id);
  }
  loadTab(currentTab);
  updateStats();
  closeDeleteModal();
});

window.addEventListener('click', (e) => {
  if (e.target === document.getElementById('deleteModal')) closeDeleteModal();
  if (e.target === document.getElementById('editProfileModal')) closeEditProfile();
  if (e.target === document.getElementById('addItemModal')) closeAddItem();
});

// تهيئة
updateProfileDisplay();
updateStats();
loadTab('lost');
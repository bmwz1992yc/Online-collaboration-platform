// Cloudflare Workers Task Management System
// Main entry point for the application

const indexHtmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Workers TaskFlow</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <h1>Workers TaskFlow</h1>
        <div id="user-info"></div>
    </header>

    <main>
        <section id="tasks-section">
            <h2>任务管理</h2>
            <div id="task-form-container">
                <form id="task-form">
                    <input type="hidden" id="task-id">
                    <div>
                        <label for="task-title">标题:</label>
                        <input type="text" id="task-title" required>
                    </div>
                    <div>
                        <label for="task-description">描述:</label>
                        <textarea id="task-description"></textarea>
                    </div>
                    <div>
                        <label for="task-status">状态:</label>
                        <select id="task-status">
                            <option value="To Do">待办</option>
                            <option value="In Progress">进行中</option>
                            <option value="Completed">已完成</option>
                        </select>
                    </div>
                    <div>
                        <label for="task-progress">进度:</label>
                        <input type="range" id="task-progress" min="0" max="100" value="0">
                        <span id="progress-value">0%</span>
                    </div>
                    <div>
                        <label for="task-due-date">截止日期:</label>
                        <input type="date" id="task-due-date">
                    </div>
                    <button type="submit">保存任务</button>
                    <button type="button" id="cancel-edit">取消</button>
                </form>
            </div>
            <div id="tasks-list"></div>
        </section>

        <section id="assets-section">
            <h2>资产管理</h2>
            <div id="asset-form-container">
                <form id="asset-form">
                    <input type="hidden" id="asset-id">
                    <div>
                        <label for="asset-name">物品名称:</label>
                        <input type="text" id="asset-name" required>
                    </div>
                    <div>
                        <label for="asset-owner">当前保管人:</label>
                        <select id="asset-owner"></select>
                    </div>
                    <div>
                        <label for="asset-image">物品图片:</label>
                        <input type="file" id="asset-image" accept="image/*">
                        <input type="hidden" id="asset-image-key">
                    </div>
                    <button type="submit">登记物品</button>
                    <button type="button" id="cancel-asset-edit">取消</button>
                </form>
            </div>
            <div id="assets-list"></div>
        </section>

        <section id="users-section" class="admin-only">
            <h2>用户管理</h2>
            <div id="user-form-container">
                <form id="user-form">
                    <div>
                        <label for="user-username">用户名:</label>
                        <input type="text" id="user-username" required>
                    </div>
                    <div>
                        <label for="user-role">角色:</label>
                        <select id="user-role">
                            <option value="member">成员</option>
                            <option value="admin">管理员</option>
                        </select>
                    </div>
                    <button type="submit">添加用户</button>
                </form>
            </div>
            <div id="users-list"></div>
        </section>
    </main>

    <script src="script.js"></script>
</body>
</html>`;

const stylesCssContent = `/* Global Styles */
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #f4f4f4;
}

.container {
    width: 90%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

header {
    background-color: #2c3e50;
    color: white;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

header h1 {
    font-size: 1.8rem;
}

#user-info {
    font-size: 1rem;
}

main {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
    margin: 20px 0;
}

section {
    background-color: white;
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

section h2 {
    margin-bottom: 15px;
    color: #2c3e50;
    border-bottom: 2px solid #3498db;
    padding-bottom: 5px;
}

/* Form Styles */
form {
    background-color: #ecf0f1;
    padding: 15px;
    border-radius: 5px;
    margin-bottom: 20px;
}

form div {
    margin-bottom: 15px;
}

label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
}

input, select, textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}

input[type="range"] {
    width: 80%;
}

button {
    background-color: #3498db;
    color: white;
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    margin-right: 10px;
}

button:hover {
    background-color: #2980b9;
}

button[type="button"] {
    background-color: #95a5a6;
}

button[type="button"]:hover {
    background-color: #7f8c8d;
}

#progress-value {
    display: inline-block;
    width: 20%;
    text-align: center;
    font-weight: bold;
}

/* List Styles */
.task-item, .asset-item, .user-item {
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 5px;
    padding: 15px;
    margin-bottom: 10px;
}

.task-item h3, .asset-item h3, .user-item h3 {
    margin-bottom: 10px;
    color: #2c3e50;
}

.task-item p, .asset-item p, .user-item p {
    margin-bottom: 8px;
}

.task-actions, .asset-actions, .user-actions {
    margin-top: 10px;
}

.task-actions button, .asset-actions button, .user-actions button {
    padding: 5px 10px;
    font-size: 12px;
    margin-right: 5px;
}

.delete-btn {
    background-color: #e74c3c;
}

.delete-btn:hover {
    background-color: #c0392b;
}

.edit-btn {
    background-color: #f39c12;
}

.edit-btn:hover {
    background-color: #d35400;
}

.transfer-btn {
    background-color: #9b59b6;
}

.transfer-btn:hover {
    background-color: #8e44ad;
}

/* Progress Bar */
.progress-container {
    width: 100%;
    background-color: #ecf0f1;
    border-radius: 5px;
    margin: 10px 0;
}

.progress-bar {
    height: 20px;
    background-color: #3498db;
    border-radius: 5px;
    text-align: center;
    line-height: 20px;
    color: white;
    font-size: 12px;
}

/* Asset Image */
.asset-image {
    max-width: 200px;
    max-height: 200px;
    margin: 10px 0;
    border: 1px solid #ddd;
    border-radius: 5px;
}

/* Admin Only Section */
.admin-only {
    display: none;
}

.admin-only.visible {
    display: block;
}

/* Responsive Design */
@media (min-width: 768px) {
    main {
        grid-template-columns: 1fr 1fr;
    }
    
    #users-section {
        grid-column: span 2;
    }
}
`;

const scriptJsContent = `// Client-side JavaScript for Workers TaskFlow
// Handle API interactions and UI updates

// Global variables
let currentUser = null;
let users = [];

// DOM Elements
const taskForm = document.getElementById('task-form');
const assetForm = document.getElementById('asset-form');
const userForm = document.getElementById('user-form');
const tasksList = document.getElementById('tasks-list');
const assetsList = document.getElementById('assets-list');
const usersList = document.getElementById('users-list');
const userInfo = document.getElementById('user-info');
const usersSection = document.getElementById('users-section');

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    // Extract token from URL
    const pathParts = window.location.pathname.split('/');
    const token = pathParts[2];
    // The role is no longer directly used in the fetch path, but derived from the path for initial auth check
    const initialRoleCheck = pathParts[1]; 
    
    if (!token) {
        alert('缺少访问令牌，请通过正确的URL访问系统');
        return;
    }
    
    // Authenticate user
    try {
        // Workers now return JSON for auth routes, not static files.
        // The frontend will make an API call to authenticate.
        const response = await fetch(\`/api/users/auth?token=\${token}&role=\${initialRoleCheck}\`);
        if (!response.ok) {
            throw new Error('认证失败');
        }
        
        const userData = await response.json();
        currentUser = userData;
        
        // Update UI with user info
        userInfo.textContent = \`欢迎, \${currentUser.username} (\${currentUser.role})\`;
        
        // Show admin section if user is admin
        if (currentUser.role === 'admin') {
            usersSection.classList.add('visible');
        }
        
        // Load initial data
        await loadTasks();
        await loadAssets();
        if (currentUser.role === 'admin') {
            await loadUsers();
        }
    } catch (error) {
        console.error('认证错误:', error);
        alert('认证失败: ' + error.message);
    }
    
    // Set up event listeners
    setupEventListeners();
});

// Set up event listeners
function setupEventListeners() {
    // Task form submission
    taskForm.addEventListener('submit', handleTaskSubmit);
    
    // Asset form submission
    assetForm.addEventListener('submit', handleAssetSubmit);
    
    // User form submission
    userForm.addEventListener('submit', handleUserSubmit);
    
    // Cancel buttons
    document.getElementById('cancel-edit').addEventListener('click', clearTaskForm);
    document.getElementById('cancel-asset-edit').addEventListener('click', clearAssetForm);
    
    // Progress slider
    document.getElementById('task-progress').addEventListener('input', function() {
        document.getElementById('progress-value').textContent = this.value + '%';
    });
}

// Task Management Functions
async function loadTasks() {
    try {
        const response = await fetch('/api/tasks');
        if (!response.ok) throw new Error('获取任务失败');
        
        const tasks = await response.json();
        renderTasks(tasks);
    } catch (error) {
        console.error('加载任务错误:', error);
        alert('加载任务失败: ' + error.message);
    }
}

function renderTasks(tasks) {
    tasksList.innerHTML = '';
    
    if (tasks.length === 0) {
        tasksList.innerHTML = '<p>暂无任务</p>';
        return;
    }
    
    tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        taskElement.innerHTML = \`
            <h3>\${task.title}</h3>
            <p><strong>描述:</strong> \${task.description || '无'}</p>
            <p><strong>状态:</strong> \${task.status}</p>
            <p><strong>进度:</strong></p>
            <div class="progress-container">
                <div class="progress-bar" style="width: \${task.progress}%">\${task.progress}%</div>
            </div>
            <p><strong>指派人:</strong> \${task.assignee_id}</p>
            <p><strong>创建人:</strong> \${task.creator_id}</p>
            <p><strong>截止日期:</strong> \${task.due_date || '未设置'}</p>
            <div class="task-actions">
                <button class="edit-btn" onclick="editTask('\${task.id}')">编辑</button>
                <button class="delete-btn" onclick="deleteTask('\${task.id}')">删除</button>
            </div>
        \`;
        tasksList.appendChild(taskElement);
    });
}

async function handleTaskSubmit(event) {
    event.preventDefault();
    
    const taskData = {
        id: document.getElementById('task-id').value || crypto.randomUUID(),
        title: document.getElementById('task-title').value,
        description: document.getElementById('task-description').value,
        status: document.getElementById('task-status').value,
        progress: parseInt(document.getElementById('task-progress').value),
        assignee_id: currentUser.username,
        creator_id: currentUser.username,
        due_date: document.getElementById('task-due-date').value
    };
    
    try {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        });
        
        if (!response.ok) throw new Error('保存任务失败');
        
        const savedTask = await response.json();
        console.log('任务已保存:', savedTask);
        
        // Clear form and reload tasks
        clearTaskForm();
        await loadTasks();
    } catch (error) {
        console.error('保存任务错误:', error);
        alert('保存任务失败: ' + error.message);
    }
}

function editTask(taskId) {
    // Find the task in the DOM and populate the form
    // In a real implementation, we would fetch the task details from the API
    alert('编辑功能将在后续实现');
}

async function deleteTask(taskId) {
    if (!confirm('确定要删除这个任务吗?')) return;
    
    try {
        const response = await fetch(\`/api/tasks/\${taskId}\`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('删除任务失败');
        
        await loadTasks();
    } catch (error) {
        console.error('删除任务错误:', error);
        alert('删除任务失败: ' + error.message);
    }
}

function clearTaskForm() {
    taskForm.reset();
    document.getElementById('task-id').value = '';
    document.getElementById('progress-value').textContent = '0%';
}

// Asset Management Functions
async function loadAssets() {
    try {
        const response = await fetch('/api/assets');
        if (!response.ok) throw new Error('获取资产失败');
        
        const assets = await response.json();
        renderAssets(assets);
        updateAssetOwnerDropdown(assets);
    } catch (error) {
        console.error('加载资产错误:', error);
        alert('加载资产失败: ' + error.message);
    }
}

function renderAssets(assets) {
    assetsList.innerHTML = '';
    
    if (assets.length === 0) {
        assetsList.innerHTML = '<p>暂无资产</p>';
        return;
    }
    
    assets.forEach(asset => {
        const assetElement = document.createElement('div');
        assetElement.className = 'asset-item';
        assetElement.innerHTML = \`
            <h3>\${asset.name}</h3>
            <p><strong>当前保管人:</strong> \${asset.current_owner_id}</p>
            \${asset.image_r2_key ? \`<img src="/api/files/\${asset.image_r2_key}" alt="\${asset.name}" class="asset-image">\` : ''}
            <p><strong>交接历史:</strong></p>
            <ul>
                \${(asset.transfer_history || []).map(transfer => 
                    \`<li>\${transfer.from_owner_id} → \${transfer.to_owner_id} (\${new Date(transfer.transfer_time).toLocaleString()})</li>\`
                ).join('')}
            </ul>
            <div class="asset-actions">
                <button class="transfer-btn" onclick="transferAsset('\${asset.id}')">交接</button>
            </div>
        \`;
        assetsList.appendChild(assetElement);
    });
}

function updateAssetOwnerDropdown(assets) {
    const ownerSelect = document.getElementById('asset-owner');
    ownerSelect.innerHTML = '';
    
    // Get unique owners from assets and users
    const owners = [...new Set([
        ...assets.map(a => a.current_owner_id),
        ...users.map(u => u.username)
    ])];
    
    owners.forEach(owner => {
        const option = document.createElement('option');
        option.value = owner;
        option.textContent = owner;
        ownerSelect.appendChild(option);
    });
}

async function handleAssetSubmit(event) {
    event.preventDefault();
    
    // Handle image upload if a file is selected
    let imageKey = document.getElementById('asset-image-key').value;
    const imageFile = document.getElementById('asset-image').files[0];
    
    if (imageFile) {
        try {
            // Get presigned URL for upload
            const presignResponse = await fetch(\`/api/files/presign-upload?filename=\${encodeURIComponent(imageFile.name)}\`);
            if (!presignResponse.ok) throw new Error('获取上传URL失败');
            
            const { uploadUrl, fileKey } = await presignResponse.json();
            imageKey = fileKey;
            
            // Upload file directly to R2
            const uploadResponse = await fetch(uploadUrl, {
                method: 'PUT',
                body: imageFile,
                headers: {
                    'Content-Type': imageFile.type
                }
            });
            
            if (!uploadResponse.ok) throw new Error('文件上传失败');
        } catch (error) {
            console.error('文件上传错误:', error);
            alert('文件上传失败: ' + error.message);
            return;
        }
    }
    
    const assetData = {
        id: document.getElementById('asset-id').value || crypto.randomUUID(),
        name: document.getElementById('asset-name').value,
        current_owner_id: document.getElementById('asset-owner').value,
        image_r2_key: imageKey,
        transfer_history: []
    };
    
    try {
        const response = await fetch('/api/assets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(assetData)
        });
        
        if (!response.ok) throw new Error('保存资产失败');
        
        const savedAsset = await response.json();
        console.log('资产已保存:', savedAsset);
        
        // Clear form and reload assets
        clearAssetForm();
        await loadAssets();
    } catch (error) {
        console.error('保存资产错误:', error);
        alert('保存资产失败: ' + error.message);
    }
}

async function transferAsset(assetId) {
    const newOwnerId = prompt('请输入新的保管人用户名:');
    if (!newOwnerId) return;

    try {
        const response = await fetch('/api/assets/transfer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ assetId, newOwnerId })
        });

        if (!response.ok) throw new Error('资产交接失败');

        const updatedAsset = await response.json();
        console.log('资产已交接:', updatedAsset);
        await loadAssets();
    } catch (error) {
        console.error('资产交接错误:', error);
        alert('资产交接失败: ' + error.message);
    }
}

function clearAssetForm() {
    assetForm.reset();
    document.getElementById('asset-id').value = '';
    document.getElementById('asset-image-key').value = '';
}

// User Management Functions
async function loadUsers() {
    try {
        const response = await fetch('/api/users');
        if (!response.ok) throw new Error('获取用户失败');
        
        users = await response.json();
        renderUsers(users);
        updateAssetOwnerDropdown([]); // Update dropdown with new users
    } catch (error) {
        console.error('加载用户错误:', error);
        alert('加载用户失败: ' + error.message);
    }
}

function renderUsers(users) {
    usersList.innerHTML = '';
    
    if (users.length === 0) {
        usersList.innerHTML = '<p>暂无用户</p>';
        return;
    }
    
    users.forEach(user => {
        const userElement = document.createElement('div');
        userElement.className = 'user-item';
        userElement.innerHTML = \`
            <h3>\${user.username}</h3>
            <p><strong>角色:</strong> \${user.role}</p>
            <p><strong>Token:</strong> \${user.token}</p>
        \`;
        usersList.appendChild(userElement);
    });
}

async function handleUserSubmit(event) {
    event.preventDefault();
    
    const userData = {
        username: document.getElementById('user-username').value,
        role: document.getElementById('user-role').value,
        token: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    };
    
    try {
        const response = await fetch('/api/users/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) throw new Error('添加用户失败');
        
        const savedUser = await response.json();
        console.log('用户已添加:', savedUser);
        
        // Clear form and reload users
        userForm.reset();
        await loadUsers();
    } catch (error) {
        console.error('添加用户错误:', error);
        alert('添加用户失败: ' + error.message);
    }
}
`;

async function ensureAdminUser(env) {
  const usersObject = await env.R2_BUCKET.get('config:share_links');
  let users = {};
  if (usersObject !== null) {
    users = JSON.parse(await usersObject.text());
  }

  let adminUser = Object.values(users).find(u => u.role === 'admin');

  if (!adminUser) {
    adminUser = {
      username: 'admin',
      role: 'admin',
      token: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    };
    users[adminUser.username] = adminUser;
    await env.R2_BUCKET.put('config:share_links', JSON.stringify(users));
    console.log('Default admin user created:', adminUser);
  }
  return adminUser;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Log all incoming requests for debugging
    console.log('Incoming request path:', path);

    // Serve static assets first
    if (path === '/styles.css') {
      console.log('Serving styles.css');
      return new Response(stylesCssContent, {
        headers: { 'Content-Type': 'text/css' }
      });
    }

    if (path === '/script.js') {
      console.log('Serving script.js');
      return new Response(scriptJsContent, {
        headers: { 'Content-Type': 'application/javascript' }
      });
    }

    // Serve index.html for the root path and authenticated paths
    if (path === '/' || path.startsWith('/admin/') || path.startsWith('/member/')) {
      // Ensure admin user exists on every request (can be optimized for production)
      const adminUser = await ensureAdminUser(env);
      
      if (path === '/') {
        // If accessing root, redirect to admin page with token
        const adminUrl = new URL(request.url);
        adminUrl.pathname = `/admin/${adminUser.token}`;
        console.log('Redirecting root to admin path:', adminUrl.toString());
        return Response.redirect(adminUrl.toString(), 302);
      }
      
      console.log('Serving indexHtmlContent for path:', path);
      return new Response(indexHtmlContent, {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // Route handling for API
    if (path.startsWith('/api/')) {
      if (request.method === 'GET') {
        return handleApiGetRequest(path, request, env);
      } else if (request.method === 'POST') {
        return handleApiPostRequest(path, request, env);
      } else if (request.method === 'DELETE') {
        if (path.startsWith('/api/tasks/')) {
          return handleApiDeleteRequest(path, request, env);
        }
      }
    }
    
    console.log('Path not found:', path);
    return new Response('Not Found', { status: 404 });
  }
};

// Handle API GET requests
async function handleApiGetRequest(path, request, env) {
  if (path === '/api/tasks') {
    return getAllTasks(env);
  } else if (path === '/api/assets') {
    return getAllAssets(env);
  } else if (path === '/api/users') {
    return getAllUsers(env);
  } else if (path === '/api/users/auth') {
    return authenticateUser(request, env);
  } else if (path === '/api/files/presign-upload') {
    return presignUploadUrl(request, env);
  } else if (path.startsWith('/api/files/')) {
    const key = path.substring(11); // Remove '/api/files/'
    return serveFileFromR2(key, env);
  }
  
  return new Response('Not Found', { status: 404 });
}

// Handle API POST requests
async function handleApiPostRequest(path, request, env) {
  if (path === '/api/tasks') {
    return createOrUpdateTask(request, env);
  } else if (path === '/api/assets') {
    return registerAsset(request, env);
  } else if (path === '/api/assets/transfer') {
    return transferAsset(request, env);
  } else if (path === '/api/users/add') {
    return addUser(request, env);
  }
  
  return new Response('Not Found', { status: 404 });
}

// Handle API DELETE requests
async function handleApiDeleteRequest(path, request, env) {
  const taskId = path.split('/')[3];
  if (taskId) {
    return deleteTask(taskId, env);
  }
  
  return new Response('Bad Request', { status: 400 });
}

// API Implementation Functions
async function getAllTasks(env) {
  try {
    const tasksObject = await env.R2_BUCKET.get('data:tasks');
    let tasks = [];
    
    if (tasksObject !== null) {
      const tasksData = await tasksObject.text();
      tasks = JSON.parse(tasksData);
    }
    
    return new Response(JSON.stringify(tasks), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response('Error fetching tasks: ' + error.message, { status: 500 });
  }
}

async function getAllAssets(env) {
  try {
    const assetsObject = await env.R2_BUCKET.get('data:assets');
    let assets = [];
    
    if (assetsObject !== null) {
      const assetsData = await assetsObject.text();
      assets = JSON.parse(assetsData);
    }
    
    return new Response(JSON.stringify(assets), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response('Error fetching assets: ' + error.message, { status: 500 });
  }
}

async function getAllUsers(env) {
  try {
    const usersObject = await env.R2_BUCKET.get('config:share_links');
    let users = {};
    
    if (usersObject !== null) {
      const usersData = await usersObject.text();
      users = JSON.parse(usersData);
    }
    
    // Return array of users instead of object
    const usersArray = Object.values(users);
    
    return new Response(JSON.stringify(usersArray), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response('Error fetching users: ' + error.message, { status: 500 });
  }
}

async function authenticateUser(request, env) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    const role = url.searchParams.get('role');
    
    if (!token) {
      return new Response('Missing token parameter', { status: 400 });
    }
    
    // Get user data from R2
    const userConfig = await env.R2_BUCKET.get('config:share_links');
    let users = {};
    
    if (userConfig !== null) {
      const userData = await userConfig.text();
      users = JSON.parse(userData);
    }
    
    // Find user by token
    const user = Object.values(users).find(u => u.token === token);
    
    if (!user || user.role !== (role === 'admin' ? 'admin' : 'member')) {
      return new Response('Authentication failed', { status: 401 });
    }
    
    return new Response(JSON.stringify(user), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response('Error authenticating user: ' + error.message, { status: 500 });
  }
}

async function createOrUpdateTask(request, env) {
  try {
    const taskData = await request.json();
    
    // Read existing tasks
    const tasksObject = await env.R2_BUCKET.get('data:tasks');
    let tasks = [];
    
    if (tasksObject !== null) {
      const tasksData = await tasksObject.text();
      tasks = JSON.parse(tasksData);
    }
    
    // Check if task already exists (update) or is new (create)
    const existingIndex = tasks.findIndex(t => t.id === taskData.id);
    
    if (existingIndex >= 0) {
      // Update existing task
      tasks[existingIndex] = { ...tasks[existingIndex], ...taskData };
    } else {
      // Create new task
      tasks.push(taskData);
    }
    
    // Write back to R2
    await env.R2_BUCKET.put('data:tasks', JSON.stringify(tasks));
    
    return new Response(JSON.stringify(taskData), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response('Error creating/updating task: ' + error.message, { status: 500 });
  }
}

async function deleteTask(taskId, env) {
  try {
    // Read existing tasks
    const tasksObject = await env.R2_BUCKET.get('data:tasks');
    let tasks = [];
    
    if (tasksObject !== null) {
      const tasksData = await tasksObject.text();
      tasks = JSON.parse(tasksData);
    }
    
    // Filter out the task to delete
    tasks = tasks.filter(t => t.id !== taskId);
    
    // Write back to R2
    await env.R2_BUCKET.put('data:tasks', JSON.stringify(tasks));
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response('Error deleting task: ' + error.message, { status: 500 });
  }
}

async function registerAsset(request, env) {
  try {
    const assetData = await request.json();
    
    // Read existing assets
    const assetsObject = await env.R2_BUCKET.get('data:assets');
    let assets = [];
    
    if (assetsObject !== null) {
      const assetsData = await assetsObject.text();
      assets = JSON.parse(assetsData);
    }
    
    // Add new asset
    assets.push(assetData);
    
    // Write back to R2
    await env.R2_BUCKET.put('data:assets', JSON.stringify(assets));
    
    return new Response(JSON.stringify(assetData), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response('Error registering asset: ' + error.message, { status: 500 });
  }
}

async function transferAsset(request, env) {
  try {
    const { assetId, newOwnerId } = await request.json();
    
    // Read existing assets
    const assetsObject = await env.R2_BUCKET.get('data:assets');
    let assets = [];
    
    if (assetsObject !== null) {
      const assetsData = await assetsObject.text();
      assets = JSON.parse(assetsData);
    }
    
    // Find the asset to transfer
    const assetIndex = assets.findIndex(a => a.id === assetId);
    
    if (assetIndex < 0) {
      return new Response('Asset not found', { status: 404 });
    }
    
    // Record the transfer
    const transferRecord = {
      from_owner_id: assets[assetIndex].current_owner_id,
      to_owner_id: newOwnerId,
      transfer_time: new Date().toISOString()
    };
    
    // Update asset
    assets[assetIndex].current_owner_id = newOwnerId;
    assets[assetIndex].transfer_history = [
      ...(assets[assetIndex].transfer_history || []),
      transferRecord
    ];
    
    // Write back to R2
    await env.R2_BUCKET.put('data:assets', JSON.stringify(assets));
    
    return new Response(JSON.stringify(assets[assetIndex]), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response('Error transferring asset: ' + error.message, { status: 500 });
  }
}

async function addUser(request, env) {
  try {
    const userData = await request.json();
    
    // Read existing users
    const usersObject = await env.R2_BUCKET.get('config:share_links');
    let users = {};
    
    if (usersObject !== null) {
      const usersData = await usersObject.text();
      users = JSON.parse(usersData);
    }
    
    // Add new user
    users[userData.username] = userData;
    
    // Write back to R2
    await env.R2_BUCKET.put('config:share_links', JSON.stringify(users));
    
    return new Response(JSON.stringify(userData), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response('Error adding user: ' + error.message, { status: 500 });
  }
}

async function presignUploadUrl(request, env) {
  try {
    const url = new URL(request.url);
    const filename = url.searchParams.get('filename');
    
    if (!filename) {
      return new Response('Missing filename parameter', { status: 400 });
    }
    
    // Generate a unique key for the file
    const uuid = crypto.randomUUID();
    const key = `files:images/${uuid}-${filename}`;
    
    // Create a presigned URL for upload
    const signedUrl = await env.R2_BUCKET.createSignedUrl(key, 3600, {
      method: 'PUT'
    });
    
    return new Response(JSON.stringify({
      uploadUrl: signedUrl,
      fileKey: key
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response('Error creating presigned URL: ' + error.message, { status: 500 });
  }
}

async function serveFileFromR2(key, env) {
  try {
    const object = await env.R2_BUCKET.get(key);
    
    if (object === null) {
      return new Response('File not found', { status: 404 });
    }
    
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    
    return new Response(object.body, {
      headers
    });
  } catch (error) {
    return new Response('Error serving file: ' + error.message, { status: 500 });
  }
}

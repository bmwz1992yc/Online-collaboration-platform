// Client-side JavaScript for Workers TaskFlow
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
        const response = await fetch(`/api/users/auth?token=${token}&role=${initialRoleCheck}`);
        if (!response.ok) {
            throw new Error('认证失败');
        }
        
        const userData = await response.json();
        currentUser = userData;
        
        // Update UI with user info
        userInfo.textContent = `欢迎, ${currentUser.username} (${currentUser.role})`;
        
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
        taskElement.innerHTML = `
            <h3>${task.title}</h3>
            <p><strong>描述:</strong> ${task.description || '无'}</p>
            <p><strong>状态:</strong> ${task.status}</p>
            <p><strong>进度:</strong></p>
            <div class="progress-container">
                <div class="progress-bar" style="width: ${task.progress}%">${task.progress}%</div>
            </div>
            <p><strong>指派人:</strong> ${task.assignee_id}</p>
            <p><strong>创建人:</strong> ${task.creator_id}</p>
            <p><strong>截止日期:</strong> ${task.due_date || '未设置'}</p>
            <div class="task-actions">
                <button class="edit-btn" onclick="editTask('${task.id}')">编辑</button>
                <button class="delete-btn" onclick="deleteTask('${task.id}')">删除</button>
            </div>
        `;
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
        const response = await fetch(`/api/tasks/${taskId}`, {
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
        assetElement.innerHTML = `
            <h3>${asset.name}</h3>
            <p><strong>当前保管人:</strong> ${asset.current_owner_id}</p>
            ${asset.image_r2_key ? `<img src="/api/files/${asset.image_r2_key}" alt="${asset.name}" class="asset-image">` : ''}
            <p><strong>交接历史:</strong></p>
            <ul>
                ${(asset.transfer_history || []).map(transfer => 
                    `<li>${transfer.from_owner_id} → ${transfer.to_owner_id} (${new Date(transfer.transfer_time).toLocaleString()})</li>`
                ).join('')}
            </ul>
            <div class="asset-actions">
                <button class="transfer-btn" onclick="transferAsset('${asset.id}')">交接</button>
            </div>
        `;
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
            const presignResponse = await fetch(`/api/files/presign-upload?filename=${encodeURIComponent(imageFile.name)}`);
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
        userElement.innerHTML = `
            <h3>${user.username}</h3>
            <p><strong>角色:</strong> ${user.role}</p>
            <p><strong>Token:</strong> ${user.token}</p>
        `;
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

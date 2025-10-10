// ⚠️ 重要提示：此 Worker 需要绑定一个名为 R2_BUCKET 的 R2 存储桶。
// 如果未绑定 R2 存储桶，Worker 将无法正常工作。

const SHARE_LINKS_KEY = 'admin:share_links';
const DELETED_TODOS_KEY = 'system:deleted_todos';
const KEPT_ITEMS_KEY = 'system:kept_items'; // 新增物品保管的 R2 键

// --- 辅助函数 ---

const getKvKey = (userId) => `todos:${userId}`;

function getDisplayName(userId) {
  if (userId === 'admin') return 'yc';
  return userId;
}

function formatDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  
  // Beijing is UTC+8
  const beijingOffset = 8 * 60 * 60 * 1000;
  const beijingTime = new Date(d.getTime() + beijingOffset);
  
  const year = beijingTime.getUTCFullYear();
  const month = beijingTime.getUTCMonth() + 1;
  const day = beijingTime.getUTCDate();
  const hours = beijingTime.getUTCHours();
  const minutes = beijingTime.getUTCMinutes();
  
  const paddedMinutes = minutes < 10 ? '0' + minutes : minutes;
  return `${year}年${month}月${day}日 ${hours}点${paddedMinutes}分`;
}

// Image compression function
async function compressImage(file) {
  // For simplicity, we'll just return the original file
  // In a real implementation, you would use a library like Sharp or Canvas to compress the image
  return file.stream();
}

// --- R2 存储函数 ---

async function loadTodos(env, key) {
  try {
    const r2Object = await env.R2_BUCKET.get(key);
    if (r2Object === null) return [];
    return await r2Object.json();
  } catch (error) {
    console.error(`Error loading or parsing todos for key ${key}:`, error);
    if (env.DEBUG) throw error; // Re-throw for debugging
    return [];
  }
}

async function saveTodos(env, key, todos) {
  await env.R2_BUCKET.put(key, JSON.stringify(todos));
}

async function loadShareLinks(env) {
  try {
    const r2Object = await env.R2_BUCKET.get(SHARE_LINKS_KEY);
    if (r2Object === null) return {};
    return await r2Object.json();
  } catch (error) {
    console.error("Error loading share links:", error);
    if (env.DEBUG) throw error; // Re-throw for debugging
    return {};
  }
}

async function saveShareLinks(env, links) {
  await env.R2_BUCKET.put(SHARE_LINKS_KEY, JSON.stringify(links));
}

async function loadDeletedTodos(env) {
  try {
    const r2Object = await env.R2_BUCKET.get(DELETED_TODOS_KEY);
    if (r2Object === null) return [];
    return await r2Object.json();
  } catch (error) {
    console.error("Error loading deleted todos:", error);
    if (env.DEBUG) throw error; // Re-throw for debugging
    return [];
  }
}

async function saveDeletedTodos(env, todos) {
  await env.R2_BUCKET.put(DELETED_TODOS_KEY, JSON.stringify(todos));
}

async function loadKeptItems(env) {
  try {
    const r2Object = await env.R2_BUCKET.get(KEPT_ITEMS_KEY);
    if (r2Object === null) return [];
    return await r2Object.json();
  } catch (error) {
    console.error("Error loading kept items:", error);
    if (env.DEBUG) throw error; // Re-throw for debugging
    return [];
  }
}

async function saveKeptItems(env, items) {
  await env.R2_BUCKET.put(KEPT_ITEMS_KEY, JSON.stringify(items));
}

async function getAllUsersTodos(env) {
  const listResponse = await env.R2_BUCKET.list({ prefix: 'todos:' });
  const keys = listResponse.objects.map(k => k.key);
  
  let allTodos = [];
  for (const key of keys) {
    const ownerId = key.substring(6);
    const userTodos = await loadTodos(env, key);
    allTodos.push(...userTodos.map(todo => ({ ...todo, ownerId: ownerId })));
  }
  allTodos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return allTodos;
}


// --- 静态资源处理 ---

// 由于 Worker 本身无法直接 serve 静态文件，我们需要将文件内容作为字符串常量
// 在实际部署中，这些内容应该通过构建过程或从其他地方获取
const STATIC_FILES = {

  '/index.html': () => `<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>全局待办事项清单</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="/styles.css">
</head>
<body class="p-4 md:p-8">
  <div class="container mx-auto max-w-4xl space-y-10">
    
    <h1 class="text-4xl font-bold text-center text-gray-900">全局待办事项清单</h1>

    <!-- 添加事项的表单 -->
    <div class="bg-white p-6 rounded-xl shadow-lg">
      <h2 class="text-2xl font-semibold mb-4 text-gray-800">添加新事项</h2>
      <form action="/add_todo" method="POST">
        <input type="hidden" name="creatorId" value="admin">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input type="text" name="text" placeholder="输入新的待办事项..." required class="md:col-span-3 p-3 border rounded-lg">
          
          <div class="md:col-span-2 p-3 border rounded-lg bg-gray-50">
            <h3 class="text-base font-semibold mb-2 text-gray-700">指派给 (可多选)</h3>
            <div class="space-y-2 max-h-24 overflow-y-auto">
                <label class="flex items-center space-x-2 font-normal">
                    <input type="checkbox" name="userIds" value="public" class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                    <span>Public (无指定用户)</span>
                </label>
                <!-- 用户选项将在这里动态插入 -->
            </div>
          </div>
        </div>
        <button type="submit" class="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg">添加</button>
      </form>
    </div>

    <!-- 待办事项列表 -->
    <div class="bg-white p-6 rounded-xl shadow-lg">
      <h2 class="text-2xl font-semibold mb-4 text-gray-800">所有事项</h2>
      <ul id="all-todos-list" class="space-y-3">
        <p class="text-center text-gray-500 py-10">无任何待办事项。</p>
      </ul>
    </div>

    <!-- 用户管理区域 -->
    <div class="bg-white p-6 rounded-xl shadow-lg">
      <h2 class="text-2xl font-semibold mb-4 text-gray-800">用户管理</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 class="text-lg font-semibold mb-2">新增用户</h3>
          <form action="/add_user" method="POST" class="flex space-x-2">
            <input type="text" name="username" placeholder="新用户名..." required class="flex-grow p-2 border rounded-lg">
            <button type="submit" class="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg">创建</button>
          </form>
        </div>
        <div>
          <h3 class="text-lg font-semibold mb-2">现有用户 (<span id="user-count">0</span>)</h3>
          <ul id="user-list" class="space-y-2">
            <li class="text-gray-500">暂无用户。</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 最近删除 -->
    <div class="bg-white p-6 rounded-xl shadow-lg">
      <h2 class="text-2xl font-semibold mb-4 text-gray-800">最近删除 (5天内)</h2>
      <ul id="deleted-todos-list" class="space-y-3">
        <p class="text-center text-gray-500 py-10">无已删除事项。</p>
      </ul>
    </div>

  </div>

  <script src="/script.js"></script>
</body>
</html>`,
  '/styles.css': () => `body { 
  font-family: 'Inter', sans-serif; 
  background-color: #f4f5f7; 
}

.completed .flex-grow label { 
  text-decoration: line-through; 
  color: #9ca3af; 
}

.todo-item { 
  display: flex; 
  align-items: center; 
  padding: 12px; 
  background: white; 
  border-radius: 8px; 
  box-shadow: 0 1px 2px rgba(0,0,0,0.05); 
}

.todo-item input[type="checkbox"] { 
  width: 18px; 
  height: 18px; 
  margin-right: 12px; 
  flex-shrink: 0; 
  cursor: pointer; 
}

.todo-item label { 
  flex-grow: 1; 
  font-size: 1.05em; 
}

.meta-info { 
  font-size: 0.8em; 
  color: #6b7280; 
}

.delete-btn, .delete-link-btn {
  background-color: #ef4444; 
  color: white; 
  border: none; 
  padding: 4px 10px; 
  border-radius: 6px; 
  font-weight: bold; 
  cursor: pointer; 
  transition: background-color 0.2s;
}

.delete-btn:hover, .delete-link-btn:hover { 
  background-color: #dc2626; 
}`,
  '/script.js': () => `async function toggleTodo(id, isChecked, ownerId) {
  try {
    const response = await fetch('/update_todo', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, completed: isChecked, ownerId }),
    });
    if (!response.ok) throw new Error('Update failed');
    window.location.reload();
  } catch (error) {
    console.error("Update failed:", error);
    alert('Update failed, please try again.');
  }
}

async function deleteTodo(id, ownerId) {
  if (!confirm('确定要删除用户 ' + ownerId + ' 的此事项吗？')) return;
  try {
    const response = await fetch('/delete_todo', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ownerId }),
    });
    if (!response.ok) throw new Error('Delete failed');
    window.location.reload();
  } catch (error) {
    console.error("Delete failed:", error);
    alert('Delete failed, please try again.');
  }
}

async function deleteUser(token) {
  if (!confirm('确定要删除此用户吗？其个人链接将失效。')) return;
  try {
    const response = await fetch('/delete_user', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    if (!response.ok) throw new Error('Delete user failed');
    window.location.reload();
  } catch (error) {
    console.error("Delete user failed:", error);
    alert('Delete user failed, please try again.');
  }
}`
};

// --- 主请求处理器 ---

async function handleRequest(request, env, ctx) {
  try {
    // Check for R2_BUCKET binding with more detailed logging
    console.log('Environment object:', JSON.stringify(Object.keys(env || {})));
    console.log('R2_BUCKET binding exists:', !!env?.R2_BUCKET);
    if (env && env.R2_BUCKET) {
      console.log('R2_BUCKET type:', typeof env.R2_BUCKET);
    }
    
    // Fallback: try to get R2 bucket from context if not in env
    if (!env || !env.R2_BUCKET) {
      console.log('Trying to get R2 bucket from context bindings');
      const bindings = ctx?.bindings || {};
      console.log('Context bindings:', JSON.stringify(Object.keys(bindings || {})));
      if (bindings.R2_BUCKET) {
        env = { ...env, R2_BUCKET: bindings.R2_BUCKET };
        console.log('Successfully got R2_BUCKET from context bindings');
      }
    }
    
    // Check for R2_BUCKET binding
    if (!env || !env.R2_BUCKET) {
      console.error('R2_BUCKET binding is missing or env object is undefined. Please ensure your wrangler.toml or Cloudflare Worker settings include an R2 bucket binding named R2_BUCKET.');
      return new Response('Internal Server Error: R2_BUCKET binding is missing or env object is undefined.', { status: 500 });
    }

    const url = new URL(request.url);
    const verificationFilePath = '/6ee0f9bfa3e3dd568497b8062fba8521.txt';
    const verificationContent = '12c799e1e1c52e9b3d20f6420f5e46a0589222ba';
    // 1. 优先级最高：处理域名验证文件
    // 必须检查完整的 url.pathname，而不是 pathSegment
    if (url.pathname === verificationFilePath) {
        return new Response(verificationContent, {
            headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
            status: 200
        });
    }

  const pathname = url.pathname;
  const pathSegment = pathname.substring(1).split('/')[0].toLowerCase();
  
  // 处理静态资源请求
  if (request.method === 'GET' && STATIC_FILES[pathname]) {
    const content = STATIC_FILES[pathname](env);
    let contentType = 'text/plain';
    
    if (pathname.endsWith('.html')) contentType = 'text/html;charset=UTF-8';
    if (pathname.endsWith('.css')) contentType = 'text/css';
    if (pathname.endsWith('.js')) contentType = 'application/javascript';
    
    // 如果是主页，使用动态渲染
    if (pathname === '/' || pathname === '/index.html') {
      const shareLinks = await loadShareLinks(env);
      const isRootView = pathSegment === '';
      
      if (isRootView || shareLinks[pathSegment]) {
        const allTodos = await getAllUsersTodos(env);
        let deletedTodos = await loadDeletedTodos(env);

        const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
        const recentDeletedTodos = deletedTodos.filter(todo => new Date(todo.deletedAt) > fiveDaysAgo);
        if (recentDeletedTodos.length < deletedTodos.length) {
          await saveDeletedTodos(env, recentDeletedTodos);
        }

        const keptItems = await loadKeptItems(env); // 加载保管物品
        return new Response(renderMasterViewHtml(url, allTodos, recentDeletedTodos, keptItems, shareLinks, isRootView), {
          headers: { 'Content-Type': 'text/html;charset=UTF-8' },
        });
      } else {
        return new Response('404 Not Found: User or page does not exist.', { status: 404 });
      }
    }
    
    return new Response(content, {
      headers: { 'Content-Type': contentType },
    });
  }
  
  if (request.method === 'POST' && pathSegment === 'add_todo') {
    return handleAddTodo(request, url, env);
  }
  if (request.method === 'PUT' && pathSegment === 'update_todo') {
    return handleUpdateTodo(request, env);
  }
  if (request.method === 'DELETE' && pathSegment === 'delete_todo') {
    return handleDeleteTodo(request, env);
  }
  if (request.method === 'POST' && pathSegment === 'add_user') {
    return handleCreateUser(request, url, env);
  }
  if (request.method === 'DELETE' && pathSegment === 'delete_user') {
    return handleDeleteUser(request, env);
  }
  if (request.method === 'POST' && pathSegment === 'add_item') { // 新增物品保管路由
    return handleAddItem(request, url, env);
  }
  if (request.method === 'DELETE' && pathSegment === 'delete_item') { // 删除物品保管路由
    return handleDeleteItem(request, env);
  }

  if (request.method === 'GET') {
    const shareLinks = await loadShareLinks(env);
    const isRootView = pathSegment === '';
    
    if (isRootView || shareLinks[pathSegment]) {
      const allTodos = await getAllUsersTodos(env);
      let deletedTodos = await loadDeletedTodos(env);
      const keptItems = await loadKeptItems(env); // 加载保管物品

      const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
      const recentDeletedTodos = deletedTodos.filter(todo => new Date(todo.deletedAt) > fiveDaysAgo);
      if (recentDeletedTodos.length < deletedTodos.length) {
        await saveDeletedTodos(env, recentDeletedTodos);
      }

      return new Response(renderMasterViewHtml(url, allTodos, recentDeletedTodos, keptItems, shareLinks, isRootView), {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' },
      });
    } else {
      return new Response('404 Not Found: User or page does not exist.', { status: 404 });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
  } catch (error) {
    console.error('Error in handleRequest:', error.stack || error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

// --- API 逻辑处理器 ---

async function handleAddTodo(request, url, env) {
  const referer = request.headers.get('Referer') || url.origin;
  const refererPath = new URL(referer).pathname.substring(1).split('/')[0].toLowerCase();
  
  const shareLinks = await loadShareLinks(env);
  let creatorId = 'admin';
  if (shareLinks[refererPath]) {
      creatorId = shareLinks[refererPath].username;
  }

  const formData = await request.formData();
  const text = formData.get('text');
  const imageFile = formData.get('image'); // 获取图片文件
  let ownerIds = formData.getAll('userIds');

  if (!text) {
    return new Response('Missing "text" in form data', { status: 400 });
  }
  
  if (ownerIds.length === 0) {
    ownerIds.push('public');
  }

  let imageUrl = null;
  if (imageFile && imageFile.size > 0) {
    // Compress image before storing
    const compressedImage = await compressImage(imageFile);
    const imageId = crypto.randomUUID();
    const imageKey = `images/${imageId}-${imageFile.name}`;
    await env.R2_BUCKET.put(imageKey, compressedImage);
    imageUrl = `/images/${imageId}-${imageFile.name}`; // 存储相对路径
  }

  const newTodo = {
    id: crypto.randomUUID(),
    text: text,
    completed: false,
    createdAt: new Date().toISOString(),
    creatorId: creatorId,
    imageUrl: imageUrl, // 添加图片 URL
  };

  for (const ownerId of ownerIds) {
    const kvKey = getKvKey(ownerId);
    const todos = await loadTodos(env, kvKey);
    todos.push(newTodo);
    await saveTodos(env, kvKey, todos);
  }

  return Response.redirect(referer, 303);
}

async function handleUpdateTodo(request, env) {
  const { id, completed, ownerId } = await request.json();
  if (!id || completed === undefined || !ownerId) {
    return new Response(JSON.stringify({ error: "Missing 'id', 'completed', or 'ownerId'" }), { status: 400 });
  }

  const referer = request.headers.get('Referer');
  let completerId = 'admin';
  if (referer) {
      const refererPath = new URL(referer).pathname.substring(1).split('/')[0].toLowerCase();
      const shareLinks = await loadShareLinks(env);
      if (shareLinks[refererPath]) {
          completerId = shareLinks[refererPath].username;
      }
  }

  const kvKey = getKvKey(ownerId);
  const todos = await loadTodos(env, kvKey);
  const todoIndex = todos.findIndex(t => t.id === id);

  if (todoIndex !== -1) {
    const isCompleted = Boolean(completed);
    todos[todoIndex].completed = isCompleted;
    if (isCompleted) {
      todos[todoIndex].completedAt = new Date().toISOString();
      todos[todoIndex].completedBy = completerId;
    } else {
      delete todos[todoIndex].completedAt;
      delete todos[todoIndex].completedBy;
    }
    await saveTodos(env, kvKey, todos);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } else {
    return new Response(JSON.stringify({ error: "Todo not found" }), { status: 404 });
  }
}

async function handleDeleteTodo(request, env) {
  const { id, ownerId } = await request.json();
  if (!id || !ownerId) {
    return new Response(JSON.stringify({ error: "Missing 'id' or 'ownerId'" }), { status: 400 });
  }

  const referer = request.headers.get('Referer');
  let deleterId = 'admin';
  if (referer) {
      const refererPath = new URL(referer).pathname.substring(1).split('/')[0].toLowerCase();
      const shareLinks = await loadShareLinks(env);
      if (shareLinks[refererPath]) {
          deleterId = shareLinks[refererPath].username;
      }
  }

  const kvKey = getKvKey(ownerId);
  let todos = await loadTodos(env, kvKey);
  const todoIndex = todos.findIndex(t => t.id === id);

  if (todoIndex !== -1) {
    const todoToDelete = todos[todoIndex];
    todos.splice(todoIndex, 1);
    await saveTodos(env, kvKey, todos);

    const deletedTodo = {
      ...todoToDelete,
      ownerId: ownerId,
      deletedAt: new Date().toISOString(),
      deletedBy: deleterId
    };

    const deletedTodos = await loadDeletedTodos(env);
    deletedTodos.push(deletedTodo);
    await saveDeletedTodos(env, deletedTodos);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } else {
    return new Response(JSON.stringify({ error: "Todo not found" }), { status: 404 });
  }
}

async function handleCreateUser(request, url, env) {
    const formData = await request.formData();
    const username = formData.get('username')?.toLowerCase();
    if (!username) {
        return new Response('Username is required', { status: 400 });
    }

    const shareLinks = await loadShareLinks(env);
    const newToken = crypto.randomUUID().substring(0, 8);
    
    shareLinks[newToken] = {
        username: username,
        created_at: new Date().toISOString()
    };
    
    await saveShareLinks(env, shareLinks);
    return Response.redirect(url.origin, 303);
}

async function handleDeleteUser(request, env) {
    const { token } = await request.json();
    if (!token) {
        return new Response(JSON.stringify({ error: "Missing 'token'" }), { status: 400 });
    }

    const shareLinks = await loadShareLinks(env);
    if (shareLinks[token]) {
        delete shareLinks[token];
        await saveShareLinks(env, shareLinks);
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } else {
        return new Response(JSON.stringify({ error: "User token not found" }), { status: 404 });
    }
}

// --- 物品保管 API 逻辑处理器 ---

async function handleAddItem(request, url, env) {
  const referer = request.headers.get('Referer') || url.origin;
  const formData = await request.formData();
  const name = formData.get('name');
  const keeper = formData.get('keeper');
  const imageFile = formData.get('image'); // 获取图片文件
  const todoId = formData.get('todoId'); // 获取关联的 todoId

  if (!name || !keeper) {
    return new Response('Missing "name" or "keeper" in form data', { status: 400 });
  }

  let imageUrl = null;
  if (imageFile && imageFile.size > 0) {
    // Compress image before storing
    const compressedImage = await compressImage(imageFile);
    const imageId = crypto.randomUUID();
    const imageKey = `images/${imageId}-${imageFile.name}`;
    await env.R2_BUCKET.put(imageKey, compressedImage);
    imageUrl = `/images/${imageId}-${imageFile.name}`; // 存储相对路径
  }

  const newItem = {
    id: crypto.randomUUID(),
    name: name,
    keeper: keeper,
    todoId: todoId || null, // 存储 todoId
    imageUrl: imageUrl, // 添加图片 URL
    createdAt: new Date().toISOString(),
  };

  const keptItems = await loadKeptItems(env);
  keptItems.push(newItem);
  await saveKeptItems(env, keptItems);

  return Response.redirect(referer, 303);
}

async function handleDeleteItem(request, env) {
  const { id } = await request.json();
  if (!id) {
    return new Response(JSON.stringify({ error: "Missing 'id'" }), { status: 400 });
  }

  let keptItems = await loadKeptItems(env);
  const itemIndex = keptItems.findIndex(item => item.id === id);

  if (itemIndex !== -1) {
    keptItems.splice(itemIndex, 1);
    await saveKeptItems(env, keptItems);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } else {
    return new Response(JSON.stringify({ error: "Item not found" }), { status: 404 });
  }
}


// --- HTML 模板和前端逻辑 ---

function renderMasterViewHtml(url, allTodos, deletedTodos, keptItems, shareLinks, isRootView) {
  const origin = url.origin;

  let creatorId = 'admin';
  if (!isRootView) {
    const pathSegment = url.pathname.substring(1).split('/')[0].toLowerCase();
    creatorId = shareLinks[pathSegment]?.username || 'unknown';
  }

  // Sort todos: completed items at the bottom
  allTodos.sort((a, b) => {
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    return new Date(b.createdAt) - new Date(a.createdAt); // Keep original sort for same status
  });

  const allListItems = allTodos.map(todo => {
    const ownerDisplayName = todo.ownerId === 'public' ? '' : getDisplayName(todo.ownerId);
    const ownerInfo = ownerDisplayName ? ` | 指派给: <strong>${ownerDisplayName}</strong>` : '';
    const creatorDisplayName = getDisplayName(todo.creatorId || 'unknown');
    const completionInfo = todo.completed ? ` | 由 <strong>${getDisplayName(todo.completedBy)}</strong> 在 ${formatDate(todo.completedAt)} 完成` : '';
    
    const imageUrlHtml = todo.imageUrl ? `<img src="${todo.imageUrl}" alt="Todo Image" class="w-16 h-16 object-cover rounded-md mr-4">` : '';
    return `
    <li data-id="${todo.id}" data-owner="${todo.ownerId}" class="todo-item flex items-center p-4 bg-white rounded-lg shadow-sm ${todo.completed ? 'completed' : ''}">
      <input type="checkbox" id="todo-${todo.id}" ${todo.completed ? 'checked' : ''} onchange="toggleTodo('${todo.id}', this.checked, '${todo.ownerId}')" class="mr-4 w-6 h-6 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500">
      ${imageUrlHtml}
      <div class="flex-grow">
        <label for="todo-${todo.id}" class="text-2xl font-medium text-gray-800">${todo.text}</label>
        <div class="meta-info text-sm text-gray-500">由 <strong>${creatorDisplayName}</strong> 在 ${formatDate(todo.createdAt)} 创建${ownerInfo}${completionInfo}</div>
      </div>
      <div class="flex items-center space-x-2 ml-auto">
        <button class="delete-btn bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm" onclick="deleteTodo('${todo.id}', '${todo.ownerId}')">
          删除
        </button>
      </div>
    </li>
  `}).join('');

  const todoOptions = allTodos.map(todo => `
    <option value="${todo.id}">${todo.text} (由 ${getDisplayName(todo.creatorId)} 创建)</option>
  `).join('');

  const deletedListItems = deletedTodos.sort((a,b) => new Date(b.deletedAt) - new Date(a.deletedAt)).map(todo => {
      const ownerDisplayName = todo.ownerId === 'public' ? '' : getDisplayName(todo.ownerId);
      const ownerInfo = ownerDisplayName ? ` | 指派给: <strong>${ownerDisplayName}</strong>` : '';
      const creatorDisplayName = getDisplayName(todo.creatorId || 'unknown');
      const completionInfo = todo.completed ? ` | 由 <strong>${getDisplayName(todo.completedBy)}</strong> 在 ${formatDate(todo.completedAt)} 完成` : '';
      const deletionInfo = ` | 由 <strong>${getDisplayName(todo.deletedBy)}</strong> 在 ${formatDate(todo.deletedAt)} 删除`;

      return `
      <li class="todo-item opacity-60">
        <div class="flex-grow">
          <label class="${todo.completed ? 'line-through' : ''}">${todo.text}</label>
          <div class="meta-info">由 <strong>${creatorDisplayName}</strong> 在 ${formatDate(todo.createdAt)} 创建${ownerInfo}${completionInfo}${deletionInfo}</div>
        </div>
      </li>
      `;
  }).join('');

  const userOptions = Object.values(shareLinks).map(link => 
    `<label class="flex items-center space-x-2">
        <input type="checkbox" name="userIds" value="${link.username}" class="rounded border-gray-300 text-blue-600 focus:ring-blue-300">
        <span>${getDisplayName(link.username)}</span>
    </label>`
  ).join('');

  let userManagementHtml = '';
  if (isRootView) {
    const linkItems = Object.entries(shareLinks).map(([token, data]) => `
      <li class="flex justify-between items-center py-2 border-b">
        <div>
          <p class="font-medium text-gray-800">${getDisplayName(data.username)}</p>
          <a href="/${token}" class="text-sm text-blue-600 hover:underline" target="_blank">${origin}/${token}</a>
        </div>
        <button class="ml-4 delete-link-btn" onclick="deleteUser('${token}')">删除用户</button>
      </li>
    `).join('');

    userManagementHtml = `
      <section class="card p-6">
        <div class="flex items-center gap-2 mb-4">
          <i data-lucide="users" class="w-6 h-6 text-green-600"></i>
          <h2 class="text-2xl font-semibold text-gray-800">用户管理</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 class="text-lg font-semibold mb-2">新增用户</h3>
            <form action="/add_user" method="POST" class="flex space-x-2">
              <input type="text" name="username" placeholder="新用户名..." required
                     class="flex-grow p-2 border rounded-lg focus:ring-2 focus:ring-green-300" />
              <button type="submit"
                      class="w-full bg-green-500 text-white font-medium py-2 px-4 rounded-lg">
                创建
              </button>
            </form>
          </div>
          <div>
            <h3 class="text-lg font-semibold mb-2">现有用户 (<span id="user-count">${Object.keys(shareLinks).length}</span>)</h3>
            <ul id="user-list" class="space-y-2 text-sm text-gray-600">
              ${linkItems || '<li class="text-gray-400">暂无用户。</li>'}
            </ul>
          </div>
        </div>
      </section>`;
  }

  const keptItemsListItems = keptItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(item => {
    const associatedTodo = allTodos.find(todo => todo.id === item.todoId);
    const todoInfo = associatedTodo ? ` | 关联待办: <strong>${associatedTodo.text}</strong>` : '';
    const imageUrlHtml = item.imageUrl ? `<img src="${item.imageUrl}" alt="Item Image" class="w-16 h-16 object-cover rounded-md mr-4">` : '';
    return `
      <li data-id="${item.id}" class="todo-item">
        ${imageUrlHtml}
        <div class="flex-grow">
          <label>${item.name}</label>
          <div class="meta-info">保管人: <strong>${item.keeper}</strong> 在 ${formatDate(item.createdAt)} 保管${todoInfo}</div>
        </div>
        <button class="delete-btn" onclick="deleteItem('${item.id}')">×</button>
      </li>
    `;
  }).join('');

  const clientScript = `
    lucide.createIcons();

    async function toggleTodo(id, isChecked, ownerId) {
      try {
        const response = await fetch('/update_todo', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, completed: isChecked, ownerId }),
        });
        if (!response.ok) throw new Error('Update failed');
        
        // Dynamic DOM update
        const todoItem = document.querySelector(\`li[data-id='\${id}']\`);
        if (todoItem) {
          todoItem.classList.toggle('completed', isChecked);
          // Move completed items to the bottom without full re-sort
          if (isChecked) {
            const list = document.getElementById('all-todos-list');
            list.appendChild(todoItem);
          }
          // No need to do anything if unchecked, as the item will stay in place
        }
      } catch (error) {
        console.error("Update failed:", error);
        alert('Update failed, please try again.');
      }
    }

    async function deleteTodo(id, ownerId) {
      if (!confirm('确定要删除用户 ' + ownerId + ' 的此事项吗？')) return;
      try {
        const response = await fetch('/delete_todo', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ownerId }),
        });
        if (!response.ok) throw new Error('Delete failed');
        
        // Dynamic DOM update
        const todoItem = document.querySelector(\`li[data-id='\${id}']\`);
        if (todoItem) {
          todoItem.remove();
        }
      } catch (error) {
        console.error("Delete failed:", error);
        alert('Delete failed, please try again.');
      }
    }

    async function deleteUser(token) {
      if (!confirm('确定要删除此用户吗？其个人链接将失效。')) return;
      try {
        const response = await fetch('/delete_user', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        if (!response.ok) throw new Error('Delete user failed');
        window.location.reload();
      } catch (error) {
        console.error("Delete user failed:", error);
        alert('Delete user failed, please try again.');
      }
    }

    // 物品保管功能的前端逻辑
    document.addEventListener('DOMContentLoaded', () => {
      const addItemForm = document.getElementById('add-item-form');
      if (addItemForm) {
        addItemForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const name = document.getElementById('item-name').value;
          const keeper = Array.from(document.querySelectorAll('#item-keeper-checkboxes input[name="itemUserIds"]:checked')).map(cb => cb.value);
          const todoId = document.getElementById('item-todo-id').value;
          const imageFile = document.getElementById('item-image').files[0];

          const formData = new FormData();
          formData.append('name', name);
          keeper.forEach(k => formData.append('keeper', k));
          formData.append('todoId', todoId);
          if (imageFile) {
            formData.append('image', imageFile);
          }

          try {
            const response = await fetch('/add_item', {
              method: 'POST',
              body: formData,
            });
            if (!response.ok) throw new Error('Add item failed');
            window.location.reload();
          } catch (error) {
            console.error("Add item failed:", error);
            alert('Add item failed, please try again.');
          }
        });
      }

      const addTodoForm = document.querySelector('form[action="/add_todo"]');
      if (addTodoForm) {
        addTodoForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const text = addTodoForm.querySelector('input[name="text"]').value;
          const imageFile = addTodoForm.querySelector('input[name="image"]').files[0];
          const creatorId = addTodoForm.querySelector('input[name="creatorId"]').value;
          const userIds = Array.from(addTodoForm.querySelectorAll('input[name="userIds"]:checked')).map(cb => cb.value);

          const formData = new FormData();
          formData.append('text', text);
          formData.append('creatorId', creatorId);
          userIds.forEach(id => formData.append('userIds', id));
          if (imageFile) {
            formData.append('image', imageFile);
          }

          try {
            const response = await fetch('/add_todo', {
              method: 'POST',
              body: formData,
            });
            if (!response.ok) throw new Error('Add todo failed');
            window.location.reload();
          } catch (error) {
            console.error("Add todo failed:", error);
            alert('Add todo failed, please try again.');
          }
        });
      }
    });

    async function deleteItem(id) {
      if (!confirm('确定要删除此保管物品吗？')) return;
      try {
        const response = await fetch('/delete_item', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });
        if (!response.ok) throw new Error('Delete item failed');
        window.location.reload();
      } catch (error) {
        console.error("Delete item failed:", error);
        alert('Delete item failed, please try again.');
      }
    }
  `;

  return `
    <!DOCTYPE html>
    <html lang="zh">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>全局待办事项清单</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <script src="https://unpkg.com/lucide@latest"></script>
      <style>
        body {
          background: linear-gradient(135deg, #eef2ff, #f8f9ff, #e0e7ff);
          min-height: 100vh;
          font-family: 'Inter', 'Noto Sans SC', sans-serif;
        }
        .card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(6px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          border-radius: 1rem;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
        }
      </style>
    </head>
    <body class="p-4 md:p-8 text-gray-800">
      <div class="container mx-auto space-y-10">
        
        <!-- 页头 -->
        <header class="text-center space-y-3">
          <h1 class="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            全局待办事项清单
          </h1>
          <p class="text-gray-600 text-sm">集中管理任务、物品交接与用户信息</p>
        </header>

        <!-- 添加事项 + 物品交接 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <!-- 添加事项 -->
          <section class="card p-6 space-y-4">
            <div class="flex items-center gap-2 mb-2">
              <i data-lucide="plus-circle" class="w-5 h-5 text-blue-600"></i>
              <h2 class="text-lg font-semibold text-blue-700">添加新事项</h2>
            </div>
            <form action="/add_todo" method="POST" class="space-y-3" enctype="multipart/form-data">
              <input type="hidden" name="creatorId" value="${creatorId}" />
              <input type="text" name="text" placeholder="输入新的待办事项..." required
                     class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-300" />
              <input type="file" name="image" accept="image/*"
                     class="w-full text-sm border rounded-lg p-1" />
              <div class="p-3 bg-gray-50 border rounded-lg">
                <h3 class="text-sm font-semibold mb-1 text-gray-700">指派给 (可多选)</h3>
                <div class="space-y-1 max-h-20 overflow-y-auto text-sm">
                  <label class="flex items-center space-x-2">
                    <input type="checkbox" name="userIds" value="public"
                           class="rounded border-gray-300 text-blue-600 focus:ring-blue-300" />
                    <span>Public (无指定用户)</span>
                  </label>
                  ${userOptions}
                </div>
              </div>
              <button type="submit"
                      class="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-lg">
                添加事项
              </button>
            </form>
          </section>

          <!-- 物品交接 -->
          <section class="card p-6 space-y-4">
            <div class="flex items-center gap-2 mb-2">
              <i data-lucide="package" class="w-5 h-5 text-purple-600"></i>
              <h2 class="text-lg font-semibold text-purple-700">物品交接</h2>
            </div>
            <form id="add-item-form" class="space-y-3" enctype="multipart/form-data">
              <input type="text" id="item-name" placeholder="物品名称..." required
                     class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-300" />
              <div class="p-3 bg-gray-50 border rounded-lg">
                <h3 class="text-sm font-semibold mb-1 text-gray-700">持有人 (可多选)</h3>
                <div id="item-keeper-checkboxes" class="space-y-1 max-h-20 overflow-y-auto text-sm">
                  <label class="flex items-center space-x-2">
                    <input type="checkbox" name="itemUserIds" value="public"
                           class="rounded border-gray-300 text-purple-600 focus:ring-purple-300" />
                    <span>Public (无指定用户)</span>
                  </label>
                  ${userOptions}
                </div>
              </div>
              <input type="file" id="item-image" name="image" accept="image/*"
                     class="w-full text-sm border rounded-lg p-1" />
              <select id="item-todo-id" class="w-full p-2 border rounded-lg text-sm">
                <option value="">选择关联待办事项 (可选)</option>
                ${todoOptions}
              </select>
              <button type="submit"
                      class="w-full bg-purple-600 text-white font-medium py-2 px-4 rounded-lg">
                添加交接物品
              </button>
            </form>

            <div class="mt-4">
              <h3 class="text-sm font-semibold mb-2 text-gray-700">当前交接物品</h3>
              <ul id="kept-items-list" class="space-y-1 text-sm text-gray-500">
                ${keptItemsListItems || '<p class="text-center py-4">无任何交接物品。</p>'}
              </ul>
            </div>
          </section>
        </div>

        <!-- 所有事项 -->
        <section class="card p-6">
          <div class="flex items-center gap-2 mb-4">
            <i data-lucide="check-square" class="w-6 h-6 text-blue-600"></i>
            <h2 class="text-2xl font-semibold text-gray-800">所有事项</h2>
          </div>
          <ul id="all-todos-list" class="space-y-3 text-sm">
            ${allListItems || '<p class="text-center text-gray-500 py-10">无任何待办事项。</p>'}
          </ul>
        </section>

        <!-- 用户管理 -->
        ${userManagementHtml}

        <!-- 最近删除 -->
        <section class="card p-6">
          <div class="flex items-center gap-2 mb-4">
            <i data-lucide="trash-2" class="w-6 h-6 text-red-500"></i>
            <h2 class="text-2xl font-semibold text-gray-800">最近删除 (5天内)</h2>
          </div>
          <ul id="deleted-todos-list" class="space-y-3 text-sm text-gray-500">
            ${deletedListItems || '<p class="text-center py-10">无已删除事项。</p>'}
          </ul>
        </section>

      </div>

      <script>
        ${clientScript}
      </script>
    </body>
    </html>
  `;
}

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env, ctx);
  }
}

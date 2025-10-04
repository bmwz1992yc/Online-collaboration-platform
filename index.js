// Cloudflare Workers Task Management System
// Main entry point for the application

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // Route handling
    if (request.method === 'GET') {
      // API routes for GET requests
      if (path.startsWith('/api/')) {
        return handleApiGetRequest(path, request, env);
      }
      
      // Authentication routes (these will redirect to the frontend, which will handle the token)
      if (path.startsWith('/admin/') || path.startsWith('/app/')) {
        // For GitHub Pages deployment, Workers should not serve HTML directly.
        // Instead, it should redirect to the GitHub Pages URL with the token.
        // This is a placeholder, actual redirect logic might be more complex
        // depending on how GitHub Pages is set up to receive tokens.
        // For now, we'll just return a simple response.
        return new Response('Frontend should handle authentication via URL token.', { status: 200 });
      }
    } else if (request.method === 'POST') {
      if (path.startsWith('/api/')) {
        return handleApiPostRequest(path, request, env);
      }
    } else if (request.method === 'DELETE') {
      if (path.startsWith('/api/tasks/')) {
        return handleApiDeleteRequest(path, request, env);
      }
    }
    
    return new Response('Not Found', { status: 404 });
  }
};

// Handle authentication routes
async function handleAuthRoute(path, request, env) {
  // Extract token from path
  const parts = path.split('/');
  const token = parts[2]; // /admin/<token> or /app/<token>
  const role = parts[1];  // 'admin' or 'app'
  
  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  try {
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
      return new Response('Forbidden', { status: 403 });
    }
    
    // Authentication successful, but Workers no longer serve static files.
    // The frontend (e.g., GitHub Pages) is responsible for rendering the UI.
    // We can return a success message or a redirect URL if needed.
    return new Response(JSON.stringify({ message: 'Authentication successful', user: user }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response('Authentication error: ' + error.message, { status: 500 });
  }
}

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
      users = JSON.parse(userData);
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

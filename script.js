async function toggleTodo(id, isChecked, ownerId) {
  try {
    const response = await fetch('/update_todo', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, completed: isChecked, ownerId }),
    });
    if (!response.ok) throw new Error('Update failed');
    
    // Dynamic DOM update instead of full page reload
    const todoItem = document.querySelector(`li[data-id='${id}']`);
    if (todoItem) {
      todoItem.classList.toggle('completed', isChecked);
      // Move completed items to the bottom without full re-sort
      if (isChecked) {
        const list = document.getElementById('all-todos-list');
        list.appendChild(todoItem);
      }
    }
  } catch (error) {
    console.error("Update failed:", error);
    alert('Update failed, please try again.');
  }
}

// 物品保管功能的前端逻辑
// Helper function to fetch and render user checkboxes
async function fetchUsersAndRenderCheckboxes() {
  try {
    const response = await fetch('/get_users');
    if (!response.ok) throw new Error('Failed to fetch users');
    const users = await response.json();

    const assignToContainer = document.querySelector('.md\\:col-span-5.p-3.border.rounded-lg.bg-gray-50 .space-y-2.max-h-24.overflow-y-auto');
    const itemKeeperContainer = document.getElementById('item-keeper-checkboxes');

    // Clear existing dynamic options (if any)
    // Keep the "Public" option if it exists
    Array.from(assignToContainer.children).forEach(child => {
      if (!child.querySelector('input[value="public"]')) {
        child.remove();
      }
    });
    Array.from(itemKeeperContainer.children).forEach(child => {
      if (!child.querySelector('input[value="public"]')) {
        child.remove();
      }
    });

    users.forEach(user => {
      // For "指派给" section
      const assignToLabel = document.createElement('label');
      assignToLabel.className = 'flex items-center space-x-2 font-normal';
      assignToLabel.innerHTML = `
        <input type="checkbox" name="userIds" value="${user.id}" class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
        <span>${user.username}</span>
      `;
      assignToContainer.appendChild(assignToLabel);

      // For "持有人" section
      const itemKeeperLabel = document.createElement('label');
      itemKeeperLabel.className = 'flex items-center space-x-2 font-normal';
      itemKeeperLabel.innerHTML = `
        <input type="checkbox" name="itemUserIds" value="${user.id}" class="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50">
        <span>${user.username}</span>
      `;
      itemKeeperContainer.appendChild(itemKeeperLabel);
    });
  } catch (error) {
    console.error("Error fetching and rendering users:", error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Fetch and render user checkboxes on page load
  fetchUsersAndRenderCheckboxes();

  const addItemForm = document.getElementById('add-item-form');
  if (addItemForm) {
    addItemForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('item-name').value;
      
      // Get selected item keepers
      const selectedKeepers = Array.from(document.querySelectorAll('#item-keeper-checkboxes input[name="itemUserIds"]:checked'))
                                   .map(checkbox => checkbox.value);

      const todoId = document.getElementById('item-todo-id').value; // 获取 todoId
      const imageFile = document.getElementById('item-image').files[0]; // 获取图片文件

      const formData = new FormData();
      formData.append('name', name);
      // Append each selected keeper
      selectedKeepers.forEach(keeperId => {
        formData.append('keepers', keeperId); // Changed 'keeper' to 'keepers' to handle multiple
      });
      formData.append('todoId', todoId);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      try {
        const response = await fetch('/add_item', {
          method: 'POST',
          body: formData, // 使用 FormData，不需要设置 Content-Type
        });
        if (!response.ok) throw new Error('Add item failed');
        
        // Clear form fields after successful submission
        addItemForm.reset();
        document.getElementById('item-name').value = '';
        document.getElementById('item-todo-id').selectedIndex = 0;
        // Uncheck all checkboxes
        document.querySelectorAll('#item-keeper-checkboxes input[type="checkbox"]').forEach(checkbox => {
          checkbox.checked = false;
        });
        // Clear file input
        document.getElementById('item-image').value = '';
        
        // Reload page to show new item
        window.location.reload();
      } catch (error) {
        console.error("Add item failed:", error);
        alert('Add item failed, please try again.');
      }
    });
  }
  
  // Handle add todo form submission
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
        
        // Clear form fields after successful submission
        addTodoForm.reset();
        addTodoForm.querySelector('input[name="text"]').value = '';
        // Uncheck all checkboxes except "Public"
        addTodoForm.querySelectorAll('input[name="userIds"]').forEach(checkbox => {
          if (checkbox.value !== 'public') {
            checkbox.checked = false;
          }
        });
        // Clear file input
        addTodoForm.querySelector('input[name="image"]').value = '';
        
        // Reload page to show new todo
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
    
    // Dynamic DOM update instead of full page reload
    const itemElement = document.querySelector(`li[data-id='${id}']`);
    if (itemElement) {
      itemElement.remove();
    }
  } catch (error) {
    console.error("Delete item failed:", error);
    alert('Delete item failed, please try again.');
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
    
    // Dynamic DOM update instead of full page reload
    const todoItem = document.querySelector(`li[data-id='${id}']`);
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
    
    // Dynamic DOM update instead of full page reload
    window.location.reload();
  } catch (error) {
    console.error("Delete user failed:", error);
    alert('Delete user failed, please try again.');
  }
}

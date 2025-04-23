document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskButton = document.getElementById('addTask');
    const todoList = document.getElementById('todoList');
    const themeToggle = document.querySelector('.theme-toggle');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const priorityButtons = document.querySelectorAll('.priority-btn');
    const pendingTasksCount = document.getElementById('pendingTasks');
    const completedTasksCount = document.getElementById('completedTasks');

    // Quotes for motivation
    const quotes = [
        "Small progress is still progress",
        "Done is better than perfect",
        "One task at a time",
        "Stay focused, stay productive",
        "Every task completed is a step forward"
    ];

    // State management
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';
    let selectedPriority = 'medium';

    // Theme management
    const theme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', theme);
    themeToggle.innerHTML = theme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';

    // Update task counts
    function updateTaskCounts() {
        const completed = tasks.filter(task => task.completed).length;
        const pending = tasks.length - completed;
        pendingTasksCount.textContent = pending;
        completedTasksCount.textContent = completed;
    }

    // Random quote generator
    function updateQuote() {
        const quoteElement = document.querySelector('.motivation-quote');
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        quoteElement.textContent = randomQuote;
    }

    // Filter tasks
    function filterTasks(filter) {
        const filteredTasks = tasks.filter(task => {
            if (filter === 'all') return true;
            if (filter === 'active') return !task.completed;
            if (filter === 'completed') return task.completed;
        });
        renderTasks(filteredTasks);
    }

    // Render tasks
    function renderTasks(tasksToRender = tasks) {
        todoList.innerHTML = '';
        tasksToRender.forEach((task, index) => {
            createTaskElement(task, index);
        });
        updateTaskCounts();
        saveTasks();
    }

    // Create task element
    function createTaskElement(task, index) {
        const taskElement = document.createElement('div');
        taskElement.className = `todo-item ${task.completed ? 'completed' : ''}`;
        taskElement.setAttribute('data-priority', task.priority);
        
        taskElement.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${task.completed ? 'checked' : ''}>
            <span class="todo-text">${task.text}</span>
            <div class="priority-indicator" style="color: var(--priority-${task.priority})">
                ${task.priority === 'high' ? '⬆️' : task.priority === 'medium' ? '➡️' : '⬇️'}
            </div>
            <div class="todo-actions">
                <button class="edit-btn">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        // Add task completion date if completed
        if (task.completed && task.completedDate) {
            const dateElement = document.createElement('div');
            dateElement.className = 'completion-date';
            dateElement.textContent = new Date(task.completedDate).toLocaleDateString();
            taskElement.appendChild(dateElement);
        }

        // Checkbox event
        const checkbox = taskElement.querySelector('.todo-checkbox');
        checkbox.addEventListener('change', () => {
            tasks[index].completed = checkbox.checked;
            tasks[index].completedDate = checkbox.checked ? new Date().toISOString() : null;
            taskElement.classList.toggle('completed');
            updateTaskCounts();
            saveTasks();
        });

        // Edit button event
        const editBtn = taskElement.querySelector('.edit-btn');
        editBtn.addEventListener('click', () => {
            const taskText = taskElement.querySelector('.todo-text');
            const newText = prompt('Edit task:', task.text);
            if (newText !== null && newText.trim() !== '') {
                tasks[index].text = newText.trim();
                taskText.textContent = newText.trim();
                saveTasks();
            }
        });

        // Delete button event with animation
        const deleteBtn = taskElement.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this task?')) {
                taskElement.style.animation = 'slideOut 0.3s ease forwards';
                setTimeout(() => {
                    tasks.splice(index, 1);
                    renderTasks();
                }, 300);
            }
        });

        todoList.appendChild(taskElement);
    }

    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Add new task
    function addTask(text) {
        if (text.trim() !== '') {
            const newTask = {
                text: text.trim(),
                completed: false,
                priority: selectedPriority,
                createdDate: new Date().toISOString(),
                completedDate: null
            };
            tasks.unshift(newTask); // Add to beginning of array
            renderTasks();
            taskInput.value = '';
            updateQuote();
        }
    }

    // Event listeners
    addTaskButton.addEventListener('click', () => {
        addTask(taskInput.value);
    });

    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask(taskInput.value);
        }
    });

    // Theme toggle
    themeToggle.addEventListener('click', () => {
        const newTheme = document.body.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.innerHTML = newTheme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    });

    // Filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.getAttribute('data-filter');
            filterTasks(currentFilter);
        });
    });

    // Priority buttons
    priorityButtons.forEach(button => {
        button.addEventListener('click', () => {
            priorityButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            selectedPriority = button.getAttribute('data-priority');
        });
    });

    // Initial render
    renderTasks();
    updateQuote();
}); 
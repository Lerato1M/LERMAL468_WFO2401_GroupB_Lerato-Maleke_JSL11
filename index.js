// Import helper functions from utils/taskFunctions.js
import { getTasks, createNewTask, putTask, deleteTask } from './utils/taskFunctions.js';
import { initialData } from './initialData.js';

// Initialize data if not already present in localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData));
    localStorage.setItem('showSideBar', 'true');
  } else {
    console.log('Data already exists in localStorage');
  }
}

// Get elements from the DOM
const elements = {
  // Sidebar elements
  sideBarDiv: document.getElementById('side-bar-div'),
  showSideBarBtn: document.getElementById('show-side-bar-btn'),

  // Main layout
  addNewTaskBtn: document.getElementById('add-new-task-btn'),

  // New Task modal 
  newTaskModalWindow: document.getElementById('new-task-modal-window'),
  titleInput: document.getElementById('title-input'),
  descInput: document.getElementById('desc-input'),
  selectStatus: document.getElementById('select-status'),

  // Edit Task modal
  editTaskModalWindow: document.querySelector('.edit-task-modal-window'),
  editTaskTitleInput: document.getElementById('edit-task-title-input'),
  editTaskDescInput: document.getElementById('edit-task-desc-input'),
  editSelectStatus: document.getElementById('edit-select-status'),

  // Filter Div
  filterDiv: document.getElementById('filterDiv'),

  // Additional elements (add as needed)
  headerBoardName: document.getElementById('header-board-name'), // Assuming it exists in your HTML
  columnDivs: document.querySelectorAll('.column-div') // Assuming you have elements with class "column-div"
};

let activeBoard = "";

function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);

  if (boards.length > 0) {
    activeBoard = JSON.parse(localStorage.getItem("activeBoard")) || boards[0];
    elements.headerBoardName.textContent = activeBoard;
    styleActiveBoard(activeBoard);
    refreshTasksUI();
  }
}

function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = '';
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener('click', () => {
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board;
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
      styleActiveBoard(activeBoard);
    });
    boardsContainer.appendChild(boardElement);
  });
}

function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks();
  const filteredTasks = tasks.filter(task => task.board === boardName);

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    let columnTitle = status.toUpperCase();
    column.querySelector(".columnHeader").textContent = columnTitle;

    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${columnTitle}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task.status === status).forEach(task => {
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);
      taskElement.addEventListener('click', () => {
        openEditTaskModal(task);
      });
      tasksContainer.appendChild(taskElement);
    });
  });
}

function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent === boardName);
  });
}

function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`);
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title;
  taskElement.setAttribute('data-task-id', task.id);

  tasksContainer.appendChild(taskElement);
}

function setupEventListeners() {
  // Event listeners setup
  function setupEventListeners() {
    // Add event listener for the "Add New Task" button
    elements.addNewTaskBtn.addEventListener('click', () => {
      toggleModal(true, elements.newTaskModalWindow);
    });
  
    // Add event listener for the form submission to add a new task
    elements.newTaskModalWindow.querySelector('form').addEventListener('submit', addTask);
  
    // Add event listener for the "Show Sidebar" button
    elements.showSideBarBtn.addEventListener('click', () => {
      toggleSidebar(true);
    });
  
    // Add event listener for closing the sidebar
    document.addEventListener('click', (event) => {
      if (!elements.sideBarDiv.contains(event.target) && !elements.showSideBarBtn.contains(event.target)) {
        toggleSidebar(false);
      }
    });
  
    // Add event listener for toggling the theme
    document.getElementById('toggle-theme-btn').addEventListener('click', toggleTheme);
  
    // Add event listener for closing modals when clicking outside
    window.addEventListener('click', (event) => {
      if (event.target === elements.newTaskModalWindow) {
        toggleModal(false, elements.newTaskModalWindow);
      }
      if (event.target === elements.editTaskModalWindow) {
        toggleModal(false, elements.editTaskModalWindow);
      }
    });
  }
  
}

function toggleModal(show, modal = elements.newTaskModalWindow) {
  modal.style.display = show ? 'block' : 'none';
}

function addTask(event) {
  event.preventDefault();

  const titleInput = elements.titleInput.value;
  const descInput = elements.descInput.value;
  const statusInput = elements.selectStatus.value;

  const task = {
    title: titleInput,
    description: descInput,
    status: statusInput,
  };

  const newTask = createNewTask(task);
  if (newTask) {
    addTaskToUI(newTask);
    toggleModal(false, elements.newTaskModalWindow);
    elements.filterDiv.style.display = 'none';
    event.target.reset();
    refreshTasksUI();
  }
}

function toggleSidebar(show) {
  const sideBarDiv = elements.sideBarDiv;
  const showSideBarBtn = elements.showSideBarBtn;

  if (show) {
    sideBarDiv.style.display = 'block';
    showSideBarBtn.style.display = 'none';
  } else {
    sideBarDiv.style.display = 'none';
    showSideBarBtn.style.display = 'block';
  }
}

function toggleTheme() {
  // Check if body has dark-theme class
  const isDarkTheme = document.body.classList.contains('dark-theme');
  
  // Toggle between light and dark themes
  if (isDarkTheme) {
    // Switch to light theme
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
  } else {
    // Switch to dark theme
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
  }
}




//task Modal
function openEditTaskModal(task) {
  const editTaskTitleInput = elements.editTaskTitleInput;
  const editTaskDescInput = elements.editTaskDescInput;
  const editTaskStatusInput = elements.editSelectStatus;

  editTaskTitleInput.value = task.title;
  editTaskDescInput.value = task.description;
  editTaskStatusInput.value = task.status;

  const saveChangesBtn = elements.editTaskModalWindow.querySelector('#save-task-changes-btn');
  const deleteTaskBtn = elements.editTaskModalWindow.querySelector('#delete-task-btn');

  saveChangesBtn.addEventListener('click', () => {
    saveTaskChanges(task.id);
  });

  deleteTaskBtn.addEventListener('click', () => {
    deleteTask(task.id);
    toggleModal(false, elements.editTaskModalWindow);
  });

  toggleModal(true, elements.editTaskModalWindow);
}

function saveTaskChanges(taskId) {
  const editTaskTitleInput = elements.editTaskTitleInput.value;
  const editTaskDescInput = elements.editTaskDescInput.value;
  const editTaskStatusInput = elements.editSelectStatus.value;

  const updatedTask = {
    id: taskId,
    title: editTaskTitleInput,
    description: editTaskDescInput,
    status: editTaskStatusInput
  };

  putTask(taskId, updatedTask);

  toggleModal(false, elements.editTaskModalWindow);
  refreshTasksUI();
}

document.addEventListener('DOMContentLoaded', function () {
  init();
});

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  initializeData(); // Callto load initial data
  fetchAndDisplayBoardsAndTasks(); // Call to display initial data
}

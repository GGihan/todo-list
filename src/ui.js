import { ProjectManager } from './index.js';
import { ProjectFactory } from './projectFactory.js';
import { TodoFactory } from './todoFactory.js';
import { format, parseISO } from 'date-fns';

const UIManager = (() => {

    const mainContent = document.getElementById('main-content');
    const addProjectButton = document.getElementById('add-project-button');
    const addTodoModal = document.getElementById('add-todo-modal');
    const addTodoForm = document.getElementById('add-todo-form');
    const cancelTodoButton = document.getElementById('cancel-todo-button');
    const projectIdInput = document.getElementById('project-id-for-todo');
    const addProjectModal = document.getElementById('add-project-modal');
    const addProjectForm = document.getElementById('add-project-form');
    const cancelProjectButton = document.getElementById('cancel-project-button');


    const handleTodoClick = (e, todo, project, projectCard) => {

        const todoElement = e.currentTarget;
        const expandedView = createExpandedTodoElement(todo, project, projectCard);

        todoElement.replaceWith(expandedView);
    };


    const handleCloseTodo = (e, todo, project, projectCard) => {
        const expandedTodoElement = e.currentTarget.closest('.todo-expanded');

        if (expandedTodoElement) {
            const simpleTodoElement = createTodoElement(todo, project, projectCard);
            expandedTodoElement.replaceWith(simpleTodoElement);
        }


    };

    const handleAddTodoClick = (project) => {
        projectIdInput.value = project.id;
        addTodoModal.classList.add('active');
    };

    const handleTodoFormSubmit = (e) => {
        e.preventDefault(); // Prevent page refresh

        const projectId = projectIdInput.value;
        const title = addTodoForm.elements.title.value;
        const description = addTodoForm.elements.description.value;
        const dueDate = addTodoForm.elements.dueDate.value;
        const priority = addTodoForm.elements.priority.value;
        
       
        const newTodo = TodoFactory(title, description, dueDate, priority);
        
       
        ProjectManager.addProjectTodo(projectId, newTodo);
        
        addTodoForm.reset();
        addTodoModal.classList.remove('active');
        renderAllProjects();
    };

    const handleProjectFormSubmit = (e) => {
        e.preventDefault();

        const title = addProjectForm.elements.title.value;
        const description = addProjectForm.elements.description.value;

        const newProject = ProjectFactory(title, description);

        ProjectManager.addProject(newProject);

        addProjectForm.reset();
        addProjectModal.classList.remove('active');
        renderAllProjects();
    };


    const createTodoElement = (todo, project, projectCard) => {
        const todoDiv = document.createElement('div');
        todoDiv.classList.add('todo');
        todoDiv.setAttribute('data-todo-id', todo.id);

        const details = todo.getDetails();

        const title = document.createElement('p');
        title.textContent = details.title;
        
        const dueDate = document.createElement('p');
        
        dueDate.textContent = format(parseISO(details.dueDate), 'MMM do');

        todoDiv.append(title, dueDate);

        todoDiv.addEventListener('click', (e) => handleTodoClick(e, todo, project, projectCard));

        return todoDiv;
    };

    const createExpandedTodoElement = (todo, project, projectCard) => {
        const expandedDiv = document.createElement('div');
        expandedDiv.classList.add('todo-expanded');
        const details = todo.getDetails();

        expandedDiv.innerHTML = `
            <ul class="todo-details">
                <li><p><strong>Title:</strong> ${details.title}</p></li>
                <li><p><strong>Description:</strong> ${details.description}</p></li>
                <li><p><strong>Due:</strong> ${format(parseISO(details.dueDate), 'PPPP')}</p></li>
                <li><p><strong>Priority:</strong> ${details.priority}</p></li>
                <li><p><strong>Notes:</strong> ${details.notes || 'N/A'}</p></li>
                <li><p><strong>Status:</strong> ${details.isComplete ? 'Complete' : 'Incomplete'}</p></li>
            </ul>
            <div class="todo-expanded-buttons">
                <button type="button" class="remove-todo-button">Remove</button>
                <button type="button" class="close-todo-button">Close</button>
            </div>
        `;

        const removeBtn = expandedDiv.querySelector('.remove-todo-button');
        removeBtn.addEventListener('click', () => {
            ProjectManager.removeProjectTodo(project.id, todo.id);
            renderProject(project, projectCard);
        });

        const closeBtn = expandedDiv.querySelector('.close-todo-button');
        closeBtn.addEventListener('click', (e) => handleCloseTodo(e, todo, project, projectCard));


        removeBtn.id = 'remove-todo-button';
        closeBtn.id = 'close-todo-button';

        return expandedDiv;
    };

    const createProjectCard = (project) => {
        const projectCard = document.createElement('div');
        projectCard.classList.add('project');
        projectCard.setAttribute('data-project-id', project.id);

        renderProject(project, projectCard);
        return projectCard;
    };

    const renderProject = (project, projectCardElement) => {
        
        projectCardElement.innerHTML = ''; 

        // Project details
        const title = document.createElement('h2');
        title.textContent = project.getTitle();
        const hr1 = document.createElement('hr');
        const description = document.createElement('p');
        description.textContent = project.getDescription();
        const hr2 = document.createElement('hr');
        const todosContainer = document.createElement('div');
        todosContainer.classList.add('todos');

        // Render todos
        project.getTodos().forEach(todo => {
            const todoElement = createTodoElement(todo, project, projectCardElement);
            todosContainer.appendChild(todoElement);
        });

        // Add Todo button
        const todoButtons = document.createElement('div');
        todoButtons.classList.add('todo-buttons');
        const addTodoBtn = document.createElement('button');
        addTodoBtn.type = 'button';
        addTodoBtn.id = 'add-todo-button';
        addTodoBtn.textContent = '+';
        todoButtons.appendChild(addTodoBtn);

        addTodoBtn.addEventListener('click', () => handleAddTodoClick(project));
        projectCardElement.append(title, hr1, description, hr2, todosContainer, todoButtons);
    };

    const renderAllProjects = () => {
        mainContent.innerHTML = '';
        const projects = ProjectManager.getAllProjects();
        projects.forEach(project => {
            const projectCard = createProjectCard(project);
            mainContent.appendChild(projectCard);
        });
    };
    
    const init = () => {
        addProjectButton.addEventListener('click', () => {
            addProjectModal.classList.add('active');  
        });

        cancelProjectButton.addEventListener('click', () => {
            addProjectForm.reset();
            addProjectModal.classList.remove('active');
        });

        addProjectForm.addEventListener('submit', handleProjectFormSubmit);

        cancelTodoButton.addEventListener('click', () => {
            addTodoForm.reset();
            addTodoModal.classList.remove('active');
        });

        addTodoForm.addEventListener('submit', handleTodoFormSubmit);

        renderAllProjects();
    };

    return { init };

})();

export { UIManager };
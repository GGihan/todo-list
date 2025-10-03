import { ProjectManager } from './index.js';
import { TodoFactory } from './todoFactory.js';
import { format, parseISO } from 'date-fns';

const UIManager = (() => {

    const mainContent = document.getElementById('main-content');
    const addProjectButton = document.getElementById('add-project-button');


    const handleTodoClick = (e, todo, project, projectCard) => {

        const todoElement = e.currentTarget;
        const expandedView = createExpandedTodoElement(todo, project, projectCard);

        todoElement.replaceWith(expandedView);
    };


    const handleCloseTodo = (todo, project, projectCard) => {
        renderProject(project, projectCard);
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
        closeBtn.addEventListener('click', () => handleCloseTodo(todo, project, projectCard));


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
            //  pop up a form to get new project details
            
        });

        renderAllProjects();
    };

    return { init };

})();

export { UIManager };
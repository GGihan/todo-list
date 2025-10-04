import { ProjectManager } from './index.js';
import { ProjectFactory } from './projectFactory.js';
import { TodoFactory } from './todoFactory.js';
import { format, parseISO } from 'date-fns';

const UIManager = (() => {

    let selectedProjectId = null;

    const mainContent = document.getElementById('main-content');
    const addProjectButton = document.getElementById('add-project-button');
    const editProjectButton = document.getElementById('edit-project-button');
    const removeProjectButton = document.getElementById('remove-project-button');
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

    const handleProjectSelection = (project, projectCard) => {
        selectedProjectId = project.id;

        document.querySelectorAll('.project').forEach(card => {
            card.classList.remove('selected');
        });

        projectCard.classList.add('selected');
    };

    const handleProjectFormSubmit = (e) => {
        e.preventDefault();

        const title = addProjectForm.elements.title.value;
        const description = addProjectForm.elements.description.value;


        if (selectedProjectId) {
            ProjectManager.editProject(selectedProjectId, { title, description });
        } else {
            const newProject = ProjectFactory(title, description);
            ProjectManager.addProject(newProject);
        }

        resetProjectModal();
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

    const resetProjectModal = () => {
        addProjectForm.reset();
        addProjectModal.classList.remove('active');
        
        addProjectModal.querySelector('h2').textContent = 'New Project';
        addProjectModal.querySelector('button[type="submit"]').textContent = 'Add Project';
        selectedProjectId = null;
    }

    const createProjectCard = (project) => {
        const projectCard = document.createElement('div');
        projectCard.classList.add('project');
        projectCard.setAttribute('data-project-id', project.id);

        renderProject(project, projectCard);

        projectCard.addEventListener('click', () => handleProjectSelection(project, projectCard));

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

        if (selectedProjectId) {
            const selectedCard = document.querySelector(`[data-project-id="${selectedProjectId}"]`);
            if (selectedCard) {
                selectedCard.classList.add('selected');
            }
        }
    };
    
    const init = () => {
        addProjectButton.addEventListener('click', () => {
            resetProjectModal();
            addProjectModal.classList.add('active');  
        });

        editProjectButton.addEventListener('click', () => {
            if (!selectedProjectId) {
                alert('Please select a project to edit first!');
                return;
            }
            const projectToEdit = ProjectManager.getAllProjects().find(p => p.id === selectedProjectId);
            if (projectToEdit) {
               
                addProjectForm.elements.title.value = projectToEdit.getTitle();
                addProjectForm.elements.description.value = projectToEdit.getDescription();
                
                addProjectModal.querySelector('h2').textContent = 'Edit Project';
                addProjectModal.querySelector('button[type="submit"]').textContent = 'Save Changes';

                addProjectModal.classList.add('active');
            }
        });

        removeProjectButton.addEventListener('click', () => {
            
            if (!selectedProjectId) {
                alert('Please select a project to remove first!');
                return;
            }

            const inboxProject = ProjectManager.getInboxProject();
            if (selectedProjectId === inboxProject.id) {
                alert('The default "Inbox" project cannot be removed.');
                return;
            }

            const projectToRemove = ProjectManager.getAllProjects().find(p => p.id === selectedProjectId);
            const isConfirmed = confirm(`Are you sure you want to remove the project "${projectToRemove.getTitle()}"?`);

            if (isConfirmed) {
                ProjectManager.removeProject(selectedProjectId);
                selectedProjectId = null; 
                renderAllProjects();
            }
        });


        cancelProjectButton.addEventListener('click', resetProjectModal);

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
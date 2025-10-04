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

    const makeEditable = (element, todo, project, projectCard, propertyKey) => {
        element.addEventListener('click', () => {
            const currentValue = todo.getDetails()[propertyKey];
            let inputElement;

            // Create the correct type of input field based on the property
            if (propertyKey === 'description' || propertyKey === 'notes') {
                inputElement = document.createElement('textarea');
                inputElement.style.height = '80px';

            } else if (propertyKey === 'dueDate') {
                inputElement = document.createElement('input');
                inputElement.type = 'date';

            } else if (propertyKey === 'priority') {
                inputElement = document.createElement('select');
                ['low', 'medium', 'high'].forEach(optionValue => {
                    const option = document.createElement('option');
                    option.value = optionValue;
                    option.textContent = optionValue.charAt(0).toUpperCase() + optionValue.slice(1);
                    if (optionValue === currentValue) {
                        option.selected = true;
                    }
                    inputElement.appendChild(option);
                });

            } else { 
                inputElement = document.createElement('input');
                inputElement.type = 'text';
            }
            
            inputElement.value = currentValue;
            element.replaceWith(inputElement);
            inputElement.focus();

            
            const saveChanges = () => {
                const newValue = inputElement.value;
                if (newValue !== currentValue) {
                    ProjectManager.editProjectTodo(project.id, todo.id, { [propertyKey]: newValue });
                }
                
                renderProject(project, projectCard);
            };

            
            inputElement.addEventListener('blur', saveChanges);

            inputElement.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && inputElement.type !== 'textarea') {
                    saveChanges();
                }
            });

        });

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

        
        const detailsList = document.createElement('ul');
        detailsList.classList.add('todo-details');

        // Title
        const titleLi = document.createElement('li');
        const titleP = document.createElement('p');
        titleP.innerHTML = `<strong>Title:</strong> ${details.title}`;
        titleLi.appendChild(titleP);
        makeEditable(titleP, todo, project, projectCard, 'title');

        // Description
        const descLi = document.createElement('li');
        const descP = document.createElement('p');
        descP.innerHTML = `<strong>Description:</strong> ${details.description}`;
        descLi.appendChild(descP);
        makeEditable(descP, todo, project, projectCard, 'description');

        // Due Date
        const dateLi = document.createElement('li');
        const dateP = document.createElement('p');
        dateP.innerHTML = `<strong>Due:</strong> ${format(parseISO(details.dueDate), 'PPPP')}`;
        dateLi.appendChild(dateP);
        makeEditable(dateP, todo, project, projectCard, 'dueDate');

        // Priority
        const priorityLi = document.createElement('li');
        const priorityP = document.createElement('p');
        priorityP.innerHTML = `<strong>Priority:</strong> ${details.priority}`;
        priorityLi.appendChild(priorityP);
        makeEditable(priorityP, todo, project, projectCard, 'priority');

        // Notes
        const notesLi = document.createElement('li');
        const notesP = document.createElement('p');
        notesP.innerHTML = `<strong>Notes:</strong> ${details.notes || 'N/A'}`;
        notesLi.appendChild(notesP);
        makeEditable(notesP, todo, project, projectCard, 'notes');

        // Status
        const statusLi = document.createElement('li');
        const statusP = document.createElement('p');
        statusP.innerHTML = `<strong>Status:</strong> ${details.isComplete ? 'Complete ✅' : 'Incomplete ⏳'}`;
        statusP.style.cursor = 'pointer';
        statusLi.appendChild(statusP);

        // Status Listener
        statusP.addEventListener('click', () => {
            ProjectManager.editProjectTodo(project.id, todo.id, { isComplete: !details.isComplete });
            renderProject(project, projectCard);
        });


        detailsList.append(titleLi, descLi, dateLi, priorityLi, notesLi, statusLi);
        
        // Buttons container
        const buttonsDiv = document.createElement('div');
        buttonsDiv.classList.add('todo-expanded-buttons');
        buttonsDiv.innerHTML = `
            <button type="button" class="remove-todo-button" id="remove-todo-button">Remove</button>
            <button type="button" class="close-todo-button" id="close-todo-button">Close</button>
        `;

        expandedDiv.append(detailsList, buttonsDiv);

        const removeBtn = expandedDiv.querySelector('.remove-todo-button');
        removeBtn.addEventListener('click', () => {
            ProjectManager.removeProjectTodo(project.id, todo.id);
            renderProject(project, projectCard);
        });

        const closeBtn = expandedDiv.querySelector('.close-todo-button');
        closeBtn.addEventListener('click', (e) => handleCloseTodo(e, todo, project, projectCard));

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
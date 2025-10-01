import { ProjectFactory } from "./projectFactory";
import { TodoFactory } from "./todoFactory";
import "./styles.css";
import { 
    format, 
    formatDistanceToNow, 
    isToday, 
    isPast, 
    parseISO, 
    startOfDay 
} from 'date-fns';


// Testing so it doesnt crash when it isnt available.
function storageAvailable(type) {
    let storage;
    try {
        storage = window[type];
        const x = "__storage_test__";
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
        } catch (e) {
        return (
            e instanceof DOMException &&
            e.name === "QuotaExceededError" &&
            // acknowledge QuotaExceededError only if there's something already stored
            storage &&
            storage.length !== 0
        );
    }
};


let defaultProject = null;

const getDefaultProject = () => {
    if (defaultProject === null) {
        defaultProject = ProjectFactory("Inbox", "The default project for all new tasks");

        const initialTodo = TodoFactory(
            "Welcome Task", 
            "Start by creating your own projects!", 
            format(new Date(), 'yyyy-MM-dd'),
            "high"
        );
        defaultProject.addTodo(initialTodo);
    }

    return defaultProject;
};



let projectsState = [];
const STORAGE_KEY = 'todoAppProjects';


const ProjectManager = (() => {

    const save = () => {
        if (!storageAvailable('localStorage')) return;

        const serializableData = projectsState.map(project => {
            return {
                id: project.id,
                title: project.getTitle(),
                description: project.getDescription(),
                todos: project.getTodos().map(todo => todo.getDetails()),
            };
        });

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(serializableData));
            console.log('Data saved.');
        } catch (e) {
            console.error('Error saving to localStorage:', e);
        }
    };


    const load = () => {
        if (!storageAvailable('localStorage')) return;

        const jsonString = localStorage.getItem(STORAGE_KEY);
        
        // Signal that no data was loaded
        if (!jsonString) return false; 

        try {
            const loadedData = JSON.parse(jsonString);

            projectsState = loadedData.map(projectData => {
                const newProject = ProjectFactory(projectData.title, projectData.description);

                projectData.todos.forEach(todoData => {
                    const newTodo = TodoFactory(
                        todoData.title,
                        todoData.description,
                        todoData.dueDate,
                        todoData.priority,
                    );

                    newTodo.setNotes(todoData.notes);
                    if (todoData.isComplete) newTodo.toggleComplete();

                    newProject.addTodo(newTodo);
                });
                return newProject;
            });
            console.log(`Successfully loaded ${projectsState.length} projects.`);
            return true;
        } catch (e) {
            console.error('Error loading Data:', e);
            return false;
        }
    };

    
    const init = () => {
        const loaded = load();
        if (!loaded || projectsState.length === 0) {
            projectsState.push(getDefaultProject());
            save();
        }
    };

    const addProject = (project) => {
        projectsState.push(project);
        save();
    };

    const addProjectTodo = (projectId, todo) => {
        const project = projectsState.find(p => p.id === projectId);
        if (project) {
            project.addTodo(todo);
            save();
        }
    };

    const removeProject = (projectId) => {
        const index = projectsState.findIndex(p => p.id === projectId);

        if (index > 0) {
            projectsState.splice(index, 1);
            save();
        } else if (index === 0) {
            console.warn('Cannot remove the default Inbox project.');
        }
    };

    const removeProjectTodo = (projectId, todoId) => {
        const project = projectsState.find(p => p.id === projectId);

        if (project) {
            project.removeTodo(todoId);
            save();
        }
    };

    const editProjectTodo = (projectId, todoId, updates) => {
        const project = projectsState.find(p => p.id === projectId);

        if (project) {
            project.editTodo(todoId, updates);
            save();
        }
    };

    const getAllProjects = () => [...projectsState];
    const getInboxProject = () => projectsState[0];

    return {
        init,
        addProject,
        addProjectTodo,
        removeProject,
        removeProjectTodo,
        editProjectTodo,
        getAllProjects,
        getInboxProject,
    };

})();

// Application Initialization

if (storageAvailable('localStorage')) {
    console.log("Local Storage is available.");
} else {
    console.log("Local storage is NOT available. Data will not persist.");
}

ProjectManager.init();
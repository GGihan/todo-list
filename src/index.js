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

// Application Initialization

if (storageAvailable('localStorage')) {
    console.log("Local Storage is available.");
} else {
    console.log("Local storage is NOT available. Data will not persist.");
}

const inboxProject = getDefaultProject();

const newTask = TodoFactory(
    "New Habit", 
    "Start drinking more water.", 
    format(new Date(), 'yyyy-MM-dd'),
    "medium"
);

inboxProject.addTodo(newTask);
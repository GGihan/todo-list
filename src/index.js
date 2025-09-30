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

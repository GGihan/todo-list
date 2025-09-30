const TodoFactory = (title, description, dueDate, priority) => {

    const id = crypto.randomUUID();

    let todoTitle = title;
    let todoDescription = description;
    let todoDueDate = dueDate;
    let todoPriority = priority;
    let todoNotes = "";
    let todoChecklist = [];
    let isComplete = false;

    const getDetails = () => ({
        id: id,
        title: todoTitle,
        description: todoDescription,
        dueDate: todoDueDate,
        priority: todoPriority,
        notes: todoNotes,
        checklist: [...todoChecklist],
        isComplete: isComplete,
    });

    const setTitle = (newTitle) => { todoTitle = newTitle };
    const setDescription = (newDescription) => { todoDescription = newDescription };
    const setDueDate = (newDate) => { todoDueDate = newDate };
    const setPriority = (newPriority) => { todoPriority = newPriority };
    const setNotes = (newNotes) => { todoNotes = newNotes };
    const toggleComplete = () => { isComplete = !isComplete };

    const addChecklistItem = (text) => {
        todoChecklist.push({ text, completed: false });
    };

    const toggleChecklistItem = (index) => {
        if (todoChecklist[index]) {
            todoChecklist[index].completed = !todoChecklist[index].completed;
        }
    };

    return {
        id,
        getDetails,
        setTitle,
        setDescription,
        setDueDate,
        setPriority,
        setNotes,
        toggleComplete,
        addChecklistItem,
        toggleChecklistItem,
    };
};

export { TodoFactory };
const ProjectFactory = (title, description = "") => {
    
    const id = crypto.randomUUID();

    let todos = [];

    const getTitle = () => title;
    const getDescription = () => description;
    const getTodos = () => [...todos];

    const addTodo = (todoItem) => {
        todos.push(todoItem);
    };

    const removeTodo = (todoId) => {
        todos = todos.filter(todo => todo.id !== todoId);
    };

    const editTodo = (todoId, updates) => {
        const todoIndex = todos.findIndex(todo => todo.id === todoId);

        if (todoIndex === -1) {
            console.error(`Todo with ID ${todoId} not found in project ${title}.`);
            return;
        };

        const todoToUpdate = todos[todoIndex];

        const setterMap = {
            title: 'setTitle',
            description: 'setDescription',
            dueDate: 'setDueDate',
            priority: 'setPriority',
            notes: 'setNotes',
            isComplete: 'toggleComplete',
        };

        Object.keys(updates).forEach(key => {
            const setterName = setterMap[key];
            const newValue = updates[key];

            // Check if we have a valid setter function for this key
            if (setterName && typeof todoToUpdate[setterName] === 'function') {
                todoToUpdate[setterName](newValue);
            }
        });

    };

    return {
        id,
        getTitle,
        getDescription,
        getTodos,
        addTodo,
        removeTodo,
        editTodo,
    };
};

export { ProjectFactory };
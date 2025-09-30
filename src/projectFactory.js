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

    return {
        id,
        getTitle,
        getDescription,
        getTodos,
        addTodo,
        removeTodo,
    };
};

export { ProjectFactory };
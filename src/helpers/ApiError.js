class ApiError extends Error{
    constructor(
        code,
        message = "Something Went Wrong",
        errors = [],
    ){
        super(message);
        this.code = code;
        this.errors = errors;
        this.success = false;
        this.data = null;
    }
}

export { ApiError };
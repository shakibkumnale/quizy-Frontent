class ApiResponse{
    constructor( 
        statusCode,
         data , 
        message="success"
    ){
        this.statusCode=statusCode;
        this.data=data;
        this.message=message;
        this.success=statusCode<400; // if status code more than 400 this eventually 

    }
}
export {ApiResponse}
import { catchAsync } from '../middlewares/errorMiddleware.js';
class csrfTokenController{

    /**
     * to get csrf token for for post request validation
     * 
     */
    static getCsrfToken = catchAsync( async (req, res, next) => {

        const newCsrfToken = req.csrfToken();
        res.json({ csrfToken: newCsrfToken });
    });
    
}

export default csrfTokenController;

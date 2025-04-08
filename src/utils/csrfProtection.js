import csurf from 'csurf';

const csrf_protection = csurf({
    cookie: false,  
  });

export default csrf_protection;
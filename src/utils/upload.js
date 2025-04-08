import { storage } from '../storage/storage.js';
import multer from 'multer'

const upload = multer({ storage });

export default upload;

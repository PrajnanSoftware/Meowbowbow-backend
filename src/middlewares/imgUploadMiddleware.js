import multer from "multer";

const storage = multer.memoryStorage()
// new CloudinaryStorage({
//     cloudinary,
//     params: {
//       folder: "products", // Cloudinary folder
//       allowed_formats: ["jpg", "png", "jpeg"],
//       transformation: [{ width: 500, height: 500, crop: "limit" }],
//     },
// });

const fileFilter = (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
        return cb(new Error("Only image files are allowed!"), false);
    } else {
        cb(null, true);
    }
};

const upload = multer({ 
    storage,
    limits: { 
        fileSize: 5 * 1024 * 1024,
        files: 5
    },
    fileFilter,
 }).fields([{ name: 'images', maxCount: 5 }, { name: 'image', maxCount: 5 }]);;

export default upload;
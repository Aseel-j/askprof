import multer from "multer";

// الامتدادات المسموحة
export const fileValidation = {
    image: ['image/png', 'image/jpeg', 'image/webp'],
    video: ['video/mp4', 'video/mpeg']
};

function fileUpload(customValidation = []) {
    const storage = multer.diskStorage({});

    function fileFilter(req, file, cb) {
        if (customValidation.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid format"), false);
        }
    }

    const upload = multer({ fileFilter, storage });
    return upload;
}

export default fileUpload;

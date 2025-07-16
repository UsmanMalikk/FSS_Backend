// routes/employees.ts or similar
const express = require("express");
const { uploadProfilePhotoMiddleware } = require("../middleware/uploadProfilePhoto");
const { uploadProfilePhotoHandler } = require("../controller/employees");

const router = express.Router();

router.post("/upload-profile-photo", uploadProfilePhotoMiddleware, uploadProfilePhotoHandler);
module.exports = router;
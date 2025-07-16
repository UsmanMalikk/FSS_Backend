// controllers/employees.ts
module.exports.uploadProfilePhotoHandler = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    res.json({ url: file.path }); // This is the Cloudinary URL
  } catch (error) {
    console.error("Profile photo upload failed:", error);
    res.status(500).json({ error: "Failed to upload profile photo" });
  }
};

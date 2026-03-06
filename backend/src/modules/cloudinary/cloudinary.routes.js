const router = require("express").Router();
const { getSignature, getFolders } = require("./cloudinary.controller");
const authenticate = require("../../middleware/authenticate");

// GET /api/cloudinary/folders — list available folder types (public info)
router.get("/folders", getFolders);

// GET /api/cloudinary/sign?type=product — get upload signature (authenticated)
router.get("/sign", authenticate, getSignature);

module.exports = router;

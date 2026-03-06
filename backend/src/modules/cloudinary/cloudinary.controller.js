const { cloudinary } = require("../../config/cloudinary");
const asyncHandler = require("../../utils/asyncHandler");
const ApiError = require("../../utils/ApiError");

/**
 * Cloudinary folder structure for CartNest:
 *
 *   cartnest/
 *   ├── products/       ← product images
 *   ├── sellers/        ← seller logos
 *   ├── banners/        ← homepage / promo banners
 *   └── users/          ← user avatars (future)
 *
 * Frontend passes `type` query param to get the correct folder.
 */

// Allowed folder types mapped to their Cloudinary paths
const FOLDER_MAP = {
  product: "cartnest/products",
  seller: "cartnest/sellers",
  banner: "cartnest/banners",
  user: "cartnest/users",
};

/**
 * GET /api/cloudinary/sign?type=product
 * Generate a signed upload signature for frontend Cloudinary uploads.
 *
 * Query params:
 *   - type: 'product' | 'seller' | 'banner' | 'user' (default: 'product')
 *
 * The folder is determined automatically based on the type.
 * Frontend uploads to the returned folder, keeping images organized.
 */
const getSignature = asyncHandler(async (req, res) => {
  if (!process.env.CLOUDINARY_API_SECRET) {
    throw ApiError.internal("Cloudinary not configured");
  }

  const type = req.query.type || "product";
  const folder = FOLDER_MAP[type];

  if (!folder) {
    throw ApiError.badRequest(
      `Invalid upload type '${type}'. Allowed: ${Object.keys(FOLDER_MAP).join(", ")}`,
    );
  }

  const timestamp = Math.round(new Date().getTime() / 1000);

  const params = {
    timestamp,
    folder,
  };

  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET,
  );

  res.json({
    success: true,
    data: {
      timestamp,
      signature,
      folder,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    },
  });
});

/**
 * GET /api/cloudinary/folders
 * Return the available upload folder types (for frontend reference).
 */
const getFolders = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      folders: FOLDER_MAP,
      usage: "Pass ?type=product|seller|banner|user to the /sign endpoint",
    },
  });
});

module.exports = { getSignature, getFolders, FOLDER_MAP };

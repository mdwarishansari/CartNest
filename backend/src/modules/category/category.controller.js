const Category = require("./category.model");
const asyncHandler = require("../../utils/asyncHandler");
const ApiError = require("../../utils/ApiError");
const { generateCleanSlug, generateSlug } = require("../../utils/slugify");

/**
 * GET /api/categories
 * List all categories (public).
 */
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 }).select("-__v");

  res.json({ success: true, data: { categories } });
});

/**
 * GET /api/categories/:slug
 * Get a single category by slug.
 */
const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) throw ApiError.notFound("Category not found");

  res.json({ success: true, data: { category } });
});

/**
 * POST /api/categories (admin)
 * Create a new category.
 */
const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  let slug = generateCleanSlug(name);
  const existing = await Category.findOne({ slug });
  if (existing) throw ApiError.conflict(`Category '${name}' already exists`);

  const category = await Category.create({
    name,
    slug,
    description: description || "",
    createdBy: req.user.id,
  });

  res.status(201).json({
    success: true,
    message: "Category created",
    data: { category },
  });
});

/**
 * PUT /api/categories/:id (admin)
 * Update a category.
 */
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw ApiError.notFound("Category not found");

  const { name, description } = req.body;

  if (name) {
    category.name = name;
    let slug = generateCleanSlug(name);
    const existing = await Category.findOne({
      slug,
      _id: { $ne: category._id },
    });
    if (existing) slug = generateSlug(name);
    category.slug = slug;
  }
  if (description !== undefined) category.description = description;

  await category.save();

  res.json({
    success: true,
    message: "Category updated",
    data: { category },
  });
});

/**
 * DELETE /api/categories/:id (admin)
 * Delete a category.
 */
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw ApiError.notFound("Category not found");

  await category.deleteOne();

  res.json({ success: true, message: "Category deleted" });
});

module.exports = {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
};

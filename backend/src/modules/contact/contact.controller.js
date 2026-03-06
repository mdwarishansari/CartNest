const nodemailer = require("nodemailer");
const ContactQuery = require("./contactQuery.model");
const asyncHandler = require("../../utils/asyncHandler");
const ApiError = require("../../utils/ApiError");

/**
 * POST /api/contact
 * Submit a contact query (public or authenticated).
 */
const createQuery = asyncHandler(async (req, res) => {
  const { fromEmail, fromName, subject, message, productId } = req.body;

  const query = await ContactQuery.create({
    fromEmail: fromEmail || req.user?.email,
    fromName: fromName || req.user?.name || "Anonymous",
    subject,
    message,
    productId: productId || undefined,
  });

  res.status(201).json({
    success: true,
    message: "Query submitted successfully. We will get back to you soon.",
    data: { query },
  });
});

/**
 * GET /api/contact (admin)
 * List all contact queries.
 */
const getQueries = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;

  const filter = {};
  if (status) filter.status = status;

  const queries = await ContactQuery.find(filter)
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .populate("productId", "title slug")
    .populate("handledBy", "name email");

  const total = await ContactQuery.countDocuments(filter);

  res.json({
    success: true,
    data: {
      queries,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

/**
 * PUT /api/contact/:id/status (admin)
 * Update query status.
 */
const updateQueryStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const query = await ContactQuery.findById(req.params.id);
  if (!query) throw ApiError.notFound("Query not found");

  query.status = status;
  query.handledBy = req.user.id;
  await query.save();

  res.json({
    success: true,
    message: `Query status updated to '${status}'`,
    data: { query },
  });
});

/**
 * POST /api/contact/:id/reply (admin)
 * Reply to a contact query via email (SMTP).
 */
const replyToQuery = asyncHandler(async (req, res) => {
  const { replyMessage } = req.body;
  if (!replyMessage) throw ApiError.badRequest("Reply message is required");

  const query = await ContactQuery.findById(req.params.id);
  if (!query) throw ApiError.notFound("Query not found");

  // Check SMTP config
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    throw ApiError.internal("SMTP not configured. Cannot send email.");
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Send email
  await transporter.sendMail({
    from: `"${process.env.SITE_NAME || "CartNest"}" <${process.env.SMTP_USER}>`,
    to: query.fromEmail,
    subject: `Re: ${query.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">CartNest Support</h2>
        <p>Hi ${query.fromName},</p>
        <p>${replyMessage}</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #6b7280; font-size: 12px;">
          This is in response to your query: "${query.subject}"
        </p>
        <p style="color: #6b7280; font-size: 12px;">— ${process.env.SITE_NAME || "CartNest"} Team</p>
      </div>
    `,
  });

  // Update status
  query.status = "resolved";
  query.handledBy = req.user.id;
  await query.save();

  res.json({
    success: true,
    message: "Reply sent successfully",
    data: { query },
  });
});

module.exports = { createQuery, getQueries, updateQueryStatus, replyToQuery };

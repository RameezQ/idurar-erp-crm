const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema.Types;
const adminSchema = new Schema(
  {
    removed: {
      type: Boolean,
      default: false,
    },
    enabled: {
      type: Boolean,
      default: false,
    },
    picture: [
      {
        url: { type: String },
        name: { type: String },
        size: { type: Number },
        lastModifiedDate: { type: String },
        type: { type: String },
        uid: { type: String },
        status: { type: String },
        thumbUrl: { type: String },
        path: { type: String },
      },
    ],
    email: {
      type: String,
      lowercase: true,
      trim: true,
      required: true,
    },
    name: { type: String, required: true },
    surname: { type: String },
    photo: {
      type: String,
      trim: true,
    },
    created: {
      type: Date,
      default: Date.now,
    },
    powers: [
      {
        branchId: { type: ObjectId, ref: 'Branch' },
        permissions: [
          {
            type: ObjectId,
            ref: 'Permission',
          },
        ],
      },
    ],
    role: {
      type: String,
      default: 'employee',
      enum: ['owner', 'admin', 'manager', 'employee', 'create_only', 'read_only'],
    },
    cuId: { type: String },
    isBound: { type: Boolean, default: false },
    allowedCompanies: [
      {
        type: ObjectId,
        ref: 'Company',
        autopopulate: { select: 'name', maxDepth: 1 },
      },
    ],
    company: {
      type: ObjectId,
      ref: 'Company',
      autopopulate: { select: 'name', maxDepth: 1 },
    },
    createdByCompany: {
      type: ObjectId,
      ref: 'Company',
      autopopulate: { select: 'name', maxDepth: 1 },
    },
    createdByBranch: {
      type: ObjectId,
      ref: 'Branch',
      autopopulate: { select: 'branchName', maxDepth: 1 },
    },
    createdBy: {
      type: ObjectId,
      ref: 'Admin',
      autopopulate: { select: 'name', maxDepth: 1 },
    },
  },
  { timestamps: true }
);
adminSchema.plugin(require('mongoose-autopopulate'));
module.exports = mongoose.model('Admin', adminSchema);

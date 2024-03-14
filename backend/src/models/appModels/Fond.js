const mongoose = require('mongoose');
const moment = require('moment');
const schema = new mongoose.Schema(
  {
    removed: {
      type: Boolean,
      default: false,
    },
    enabled: {
      type: Boolean,
      default: true,
    },

    title: {
      type: String,
      //   required: true,
    },
    parent: {
      type: String,
      //   required: true,
    },
    minimumPrice: { type: Number, default: 0 },
    converted: { type: Boolean, default: false },
    // createdBy: { type: mongoose.Schema.ObjectId, ref: 'Admin' },
    created: {
      type: Date,
      default: Date.now,
    },
    updated: {
      type: Date,
      default: Date.now,
    },
    createdat: { type: String, default: moment().format('YYYY-MM-DD') },

    cuId: { type: String },
    isBound: { type: Boolean, default: false },
    allowedCompanies: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Company',
        autopopulate: { select: 'name', maxDepth: 1 },
      },
    ],
    company: {
      type: mongoose.Schema.ObjectId,
      ref: 'Company',
      autopopulate: { select: 'name', maxDepth: 1 },
    },
    createdByCompany: {
      type: mongoose.Schema.ObjectId,
      ref: 'Company',
      //   required: true,
      autopopulate: { select: 'name', maxDepth: 1 },
    },
    // createdByBranch: {
    //   type: mongoose.Schema.ObjectId,,
    //   ref: 'Branch',
    //   required: true,
    //   autopopulate: { select: 'branchName', maxDepth: 1 },
    // },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'Admin',
      //   required: true,
      autopopulate: { select: 'name lastName', maxDepth: 1 },
    },
  },
  { timestamps: true }
);

schema.plugin(require('mongoose-autopopulate'));
module.exports = mongoose.model('Fond', schema);

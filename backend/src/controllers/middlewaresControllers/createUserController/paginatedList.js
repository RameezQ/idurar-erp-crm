const mongoose = require('mongoose');
const moment = require('moment');
const isValidObjectId = (value) => {
  return /^[a-f\d]{24}$/i.test(value);
};
const paginatedList = async (userModel, req, res) => {
  const Model = mongoose.model(userModel);
  const page = req.query.page || 1;
  const limit = parseInt(req.query.items) || 10;
  const skip = page * limit - limit;

  const { sortBy = 'enabled', sortValue = -1, filter, equal } = req.query;

  const fieldsArray = req.query.fields ? req.query.fields.split(',') : [];

  let fields = fieldsArray.length === 0 ? {} : { $or: [] };
  for (const field of fieldsArray) {
    fields.$or.push({ [field]: { $regex: new RegExp(req.query.q, 'i') } });
  }

  if (req.query.populatedFields) {
    for (const field of JSON.parse(req.query.populatedFields)) {
      const foreignModel = mongoose.model(field.model);

      const foreignIds = await foreignModel
        .find({
          [field.foreignField]: { $regex: new RegExp(req.query.q, 'i') },
        })
        .distinct('_id');

      if (foreignIds.length > 0) {
        fields.$or.push({ [field.localField]: { $in: foreignIds } });
      }
    }
  }
  let additionalFilter = {};
  if (req.query.filter?.length > 0) {
    additionalFilter = handleAdditionalFilter(req.query.filter);
  }
  const resultsPromise = Model.find({
    removed: false,
    [filter]: equal,
    ...fields,
    ...additionalFilter, // Add the additional filter to the query
  })
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy]: sortValue })
    // .populate('company', 'name')
    .exec();

  // Counting the total documents
  const countPromise = Model.countDocuments({
    removed: false,
    [filter]: equal,
    ...fields,
    ...additionalFilter, // Add the additional filter to the query
  });

  // Resolving both promises
  const [result, count] = await Promise.all([resultsPromise, countPromise]);

  // Calculating total pages
  const pages = Math.ceil(count / limit);

  // Getting Pagination Object
  const pagination = { page, pages, count };
  if (count > 0) {
    return res.status(200).json({
      success: true,
      result,
      pagination,
      message: 'Successfully found all documents',
    });
  } else {
    return res.status(203).json({
      success: true,
      result: [],
      pagination,
      message: 'Collection is Empty',
    });
  }
};

// Function to handle additional filter conditions
const handleAdditionalFilter = (query) => {
  const additionalFilter = {};

  for (const [key, value] of Object.entries(JSON.parse(query))) {
    console.log(key, value);
    if (key === 'createdat') {
      additionalFilter[key] = moment(value, 'YYYY-MM-DD').format('YYYY-MM-DD');
    } else if (key === 'startTime') {
      additionalFilter['createdAt'] = {
        $gte: moment(query.startTime, 'YYYY-MM-DD').format('YYYY-MM-DD'),
        $lte: moment(query.endTime, 'YYYY-MM-DD').format('YYYY-MM-DD'),
      };
    } else if (value === 'true' || value === 'false') {
      additionalFilter[key] = value === 'true';
    } else if (value === true || value === false) {
      additionalFilter[key] = value;
    } else if (
      value !== 'true' &&
      value !== 'false' &&
      key !== 'startTime' &&
      key !== 'endTime' &&
      value !== ''
    ) {
      if (isValidObjectId(value)) {
        additionalFilter[key] = new ObjectId(value);
      } else if (!isNaN(value)) {
        additionalFilter[key] = Number(value);
      } else {
        additionalFilter[key] = { $regex: new RegExp(value, 'i') };
      }
    }
  }
  console.log(additionalFilter);
  return additionalFilter;
};

module.exports = paginatedList;

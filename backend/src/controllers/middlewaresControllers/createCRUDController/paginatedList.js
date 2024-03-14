const paginatedList = async (Model, req, res) => {
  console.log('object');
  const page = req.query.page || 1;
  const limit = parseInt(req.query.items) || 10;
  const skip = page * limit - limit;

  console.log(req.query.fields);
  const { sortBy = 'enabled', sortValue = -1, filter, equal } = req.query;

  const fieldsArray = req.query.fields ? req.query.fields.split(',') : [];

  const fieldsParam = req.query.fields;
  let fields = {};
  console.log(req.query.fields);
  if (fieldsParam) {
    if (typeof fieldsParam === 'string') {
      // If fieldsParam is a string, convert it to an array
      fields = fieldsParam.split(',');
    } else if (Array.isArray(fieldsParam)) {
      // If fieldsParam is an array of objects, perform additional filtering
      fields = { $or: [] };
      for (const fieldObj of fieldsParam) {
        if (fieldObj.model && fieldObj.foreignField) {
          const foreignModel = mongoose.model(fieldObj.model);
          const foreignIds = await foreignModel
            .find({
              [fieldObj.foreignField]: { $regex: new RegExp(req.query.q, 'i') },
            })
            .distinct('_id');

          if (foreignIds.length > 0) {
            fields.$or.push({ [fieldObj.model]: { $in: foreignIds } });
          }
        }
      }
    }
  }

  //  Query the database for a list of all results
  const resultsPromise = Model.find({
    removed: false,

    [filter]: equal,
    ...fields,
  })
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy]: sortValue })
    .populate()
    .exec();

  // Counting the total documents
  const countPromise = Model.countDocuments({
    removed: false,

    [filter]: equal,
    ...fields,
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

module.exports = paginatedList;

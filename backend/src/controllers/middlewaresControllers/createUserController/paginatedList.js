const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const moment = require('moment');
const isValidObjectId = (value) => {
  return /^[a-f\d]{24}$/i.test(value);
};
const getPagination = (current, pageSize) => {
  const page = parseInt(current) || 1;
  const size = parseInt(pageSize) || 10;
  const skip = page * size - size;

  return { page, pageSize: size, skip };
};
const findMatchingIds = async (model, fields, searchTerm) => {
  const uniqueIds = [];

  for (const field of fields) {
    const fieldType = model.schema.obj[field].type;

    if (fieldType === Number && /\d/.test(searchTerm)) {
      // Field is a number and search term contains a number
      const condition = { [field]: Number(searchTerm) };
      const matchingRecords = await model.find(condition).select('_id');
      uniqueIds.push(...matchingRecords.map((record) => record._id));
    } else if (fieldType === String) {
      // Field is a string
      const condition = { [field]: { $regex: new RegExp(searchTerm, 'i') } };
      const matchingRecords = await model.find(condition).select('_id');
      uniqueIds.push(...matchingRecords.map((record) => record._id));
    }
  }

  const deduplicatedIds = [...new Set(uniqueIds)];

  return deduplicatedIds;
};

const createFilter = async (Model, query) => {
  let filter = { removed: query.removed ? query.removed : false };

  const { current, pageSize, ...rest } = query;
  console.log(query);
  if (query && Object.keys(query).length !== 0) {
    for (const [key, value] of Object.entries(rest)) {
      if (key === 'createdat') {
        filter[key] = moment(value, 'YYYY-MM-DD').format('YYYY-MM-DD');
      } else if (key === 'startTime') {
        filter['createdAt'] = {
          $gte: moment(rest.startTime, 'YYYY-MM-DD').format('YYYY-MM-DD'),
          $lte: moment(rest.endTime, 'YYYY-MM-DD').format('YYYY-MM-DD'),
        };
      } else if (value === 'true' || value === 'false') {
        console.log('object');
        filter[key] = value;
      } else if (value === true || value === false) {
        console.log('object');
        filter[key] = value;
      } else if (key === 'keyword' && value !== '') {
        const schema = Model.schema.obj;
        const orConditions = [];
        for (const field of Object.keys(schema)) {
          if (schema[field].ref && isNaN(Number(value))) {
            const refModel = mongoose.model(schema[field].ref);
            const refConditions = Object.keys(refModel.schema.obj);
            const refIds = await findMatchingIds(refModel, refConditions, value);
            orConditions.push({ [field]: { $in: refIds } });
          } else if (schema[field].type === Number && !isNaN(Number(value))) {
            orConditions.push({ [field]: Number(value) });
          } else if (schema[field].type === String) {
            console.log('strings');
            orConditions.push({
              [field]: { $regex: new RegExp(value?.toString(), 'i') },
            });
          }
        }

        if (orConditions.length > 0) {
          const keywordFilter = { $or: orConditions };
          // Merge keywordFilter into the main filter
          Object.assign(filter, keywordFilter);
        }
      } else if (
        value !== 'true' &&
        value !== 'false' &&
        key !== 'startTime' &&
        key !== 'endTime' &&
        value !== ''
      ) {
        if (isValidObjectId(value)) {
          filter[key] = new ObjectId(value);
        } else if (!isNaN(value)) {
          filter[key] = Number(value);
        } else {
          filter[key] = { $regex: new RegExp(value, 'i') };
        }
      }
    }
  }
  return filter;
};

const getCountByStatuses = async (Model, statuses) => {
  const counts = await Promise.all(statuses.map((status) => Model.countDocuments({ status })));
  return statuses.map((status, index) => ({ status, count: counts[index] }));
};
const paginatedList = async (userModel, req, res) => {
  const Model = mongoose.model(userModel);

  try {
    const filter = await createFilter(Model, req.query);
    const { page, pageSize, skip } = getPagination(req.query.current, req.query.pageSize);
    delete filter.removed;
    delete filter.items;
    delete filter.page;
    console.log(filter);
    const [data, total, Today, statuses] = await Promise.all([
      Model.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .populate('power', 'title'),
      Model.countDocuments(filter),
      Model.countDocuments(filter).where('createdat').equals(moment().format('YYYY-MM-DD')),
      Model.distinct('status'),
    ]);

    const statusCount = await getCountByStatuses(Model, statuses);
    const statusCountsWithToday = [
      { status: 'All', count: 0 },
      { status: 'Today', count: Today },
      ...statusCount,
    ];

    const message = total > 0 ? 'Successfully found all documents' : 'Collection is Empty';
    const success = total > 0;
    console.log(data);
    const pagination = { page, pages: pageSize, count: total };
    return res.status(success ? 200 : 203).json({
      success,
      result: data,
      pagination,
      statusCountsWithToday,
      message,
    });
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({
      success: false,
      result: [],
      page: 1,
      pageSize: 10,
      count: 0,
      statusCountsWithToday: [],
      message: `Oops, there is an error: ${err.message}`,
    });
  }
};

module.exports = paginatedList;

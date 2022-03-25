const advanceResults = (model, populate) => async (req, res, next) => {
  let query
  const reqQuery = { ...req.query }
  const removeFields = ["select", "sort", "limit", "page"]
  removeFields.forEach((param) => delete reqQuery[param])

  //convert the query into a string so we can perform operations
  let queryStr = JSON.stringify(reqQuery)
  //To search field we need $ sign with gt,lt etc so we add that to query
  queryStr = queryStr.replace(/\b(gt|lt|gte|lte|in)\b/g, (match) => `$${match}`)

  //find the resource from database

  query = model.find(JSON.parse(queryStr)).populate(populate)
  //select specific fields from the database
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ")

    query = query.select(fields)
  }
  //Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ")
    query = query.sort(sortBy)
  } else {
    query = query.sort("-createdAt")
  }
  //pagination

  const page = parseInt(req.query.page, 10) || 1
  const limit = parseInt(req.query.limit, 10) || 100
  const startIndex = (page - 1) * limit
  const endIndex = page * limit
  const total = await model.countDocuments()
  query = query.skip(startIndex).limit(limit)
  if (populate) {
    query.populate(populate)
  }

  const results = await query

  //pagination result
  const pagination = {}
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    }
  }
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    }
  }
  res.advanceResults = {
    success: true,
    count: results.length,
    pagination,
    limit,
    data: results,
  }
  next()
}

module.exports = advanceResults

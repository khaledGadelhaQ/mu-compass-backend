import { Query, Document, Model } from 'mongoose';

export class ApiFeatures<T extends Document> {
  public query: Query<T[], T>;
  public filterQuery: any;

  constructor(query: Query<T[], T>, private readonly queryParams: any) {
    this.query = query;
    this.filterQuery = {};
  }

  filter(): this {
    const filterableFields = { ...this.queryParams };
    const excludedFields = ['sort', 'page', 'limit', 'fields', 'search'];
    excludedFields.forEach((field) => delete filterableFields[field]);

    let queryStr = JSON.stringify(filterableFields);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);

    this.filterQuery = JSON.parse(queryStr);
    this.query = this.query.find(this.filterQuery);

    return this;
  }

  sort(): this {
    if (this.queryParams.sort) {
      const sortBy = this.queryParams.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  paginate(): this {
    const page = parseInt(this.queryParams.page, 10) || 1;
    const limit = parseInt(this.queryParams.limit, 10) || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }

  search(): this {
    if (this.queryParams.search) {
      const searchTerm = this.queryParams.search;
      this.query = this.query.find({ $text: { $search: searchTerm } });
    }
    return this;
  }

  limitFields(): this {
    if (this.queryParams.fields) {
      const fields = this.queryParams.fields.split(',').join(' ').trim();
      if (fields) {
        this.query = this.query.select(fields); // Dynamically select fields
      }
    } else {
      this.query = this.query.select('-__v'); // Default exclusion of __v field
    }
    return this; // Chainable
  }
}

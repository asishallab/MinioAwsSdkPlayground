/**
 * search Class to parse search argument for any model and translate it so sequelize model will accept it
 */
module.exports = class SearchArg {


    /**
     * constructor - Creates an instace with the given arguments
     *
     * @param  {string} field   field to filter.
     * @param  {object} value    value contains type(i.e. array, string) and actual value to match in the filter.
     * @param  {string} operator operator used to perform the filter.
     * @param  {object} search  recursive search instance.
     * @return {object}          instace of search class.
     */
    constructor({
      field,
      value,
      operator,
      search
    }) {
      this.field = field;
      this.value = this.constructor.parseValue(value);
      this.operator = operator;
      this.search = search
    }


    /**
     * @static parseValue - Creates the proper type(either array or string) of the value that user wants to filter.
     *
     * @param  {object} val value object to parse.
     * @return {(array|string|number)}     Parsed value
     */
    static parseValue(val) {
      if (val !== undefined) {
        if (val.type === "Array") {
          return val.value.split(",");
        } else {
          return val.value;
        }
      }
    }

    toAwsS3SQL() {
      return `WHERE ${this.constructor.toAwsS3SQL(this)}`
    }

    /**
     * @static toAwsS3SQL - Convert recursive search instance to search SQL sub-query
     * that AWS-SDK S3 will accept as input.
     *
     * @param  {string} field   field to filter.
     * @param  {object} value    value contains type(i.e. array, string) and actual value to match in the filter.
     * @param  {string} operator operator used to perform the filter.
     * @param  {array}  search  recursive search instances.
     * @return {string}  Translated search instance into sequelize object format.
     */
    static toAwsS3SQL({
      field,
      value,
      operator,
      search
    }) {
      /**
       * field, operator, value
       * operator search
       */
      let searchInSQL
      if (undefined !== field && undefined !== operator && undefined !==
        value) {
        searchInSQL = `(${field} ${operator} ${value})`
      } else if (
        undefined !== operator && undefined !== search && Array.isArray(
          search) &&
        search.length > 0) {
        searchInSQL =
          `(${search.map(SearchArg.toAwsS3SQL).reduce((acc, curr) => {return `${acc} ${operator} ${curr}`})})`
      } else {
        throw new Error(
          `Invalid input in 'toAwsS3SQL'. Cannot transform it to SQL.\n${
            JSON.stringify(this)}`
        )
      }
      return searchInSQL
    };
}

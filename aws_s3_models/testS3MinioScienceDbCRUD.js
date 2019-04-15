const AWS = require('aws-sdk');
const path = require('path')
const fs = require('fs')
const s3Settings = require(path.join(__dirname, '..', 'config',
  'minio_aws_s3_settings.json'))
const helper = require(path.join(__dirname, 'helper.js'))

AWS.config.logger = console;
/**
 * The connection using the AWS S3 service development kit to files stored in
 * Minio using this project's settings.
 */
module.exports.S3 = new AWS.S3(s3Settings)

module.exports.Bucket = 'test'
module.exports.Key = 'test.csv'
module.exports.FileHeaderInfo = 'USE'
module.exports.RecordDelimiter = '\n'
module.exports.FieldDelimiter = ','
/**
 * Infer the compression type of the table in which the respective records are
 * stored. Extracted from 'module.exports.Key'.
 *
 * @return {string} One of 'NONE', 'GZIP', or 'BZIP2'.
 */
module.exports.CompressionType = function() {
  let k = module.exports.Key
  if (k.match(/\.gz$/) || k.match(/\.gunzip$/)) {
    return 'GZIP'
  } else if (k.match(/\.bzip2$/) || k.match(/\.bzip$/)) {
    return 'BZIP2'
  } else {
    return 'NONE'
  }
}

/**
 * Generates and returns the default parameters to be used when accessing a
 * Minio stored file. Note that 'Bucket' and 'Key' (the file) are automatically
 * set. The parameters are meant to be used in the 'AWS.S3.selectObjectContent'
 * function.
 *
 * @return {object} The plain old Javascript object holding the parameters.
 */
module.exports.baseParams = function() {
  return {
    Bucket: module.exports.Bucket,
    Key: module.exports.Key,
    ExpressionType: 'SQL',
    InputSerialization: {
      CSV: {
        FileHeaderInfo: module.exports.FileHeaderInfo,
        RecordDelimiter: module.exports.RecordDelimiter,
        FieldDelimiter: module.exports.FieldDelimiter
      },
      CompressionType: module.exports.CompressionType()
    },
    OutputSerialization: {
      JSON: {
        RecordDelimiter: ','
      }
    }
  }
}

module.exports.readOneTest = function(id, context) {
  return helper.executeSqlQuery(module.exports
    .S3, module.exports.baseParams(),
    `SELECT * FROM S3Object s WHERE s.id = ${id}`)
}

/**
 * tests - Check user authorization and return certain number, specified
 * in pagination argument, of records that holds the condition of search
 * argument, all of them sorted as specified by the order argument.
 *
 * @param  {object} search     Search argument for filtering records
 * @param  {array} order       Type of sorting (ASC, DESC) for each field
 * @param  {object} pagination Offset and limit to get the records from and to
 * respectively
 * @param  {object} context     Provided to every resolver holds contextual
 * information like the resquest query and user info.
 * @return {array}             Array of records holding conditions specified by
 * search, order and pagination argument
 */
module.exports.tests = function({
  search,
  order,
  pagination
}, context) {
  return helper.executeSqlQuery(module.exports.S3, module.exports.baseParams(),
    `SELECT * FROM S3Object`)
}

module.exports.bulkAddTestCsv = function(_, context) {
  let binStr = fs.readFileSync(path.join(__dirname, '..', 'test.csv'))
  // In the true resolver this will be
  // binStr = context.request.files.csv_file.data
  // We can check filename and compression using
  // context.request.files.csv_file.name
  // see https://www.npmjs.com/package/express-fileupload for more details.
  var params = {
    Body: binStr,
    Bucket: module.exports.Bucket,
    Key: module.exports.Key
  }
// Validate each row
// Do that with an object stream
  return new Promise((resolve, reject) => {
    module.exports.S3.putObject(params, function(err, data) {
      if (err) reject(err)
      else resolve(data)
    })
  })
}

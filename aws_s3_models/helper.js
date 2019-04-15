/**
 * Helper to execute a SQL query using Amazon's 'aws-sdk' to S3 stored tables
 * ('CSV') in Minio. Note that this function collects all chunks into an Array
 * of buffers, concatonates them and then translates this into a String and
 * finally parses the String into an object with JSON.parse. When large resutl
 * sets are obtained this can potentially cause problems.
 *
 * @param {object} s3 - An Instance of AWS.S3(settings). See respective model files'
 * exports for more details.
 * @param {object} baseParams - A set of parameters pointing the query to the right IP
 * address, the right bucket and file ('Key'), using the right compression
 * type, information about record and field separators, and header information.
 * See respective model file's exports for more details.
 * @param {string} sqlQuery - The valid SQL to be executed.
 *
 * @return {object} A Promise which wraps the following result: Can be instance
 * of Array or a single plain old Javascript Object obtained from the querying
 * the respective Minio file.
 */
module.exports.executeSqlQuery = function(s3, baseParams, sqlQuery) {
  baseParams.Expression = sqlQuery

  return new Promise((resolve, reject) => {
    s3.selectObjectContent(baseParams, (err, data) => {
      if (err) {
        console.log(
          `An ERROR has occurred in executeSqlQuery:\n${err}`)
        reject(err)
      }

      let eventStream = data.Payload
      let buffers = []

      eventStream.on('data', function(event) {
        // Check the top-level field to determine which event this is.
        if (event.Records) {
          // handle Records event
          console.log(
            `Read record(s) from eventStream:\n${event.Records.Payload.toString()}`
          )
          buffers.push(event.Records.Payload)
        } else if (event.Stats) {
          // handle Stats event
        } else if (event.Progress) {
          // handle Progress event
        } else if (event.Cont) {
          // handle Cont event
        } else if (event.End) {
          // handle End event
        }
      })
      eventStream.on('error', function(err) {
        reject(err)
      })
      eventStream.on('end', function() {
        let buf = Buffer.concat(buffers)
        console.log(
          `Concatonated buffers and got:\n${buf.toString('utf-8')}`
        )
        resolve(JSON.parse(buf.toString('utf-8').replace(/,$/, "")))
      })
    })
  })
}

/**
 * paginate - Creates pagination SQL.
 *
 * @param  {int} limit  The limit to be applied
 * @param {int} offset  The offset to be applied
 * @return {string}     Pagination SQL 
 */
module.exports.paginate = function({limit, offset}) {
  let selectSql = ''
  if (undefined !== limit) {
    selectSql = `LIMIT ${limit}`
  }
  if (undefined !== offset) {
    selectSql = `${selectSql} OFFSET ${offset}`
  }
  return selectSql
}

module.exports.order = function({field, direction}) {
  let sortSql = ''
  if (undefined !== field) {
    sortSql = `ORDER BY ${field}`
    if (undefined !== direction) {
      sortSql = `${sortSql} ${direction}`
    } else {
      sortSql = `${sortSql} ASC`
    }
  }
  return sortSql
}

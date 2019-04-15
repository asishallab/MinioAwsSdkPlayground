var AWS = require('aws-sdk');

AWS.config.logger = console;

var s3Settings = {
  accessKeyId: 'admin',
  secretAccessKey: 'eightLetters',
  endpoint: 'http://127.0.0.1:9000',
  s3ForcePathStyle: true,
  signatureVersion: 'v4'
}

var s3 = new AWS.S3(s3Settings)

var params = {
  Bucket: 'test',
  Key: 'test.csv',
  ExpressionType: 'SQL',
  Expression: 'SELECT * FROM S3Object s WHERE s.a > 3 AND s.c < 9',
  InputSerialization: {
    CSV: {
      FileHeaderInfo: 'USE',
      RecordDelimiter: '\n',
      FieldDelimiter: ','
    },
    CompressionType: 'NONE'
  },
  OutputSerialization: {
    JSON: {
      RecordDelimiter: ','
    }
  }
}

console.log('Testing selectObjectContent(...)')

s3.selectObjectContent(params, (err, data) => {
  if (err) {
    console.log(`######\nERROR\n${err}\n######`)
    return;
  }

  // data.Payload is a Readable Stream
  const eventStream = data.Payload;

  // Read events as they are available
  eventStream.on('data', (event) => {
    if (event.Records) {
      // event.Records.Payload is a buffer containing
      // a single record, partial records, or multiple records
      console.log(event.Records.Payload.toString());
    } else if (event.Stats) {
      console.log(
        `Processed ${event.Stats.Details.BytesProcessed} bytes`);
    } else if (event.End) {
      console.log('SelectObjectContent completed');
    }
  });

  // Handle errors encountered during the API call
  eventStream.on('error', (err) => {
    console.log(`ERROR:\n${err}`)
  });

  eventStream.on('end', () => {
    // Finished receiving events from S3
    console.log('FINISHED reading from eventStream')
  });
})

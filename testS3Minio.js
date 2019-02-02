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
  Key: 'test.json',
  ExpressionType: 'SQL',
  Expression: 'SELECT * FROM S3Object',
  InputSerialization: {
    JSON: {
      Type: 'LINES'
    }
  },
  OutputSerialization: {
    JSON: { RecordDelimiter: ',' }
  }
}

console.log('Testing selectObjectContent(...)')

s3.selectObjectContent(params, (err, data) => {
	if (err) {
    console.log(`######\nERROR\n${err}\n######`)
		return;
	}

	const events = data.Payload;
	
	for (const event of events) {
		if (event.Records) {
			console.log(`PAYLOAD: ${event.Records.Payload.toString()}`);
		} else if (event.Stats) {
			console.log(`Processed ${event.Stats.Details.BytesProcessed} bytes`);
		} else if (event.End) {
			console.log('SelectObjectContent completed');
		}
	}
})

# MinioAwsSdkPlayground

Testing the Amazon aws-sdk for node with Minio

## Execute the test

Using the Docker image from Minio start a Minio instance. I set the username to `admin` and the password to `eightLetters`.
```
docker run --name minio --rm -d -p 9000:9000 -e "MINIO_ACCESS_KEY=admin" -e "MINIO_SECRET_KEY=eightLetters" minio/minio server /data
```

Then using the default browser graphical interface I created a bucket `test` and uploaded the files `dogs.json` and `test.json`.

Finally, I execute `node testS3Minio.js` and get the following error:
```
Testing selectObjectContent(...)
[AWS s3 400 0.387s 3 retries] selectObjectContent({ Bucket: 'test',
  Key: 'test.json',
  ExpressionType: 'SQL',
  Expression: 'SELECT * FROM S3Object',
  InputSerialization: { JSON: { Type: 'LINES' } },
  OutputSerialization: { JSON: { RecordDelimiter: ',' } } })
######
ERROR
XMLParserError: Non-whitespace before first tag.
Line: 0
Column: 1
Char: 
######
```

import { Context, APIGatewayProxyResult, APIGatewayEvent, S3Event } from 'aws-lambda';
import { S3 } from 'aws-sdk';
import * as CONVERT from 'xml-js';

const s3 = new S3();

export const handler = async (event: S3Event, context: Context) => {
    console.log(`Event: ${JSON.stringify(event, null, 2)}`);
    console.log(`Context: ${JSON.stringify(context, null, 2)}`);

    const record = event.Records[0];

    const key = record.s3.object.key;
    const bucket = record.s3.bucket.name;
    console.log(`Bucket: ${record.s3.bucket.name}, Key: ${key}`);

    const data = await s3.getObject({
        Bucket: bucket,
        Key: key
    }).promise();

    const TARGET_BUCKET_NAME = process.env.TARGET_BUCKET_NAME || '';
    const TARGET_PREFIX = process.env.TARGET_PREFIX || 'xml/';

    const fileContent = data.Body?.toString() || '';
    const textWithCommas = fileContent.replace(/(\r?\n)/g, ',$1');
    
    const template = `{"Aktive_Kunden": {"kunde": [${textWithCommas}]}}`

    var test = CONVERT.json2xml(template, {compact: true, spaces: 4});
    
    const xmlContent = CONVERT.json2xml(template, {compact: true, ignoreComment: true, spaces: 4})
    
    // get filename from s3 object
    const filename  = key.split('/').pop() || '';

    const targetKey = TARGET_PREFIX + filename.replace('.json', '.xml')
    console.log(`Target Bucket: ${TARGET_BUCKET_NAME}, Key: ${targetKey}`)
    // write xmlContent to S3
    await s3.putObject({
        Bucket: TARGET_BUCKET_NAME,
        Key: targetKey,
        Body: xmlContent,
        ContentType: 'text/xml'
    }).promise();

    return {
        statusCode: 200,
        body: 'result',
    };
};
const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();
const cfnResponse = require('./cfn-response.js');
const dataToLoad = require('./data-to-load.js');

exports.handler = async (event, context) => {
    
    try {
    
        console.log('Received event:\n' + JSON.stringify(event, null, 2));
        console.log('Received context:\n' + JSON.stringify(context, null, 2));
    
        var tableName; 
        var responseData = {};
        var physicalResourceId; 

        if ((event.ResourceProperties).hasOwnProperty('TableName')) {
            tableName = event.ResourceProperties.TableName;
            physicalResourceId = `${tableName}DataLoader`;
        }
        else {
            throw new Error('Missing required resoource property TableName.');
        }

        if (event.RequestType === 'Create' || event.RequestType === 'Update') {
            await deleteAllTableItems(tableName);
            await insertTableItems(tableName);
        }
        else if (event.RequestType === 'Delete') {
            // NOTHING TO DO
        }
        return await cfnResponse.send(event, context, "SUCCESS", responseData, physicalResourceId); 
    }
    catch (err) {
        let errMsg = `${err.name}:\n${err.message}`;
        let responseData = { Error: errMsg };
        console.log(errMsg);
        return await cfnResponse.send(event, context, "FAILED", responseData); 
    }

};

async function deleteAllTableItems(tableName) {

  console.log('Deleting old items from table...');

  var items = [];
  var lastEvaluatedKey;
  
  // Scan and get all items:
  do {
      var scanResults = await ddb.scan({
        TableName: tableName,
        ExclusiveStartKey: lastEvaluatedKey,
          AttributesToGet: [
              'pk',
              'sk'
          ]
      }).promise();
    if (scanResults.Count > 0) {
      items = items.concat(scanResults.Items)
    }      
    lastEvaluatedKey = scanResults.LastEvaluatedKey;
  } while (lastEvaluatedKey);

  // Iterate through items and delete them; it would be more efficient to use
  // BatchWriteItems() API, but since this is a test table with not that many items, 
  // this works fine, too:
  for (const item of items) {
    await ddb.delete({
      TableName : tableName,
      Key: {
        pk: item.pk,
        sk: item.sk
      }
    }).promise();
    console.log(`Deleted item: ${JSON.stringify(item)}`);
  }

}

async function insertTableItems(tableName) {
    
    console.log('Populating table with test data...');
    for (const item of dataToLoad.items) {
      var params = {
        TableName : tableName,
        Item: item
      };
      await ddb.put(params).promise();
      console.log('Item inserted: ', JSON.stringify(item));
    }
}
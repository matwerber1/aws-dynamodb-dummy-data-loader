# DynamoDB Table Loader

A CloudFormation template that creates a new DynamoDB table and a custom CloudFormation resource that populates the table with dummy data. 

## Configuration

1. Open `lambda/table-data-loader/data-to-load.js` and add/modify records to the `items` array that you want inside your table. Within `items`, each element is an object consisting of key-value pairs for the attributes of the item. Note that, at a minimum, your items need to include the primary key attributes you've defined. This project uses default values of a hash key named `pk` and sort key of `sk`, both of type `string`.

  ```js
  exports.items = [
    {
      pk: 'customer_1',
      sk: 'customer_data',
      name: 'Mat Werber',
      title: 'Solution Architect',
      company: 'AWS',
    },
    ...
  ];
  ```

  * If you want to use different hash keys, you will need to update the following:

    1. Within `template.yaml`, change the key and attribute definitions of the table resource:

      ```yml
      DemoTable:
        Type: AWS::DynamoDB::Table
        Properties: 
          KeySchema: 
            - 
              AttributeName: pk
              KeyType: HASH
            -
              AttributeName: sk
              KeyType: RANGE
          AttributeDefinitions:
            - 
              AttributeName: pk
              AttributeType: S
            -
              AttributeName: sk
              AttributeType: S
      ```

    1. Within `lambda/table-data-loader/index.js`, change all the delete and insert function code to use your applicable key names, e.g.:

      ```js
      // Within the deleteAllTableItems() function, change this: 
      var scanResults = await ddb.scan({
        TableName: tableName,
        ExclusiveStartKey: lastEvaluatedKey,
          AttributesToGet: [
              'pk',
              'sk'
          ]
      }).promise();
      
      // Within the deleteAllTableItems() function, also change this: 
      await ddb.delete({
        TableName : tableName,
        Key: {
          pk: item.pk,
          sk: item.sk
        }
      }).promise();
      ```

    1. And finally, within `lambda/table-data-loader/data-to-load`, of course make sure your items contain your new hash and/or sort key names with proper data types. 

## Deployment

1. Install the AWS SAM CLI

2. From the root of your project directy, run `sam deploy --guided` and follow the on-screen prompts.

3. If you make changes and want to re-deploy, you can just run `sam deploy`.

## Making changes

If you deploy the stack and later want to re-run the custom resource that populates your table with new data, you need to change a property of the custom resource in `template.yaml` to trigger the re-run. If properties do not change, CloudFormation does not trigger the resource to re-run. I've added a `DummyPropertyToTriggerRefresh` within `template.yaml`, and you can change its value to any arbitrary value. Once changed, you can run `sam deploy`:

  ```yml
  DataLoaderResource:
    Type: Custom::TableDataLoader
    Properties:
      ServiceToken: !GetAtt DataLoaderProvider.Arn
      TableName: !Ref DemoTable
      DummyPropertyToTriggerRefresh: 123    # change this to any new value to cause the Lambda to re-run
  ```
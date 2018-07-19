import * as pulumi from '@pulumi/pulumi'
import * as aws from '@pulumi/aws'
import * as serverless from '@pulumi/aws-serverless'
import {listEvents} from './lambda'

const slotsTable = new aws.dynamodb.Table('slots-table', {
    attributes: [
        {name: 'eventDay', type: 'S'},
        {name: 'sortKey', type: 'S'}
    ],
    hashKey: 'eventDay',
    rangeKey: 'sortKey',
    readCapacity: 5,
    writeCapacity: 5
})

export const slotsTableName = slotsTable.name

const api = new serverless.apigateway.API('api', {
    routes: [
        {method: 'GET', path: '/events', handler: listEvents}
    ]
})


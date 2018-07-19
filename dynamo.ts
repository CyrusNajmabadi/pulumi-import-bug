import {DocumentClient} from 'aws-sdk/clients/dynamodb'
import AttributeMap = DocumentClient.AttributeMap;
import {slotsTableName} from './index'

type SlotMap = { [key: string]: number };

export type Slot = AttributeMap & {
    eventDay: string,
    sortKey: string,
    startAt: string,
    endAt: string,
    title: string,
    description: string,
    speakers: [{
        name: string,
        photo: string
    }],
    room: string,
    track: number,
    uploadAt?: string
}

type Slots = Slot[] | undefined

const docClient = new DocumentClient()

const getUpdateExp = (obj: object) => {
    const body = Object
        .keys(obj)
        .reduce((prev, curr) => {
            return `${prev} ${curr}=:${curr}`.trim()
        }, '')
        .split(' ')
        .join(', ')

    return `set ${body}`
}

const getExpAttributes = (obj: { [key: string]: string }) => {
    return Object.keys(obj).reduce((prev, curr) => ({...prev, [`:${curr}`]: obj[curr]}), {})
}

const getSlotsPerEvents = (slots: Slots) => {
    if (!slots) {
        return []
    }

    const slotsPerEvent: SlotMap = slots.reduce((prev: SlotMap, {eventDay}: Slot) => {
        prev[eventDay] ? prev[eventDay] += 1 : prev[eventDay] = 1
        return prev
    }, {})

    return Object.keys(slotsPerEvent)
        .map(eventDay => ({eventDay, slots: slotsPerEvent[eventDay]}))
        .sort((a, b) => a.eventDay.localeCompare(b.eventDay))
}

export const getAllBofEvents = async () => {
    const params = {
        TableName: slotsTableName.get(),
        ScanIndexForward: true
    }

    const {Items} = await docClient.scan(params).promise()

    return getSlotsPerEvents(Items as Slots)
}

export const getEventSlots = async (eventDay: string) => {
    const params = {
        TableName: slotsTableName.get(),
        KeyConditionExpression: 'eventDay = :day',
        ExpressionAttributeValues: {
            ':day': eventDay
        }
    }

    const {Items} = await docClient.query(params).promise()

    return Items
}

export const getOneSlot = async (eventDay: string, sortKey: string) => {
    const params = {
        TableName: slotsTableName.get(),
        Key: {
            eventDay, sortKey
        }
    }

    const {Item} = await docClient.get(params).promise()
    return Item || {}
}

export const updateSlot = async (data: { [key: string]: string }, eventDay: string, sortKey: string) => {
    const params = {
        TableName: slotsTableName.get(),
        Key: {
            eventDay, sortKey
        },
        UpdateExpression: getUpdateExp(data),
        ExpressionAttributeValues: getExpAttributes(data),
        ConditionExpression: 'attribute_exists(eventDay) and attribute_exists(sortKey)',
        ReturnValues: 'ALL_NEW'
    }

    return await docClient.update(params).promise()
}

export const getSlotsWithVideo = async () => {
    const params = {
        TableName: slotsTableName.get(),
        FilterExpression: 'attribute_exists(uploadAt)'
    }

    const {Items} = await docClient.scan(params).promise()
    return Items.sort((a: Slot, b: Slot) => b.uploadAt.localeCompare(a.uploadAt))
}

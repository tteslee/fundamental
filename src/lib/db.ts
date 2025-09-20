import { prisma } from './prisma'
import { Record, RecordType, User } from '@/types'

export async function createUser(email: string, name?: string): Promise<User> {
  return await prisma.user.create({
    data: {
      email,
      name,
    },
  })
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { email },
  })
}

export async function createRecord(data: {
  type: RecordType
  startTime: Date
  endTime?: Date
  duration?: number
  memo?: string
  userId: string
}): Promise<Record> {
  return await prisma.record.create({
    data: {
      type: data.type.toUpperCase() as any,
      startTime: data.startTime,
      endTime: data.endTime,
      duration: data.duration,
      memo: data.memo,
      userId: data.userId,
    },
  })
}

export async function getRecordsByUser(userId: string): Promise<Record[]> {
  const records = await prisma.record.findMany({
    where: { userId },
    orderBy: { startTime: 'desc' },
  })

  return records.map(record => ({
    ...record,
    type: record.type.toLowerCase() as RecordType,
  }))
}

export async function getRecordsByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<Record[]> {
  const records = await prisma.record.findMany({
    where: {
      userId,
      startTime: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { startTime: 'asc' },
  })

  return records.map(record => ({
    ...record,
    type: record.type.toLowerCase() as RecordType,
  }))
}

export async function updateRecord(
  id: string,
  data: Partial<{
    type: RecordType
    startTime: Date
    endTime: Date
    duration: number
    memo: string
  }>
): Promise<Record> {
  const updateData: any = { ...data }
  if (data.type) {
    updateData.type = data.type.toUpperCase()
  }

  const record = await prisma.record.update({
    where: { id },
    data: updateData,
  })

  return {
    ...record,
    type: record.type.toLowerCase() as RecordType,
  }
}

export async function deleteRecord(id: string): Promise<void> {
  await prisma.record.delete({
    where: { id },
  })
}

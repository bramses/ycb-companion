// transactionFunctions.ts

import {
  addEntry as apiAddEntry,
  updateEntry as apiUpdateEntry,
} from '@/helpers/functions';

import type { Transaction, TransactionContext } from './transactionManager';

export const createEntryTransaction = (
  tempId: string,
  data: string,
  metadata: any,
): Transaction => {
  return async (context: TransactionContext) => {
    console.log(`Creating entry with temp ID ${tempId}...`);
    const response = await apiAddEntry(data, metadata);
    console.log('response:', response);
    const actualId = response.respData.id;
    console.log(`Entry created with actual ID ${actualId}`);

    // Update the idMapping
    context.idMapping.set(tempId, actualId);
    return actualId;
  };
};

export const updateEntryTransaction = (
  id: string,
  data: string,
  metadata: any,
): Transaction => {
  return async (context: TransactionContext) => {
    // Resolve ID if it's a temporary ID
    const actualId = context.idMapping.get(id) || id;
    console.log(`Updating entry ${actualId}...`);
    await apiUpdateEntry(actualId, data, metadata);
    console.log(`Entry ${actualId} updated.`);
  };
};

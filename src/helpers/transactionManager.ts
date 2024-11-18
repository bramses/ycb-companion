// transactionManager.ts

export type Transaction = (context: TransactionContext) => Promise<void>;

export interface TransactionOptions {
  canRunInParallel?: boolean;
  dependencies?: string[]; // List of temporary IDs this transaction depends on
  tempId?: string; // Temporary ID for this transaction
  name?: string; // Name of the transaction
}

export interface TransactionContext {
  idMapping: Map<string, string>; // Mapping from temp IDs to actual IDs
  errorLog: string[];
}

export class TransactionManager {
  private transactions: {
    transaction: Transaction;
    options: TransactionOptions;
  }[] = [];

  private errorLog: string[] = [];

  private lastSavedState: any = null;

  private draftState: any = null;

  private idMapping: Map<string, string> = new Map(); // For resolving temporary IDs

  constructor(initialState: any) {
    this.lastSavedState = initialState;
    this.draftState = { ...initialState };
  }

  addTransaction(transaction: Transaction, options: TransactionOptions = {}) {
    this.transactions.push({ transaction, options });
  }

  reset() {
    this.transactions = [];
    this.idMapping.clear();
    this.errorLog = [];
    this.draftState = null;
  }

  setDraftState(state: any) {
    this.draftState = state;
  }

  async executeTransactions() {
    try {
      // Sort transactions based on dependencies
      console.log('Transactions prior to sorting:', this.transactions);
      const sortedTransactions = this.sortTransactionsByDependencies();

      const context: TransactionContext = {
        idMapping: this.idMapping,
        errorLog: this.errorLog,
      };

      console.log('Sorted Transactions:', sortedTransactions);

      // Execute transactions sequentially to handle dependencies
      for (const { transaction } of sortedTransactions) {
        console.log('Transaction:', context);

        // eslint-disable-next-line no-await-in-loop
        await transaction(context);
      }

      // Clear transactions and error log on success
      this.transactions = [];
      this.errorLog = [];
      // Update last saved state
      this.lastSavedState = { ...this.draftState };
    } catch (error: any) {
      // Rollback to last saved state
      this.draftState = { ...this.lastSavedState };
      this.errorLog.push(
        error.message || 'An error occurred during transaction.',
      );
      throw error;
    }
  }

  // Helper function to sort transactions based on dependencies
  private sortTransactionsByDependencies() {
    const sorted: { transaction: Transaction; options: TransactionOptions }[] =
      [];
    const visited = new Set<string>();

    const visit = (tx: {
      transaction: Transaction;
      options: TransactionOptions;
    }) => {
      console.log('Visiting transaction:', tx);
      console.log('tx to str:', JSON.stringify(tx));
      console.log('Visited transactions:', visited);
      if (visited.has(JSON.stringify(tx))) {
        console.log('Visited transaction:', tx);
        return;
      }
      visited.add(JSON.stringify(tx));

      if (tx.options.dependencies) {
        console.log('tx.options.dependencies:', tx.options.dependencies);
        for (const dep of tx.options.dependencies) {
          console.log('dep:', dep);
          const depTx = this.transactions.find((t) => t.options.tempId === dep);
          if (depTx) {
            visit(depTx);
          }
        }
      }
      sorted.push(tx);
    };

    for (const tx of this.transactions) {
      visit(tx);
    }

    return sorted;
  }

  getDraftState() {
    return this.draftState;
  }

  getErrorLog() {
    return this.errorLog;
  }

  clearErrorLog() {
    this.errorLog = [];
  }

  clearTransactions() {
    this.transactions = [];
    this.idMapping.clear();
  }
}

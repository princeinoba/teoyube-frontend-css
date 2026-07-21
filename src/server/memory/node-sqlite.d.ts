declare module "node:sqlite" {
  export type SQLInputValue = null | number | bigint | string | Uint8Array;
  export type SQLOutputValue = null | number | bigint | string | Uint8Array;
  export type StatementResultingChanges = Readonly<{ changes: number | bigint; lastInsertRowid: number | bigint }>;

  export class StatementSync {
    run(...anonymousParameters: SQLInputValue[]): StatementResultingChanges;
    get(...anonymousParameters: SQLInputValue[]): Record<string, SQLOutputValue> | undefined;
    all(...anonymousParameters: SQLInputValue[]): Record<string, SQLOutputValue>[];
  }

  export class DatabaseSync {
    constructor(location: string, options?: Readonly<{ open?: boolean; readOnly?: boolean; enableForeignKeyConstraints?: boolean }>);
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
    close(): void;
  }
}

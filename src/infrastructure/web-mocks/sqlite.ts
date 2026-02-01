/**
 * Web Mock for react-native-sqlite-storage
 * Lightweight in-memory/localStorage shim for Web builds
 */

type SqlRow = Record<string, any>;
type SqlResultSet = {
  rows: {
    length: number;
    item: (i: number) => SqlRow;
    _array: SqlRow[];
  };
  rowsAffected?: number;
  insertId?: number;
};

const STORAGE_PREFIX = 'klaproth_sqlite_';

const normalizeSql = (sql: string): string => sql.trim().replace(/\s+/g, ' ').toLowerCase();

const getTableKey = (dbName: string, table: string): string =>
  `${STORAGE_PREFIX}${dbName}__${table}`;

const loadTable = (dbName: string, table: string): SqlRow[] => {
  const key = getTableKey(dbName, table);
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SqlRow[];
  } catch {
    return [];
  }
};

const saveTable = (dbName: string, table: string, rows: SqlRow[]): void => {
  const key = getTableKey(dbName, table);
  localStorage.setItem(key, JSON.stringify(rows));
};

const buildRows = (rows: SqlRow[]): SqlResultSet['rows'] => ({
  length: rows.length,
  item: (i: number) => rows[i],
  _array: rows,
});

const applyWhere = (
  rows: SqlRow[],
  whereClause: string | undefined,
  params: any[],
): SqlRow[] => {
  if (!whereClause) return rows;

  const conditions = whereClause
    .split(/\s+and\s+/i)
    .map((c) => c.trim())
    .filter(Boolean);

  return rows.filter((row) => {
    let paramIndex = 0;
    for (const condition of conditions) {
      const likeMatch = condition.match(/^(\w+)\s+like\s+\?$/i);
      if (likeMatch) {
        const col = likeMatch[1];
        const value = String(params[paramIndex++] ?? '');
        const pattern = value.replace(/%/g, '');
        if (!String(row[col] ?? '').includes(pattern)) return false;
        continue;
      }

      const eqMatch = condition.match(/^(\w+)\s*=\s*\?$/i);
      if (eqMatch) {
        const col = eqMatch[1];
        const value = params[paramIndex++];
        if (row[col] !== value) return false;
        continue;
      }
    }
    return true;
  });
};

class WebSQLiteDatabase {
  private dbName: string;

  constructor(dbName: string) {
    this.dbName = dbName;
  }

  async open(): Promise<void> {
    return Promise.resolve();
  }

  async executeSql(sql: string, params: any[] = []): Promise<SqlResultSet[]> {
    const normalized = normalizeSql(sql);

    // CREATE TABLE / CREATE INDEX -> no-op
    if (normalized.startsWith('create table') || normalized.startsWith('create index')) {
      return [{ rows: buildRows([]), rowsAffected: 0 }];
    }

    // INSERT OR REPLACE
    const insertMatch = normalized.match(
      /^insert\s+or\s+replace\s+into\s+(\w+)\s*\(([^)]+)\)\s*values\s*\(([^)]+)\)/i,
    );
    if (insertMatch) {
      const table = insertMatch[1];
      const columns = insertMatch[2].split(',').map((c) => c.trim());
      const row: SqlRow = {};
      columns.forEach((col, idx) => {
        row[col] = params[idx];
      });

      const rows = loadTable(this.dbName, table);
      const idIndex = columns.indexOf('id');
      if (idIndex >= 0) {
        const idValue = row.id;
        const existingIndex = rows.findIndex((r) => r.id === idValue);
        if (existingIndex >= 0) {
          rows[existingIndex] = row;
        } else {
          rows.push(row);
        }
      } else {
        rows.push(row);
      }

      saveTable(this.dbName, table, rows);
      return [{ rows: buildRows([]), rowsAffected: 1 }];
    }

    // UPDATE
    const updateMatch = normalized.match(/^update\s+(\w+)\s+set\s+(.+)\s+where\s+(.+)$/i);
    if (updateMatch) {
      const table = updateMatch[1];
      const setClause = updateMatch[2];
      const whereClause = updateMatch[3];

      const rows = loadTable(this.dbName, table);
      const setParts = setClause.split(',').map((p) => p.trim());
      const whereParams = params.slice(setParts.length);
      const filtered = applyWhere(rows, whereClause, whereParams);

      for (const row of rows) {
        if (!filtered.includes(row)) continue;
        let paramIndex = 0;
        for (const part of setParts) {
          const match = part.match(/^(\w+)\s*=\s*\?$/i);
          if (match) {
            const col = match[1];
            row[col] = params[paramIndex++];
          }
        }
      }

      saveTable(this.dbName, table, rows);
      return [{ rows: buildRows([]), rowsAffected: filtered.length }];
    }

    // DELETE
    const deleteMatch = normalized.match(/^delete\s+from\s+(\w+)\s+where\s+(.+)$/i);
    if (deleteMatch) {
      const table = deleteMatch[1];
      const whereClause = deleteMatch[2];
      const rows = loadTable(this.dbName, table);
      const filtered = applyWhere(rows, whereClause, params);
      const remaining = rows.filter((row) => !filtered.includes(row));
      saveTable(this.dbName, table, remaining);
      return [{ rows: buildRows([]), rowsAffected: filtered.length }];
    }

    // SELECT
    const selectMatch = normalized.match(
      /^select\s+(.+)\s+from\s+(\w+)(?:\s+where\s+(.+?))?(?:\s+group\s+by\s+(.+?))?(?:\s+order\s+by\s+(.+))?$/i,
    );
    if (selectMatch) {
      const selectFields = selectMatch[1];
      const table = selectMatch[2];
      const whereClause = selectMatch[3];
      const groupBy = selectMatch[4];
      const orderBy = selectMatch[5];

      const rows = loadTable(this.dbName, table);
      let filtered = applyWhere(rows, whereClause, params);

      if (orderBy) {
        const [orderCol, orderDir] = orderBy.split(' ').map((o) => o.trim());
        filtered = filtered.sort((a, b) => {
          const av = a[orderCol];
          const bv = b[orderCol];
          if (av === bv) return 0;
          const dir = orderDir?.toLowerCase() === 'desc' ? -1 : 1;
          return av > bv ? dir : -dir;
        });
      }

      // Aggregations
      if (selectFields.includes('count(*)')) {
        const count = filtered.length;
        return [{ rows: buildRows([{ count }]) }];
      }

      if (selectFields.includes('sum(file_size) as total')) {
        const total = filtered.reduce((sum, r) => sum + (Number(r.file_size) || 0), 0);
        return [{ rows: buildRows([{ total }]) }];
      }

      if (groupBy && groupBy.includes('mime_type')) {
        const grouped: Record<string, { mime_type: string; count: number; totalSize: number }> =
          {};
        for (const row of filtered) {
          const key = String(row.mime_type ?? '');
          if (!grouped[key]) {
            grouped[key] = { mime_type: key, count: 0, totalSize: 0 };
          }
          grouped[key].count += 1;
          grouped[key].totalSize += Number(row.file_size) || 0;
        }
        return [{ rows: buildRows(Object.values(grouped)) }];
      }

      // Projection for single column
      if (selectFields.includes('encrypted_file_path')) {
        const projected = filtered.map((row) => ({ encrypted_file_path: row.encrypted_file_path }));
        return [{ rows: buildRows(projected) }];
      }

      return [{ rows: buildRows(filtered) }];
    }

    return [{ rows: buildRows([]), rowsAffected: 0 }];
  }

  async transaction(callback: (tx: any) => Promise<void> | void): Promise<void> {
    const mockTx = {
      executeSql: this.executeSql.bind(this),
    };

    try {
      await callback(mockTx);
    } catch (error) {
      throw error;
    }
  }

  async close(): Promise<void> {
    return Promise.resolve();
  }
}

export const openDatabase = async (
  config: { name: string; location?: string },
  successCallback?: () => void,
  errorCallback?: (error: any) => void,
): Promise<WebSQLiteDatabase> => {
  const db = new WebSQLiteDatabase(config.name);

  try {
    await db.open();
    if (successCallback) successCallback();
  } catch (error) {
    if (errorCallback) errorCallback(error);
  }

  return db;
};

export const enablePromise = (_enable: boolean): void => {};
export const DEBUG = (_enable: boolean): void => {};

export default {
  openDatabase,
  enablePromise,
  DEBUG,
};

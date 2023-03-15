import { AnyMySqlColumn, InferModel, boolean, mysqlEnum, mysqlTable, timestamp, uniqueIndex, varchar } from 'drizzle-orm/mysql-core';
import type { AnyMySqlColumnBuilder } from 'drizzle-orm/mysql-core/columns/common';

/*
export const users = mysqlTable('users',
    {
        id: varchar('id', { length: 36 }).primaryKey(),
        createdAt: timestamp('createdAt').defaultNow().notNull(),
        username: varchar('username', { length: 60 }).notNull().default(''),
        password: varchar('password', { length: 256 }).notNull().default('no-password-specified'),
        useAsDisplayName: mysqlEnum('useAsDisplayName', ['username', 'email', 'realName']).default('username').notNull(),
        admin: boolean('admin').notNull().default(false),
    },
    (users) => ({
        usernameIndex: uniqueIndex('usernameIndex').on(users.username),
    })
);
*/

export type icingProp = {
    name: string,
    length?: number,
    db: (prop: icingProp) => AnyMySqlColumnBuilder,
    unique?: boolean,
    enums?: [string, ...string[]],
}

export type icingSchema = {
    tableName: string,
    props: icingProp[],
}

export const userSchema: icingSchema = {
    tableName: 'users',
    props: [
        {
            name: "id",
            length: 36,
            db: (prop: icingProp) => varchar(prop.name, { length: prop.length || 256 }).primaryKey(),
        },
        {
            name: "createdAt",
            db: (prop: icingProp) => timestamp(prop.name).defaultNow().notNull(),
        },
        {
            name: "username",
            unique: true,
            length: 60,
            db: (prop: icingProp) => varchar(prop.name, { length: prop.length || 256 }).notNull().default('')
        },
        {
            name: "password",
            db: (prop: icingProp) => varchar(prop.name, { length: prop.length || 256 }).notNull().default('no-password-specified'),
        },
        {
            name: 'useAsDisplayName',
            length: 20,
            db: (prop: icingProp) => mysqlEnum(prop.name, prop.enums || ['']).notNull().default('username'),
            enums: ['username', 'email', 'realName'],
        },
        {
            name: 'admin',
            db: (prop: icingProp) => boolean(prop.name).notNull().default(false),
        },
    ],
};

export const makeTable = (schema: icingSchema) => {
    const columns: Record<string, AnyMySqlColumnBuilder> = {};
    const uniqueIndexes: Record<string, any> = {};
    for (const prop of schema.props) {
        columns[prop.name] = prop.db(prop);
        if (prop.unique) {
            const key = prop.name + 'Index';
            uniqueIndexes[key] = (table: Record<string, AnyMySqlColumn>) => uniqueIndex(key).on(table[prop.name]);
        }
    }
    const extras = (table: Record<string, any>) => {
        const out: Record<string, any> = {};
        for (const key in uniqueIndexes) {
            out[key] = uniqueIndexes[key](table);
        }
        return out;
    }
    return mysqlTable(schema.tableName, columns, extras)
}

export const users = makeTable(userSchema);

export type User = InferModel<typeof users>; // return type when queried
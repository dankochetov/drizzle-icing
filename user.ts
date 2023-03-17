import { InferModel, MySqlTableWithColumns, boolean, mysqlEnum, mysqlTable, timestamp, varchar } from 'drizzle-orm/mysql-core';
import type { AnyMySqlColumnBuilder, BuildColumns } from 'drizzle-orm/mysql-core/columns/common';

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

export interface icingProp<TColumnBuilder extends AnyMySqlColumnBuilder> {
    length?: number,
    db: (prop: icingProp<never> & { name: string }) => TColumnBuilder,
    enums?: [string, ...string[]],
}

export type icingSchema<TName extends string, TProps extends Record<string, icingProp<any>>> = {
    tableName: TName,
    props: TProps,
}

export function createSchema<TName extends string,  TProps extends Record<string, icingProp<any>>>(schema: icingSchema<TName, TProps>) {
    return schema;
}

export const userSchema = createSchema({
    tableName: 'users',
    props: {
        id: {
            length: 36,
            db: (prop) => varchar(prop.name, { length: prop.length || 256 }).primaryKey(),
        },
        createdAt: {
            db: (prop) => timestamp(prop.name).defaultNow().notNull(),
        },
        username: {
            length: 60,
            db: (prop) => varchar(prop.name, { length: prop.length || 256 }).notNull().default('')
        },
        password: {
            db: (prop) => varchar(prop.name, { length: prop.length || 256 }).notNull().default('no-password-specified'),
        },
        useAsDisplayName: {
            length: 20,
            db: (prop) => mysqlEnum(prop.name, prop.enums as ['username', 'email', 'realName']).notNull().default('username'),
            enums: ['username', 'email', 'realName'],
        },
        admin: {
            db: (prop) => boolean(prop.name).notNull().default(false),
        },
    }
});

export type MakeDrizzleTable<T extends icingSchema<any, any>> = T extends icingSchema<infer TName, infer TColumns>
    ? MySqlTableWithColumns<{
        name: TName;
        columns: BuildColumns<TName, {
            [K in keyof TColumns]: TColumns[K] extends icingProp<infer TColumnBuilder> ? TColumnBuilder : never
        }>;
    }>
    : never;

export function makeTable<T extends icingSchema<any, any>>(schema: T): MakeDrizzleTable<T> {
    const columns: Record<string, AnyMySqlColumnBuilder> = {};
    for (const prop of schema.props) {
        columns[prop.name] = prop.db(prop);
    }
    return mysqlTable(schema.tableName, columns) as MakeDrizzleTable<T>;
}

export const users = makeTable(userSchema);

export type User = InferModel<typeof users>; // return type when queried

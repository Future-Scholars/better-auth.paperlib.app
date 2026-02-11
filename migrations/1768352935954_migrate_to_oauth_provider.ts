import { type Kysely } from "kysely";
import { sql } from "kysely";

/**
 * Migrate to OAuth Provider (@better-auth/oauth-provider) schema.
 *
 * - Creates new tables: oauthClient, oauthRefreshToken
 * - Drops and recreates oauthAccessToken with new schema (existing token data is discarded)
 * - Alters oauthConsent: adds referenceId
 *
 * Execution order: oauthClient → oauthRefreshToken → drop oauthAccessToken → create oauthAccessToken → alter oauthConsent.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
	// 1. Create oauthClient (new table)
	await db.schema
		.createTable("oauthClient")
		.addColumn("id", "text", (col) => col.primaryKey())
		.addColumn("clientId", "text", (col) => col.notNull().unique())
		.addColumn("clientSecret", "text")
		.addColumn("disabled", "boolean")
		.addColumn("skipConsent", "boolean")
		.addColumn("enableEndSession", "boolean")
		.addColumn("scopes", "jsonb")
		.addColumn("userId", "text", (col) => col.references("user.id").onDelete("cascade"))
		.addColumn("createdAt", "timestamptz")
		.addColumn("updatedAt", "timestamptz")
		.addColumn("name", "text")
		.addColumn("uri", "text")
		.addColumn("icon", "text")
		.addColumn("contacts", "jsonb")
		.addColumn("tos", "text")
		.addColumn("policy", "text")
		.addColumn("softwareId", "text")
		.addColumn("softwareVersion", "text")
		.addColumn("softwareStatement", "text")
		.addColumn("redirectUris", "jsonb", (col) => col.notNull())
		.addColumn("postLogoutRedirectUris", "jsonb")
		.addColumn("tokenEndpointAuthMethod", "text")
		.addColumn("grantTypes", "jsonb")
		.addColumn("responseTypes", "jsonb")
		.addColumn("public", "boolean")
		.addColumn("type", "text")
		.addColumn("referenceId", "text")
		.addColumn("metadata", "jsonb")
		.execute();

	// 2. Create oauthRefreshToken (references oauthClient)
	await db.schema
		.createTable("oauthRefreshToken")
		.addColumn("id", "text", (col) => col.primaryKey())
		.addColumn("token", "text", (col) => col.notNull())
		.addColumn("clientId", "text", (col) => col.notNull().references("oauthClient.clientId").onDelete("cascade"))
		.addColumn("sessionId", "text", (col) => col.references("session.id").onDelete("set null"))
		.addColumn("userId", "text", (col) => col.notNull().references("user.id").onDelete("cascade"))
		.addColumn("referenceId", "text")
		.addColumn("expiresAt", "timestamptz", (col) => col.notNull())
		.addColumn("createdAt", "timestamptz", (col) => col.notNull())
		.addColumn("revoked", "timestamptz")
		.addColumn("scopes", "jsonb", (col) => col.notNull())
		.execute();

	// 3. Drop and recreate oauthAccessToken (new schema; existing data discarded)
	await db.schema.dropTable("oauthAccessToken").ifExists().execute();
	await db.schema
		.createTable("oauthAccessToken")
		.addColumn("id", "text", (col) => col.primaryKey())
		.addColumn("token", "text", (col) => col.notNull().unique())
		.addColumn("clientId", "text", (col) => col.notNull().references("oauthClient.clientId").onDelete("cascade"))
		.addColumn("sessionId", "text", (col) => col.references("session.id").onDelete("set null"))
		.addColumn("userId", "text", (col) => col.references("user.id").onDelete("cascade"))
		.addColumn("referenceId", "text")
		.addColumn("refreshId", "text", (col) => col.references("oauthRefreshToken.id").onDelete("cascade"))
		.addColumn("expiresAt", "timestamptz", (col) => col.notNull())
		.addColumn("createdAt", "timestamptz", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
		.addColumn("scopes", "jsonb", (col) => col.notNull())
		.execute();

	// 4. Alter oauthConsent: add referenceId
	await db.schema
		.alterTable("oauthConsent")
		.addColumn("referenceId", "text")
		.execute();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
	// 1. Remove added column from oauthConsent
	await db.schema.alterTable("oauthConsent").dropColumn("referenceId").execute();

	// 2. Drop new oauthAccessToken and recreate old OIDC-style table
	await db.schema.dropTable("oauthAccessToken").ifExists().execute();
	await db.schema
		.createTable("oauthAccessToken")
		.addColumn("id", "text", (col) => col.primaryKey())
		.addColumn("accessToken", "text", (col) => col.notNull().unique())
		.addColumn("refreshToken", "text", (col) => col.notNull().unique())
		.addColumn("accessTokenExpiresAt", "timestamptz", (col) => col.notNull())
		.addColumn("refreshTokenExpiresAt", "timestamptz", (col) => col.notNull())
		.addColumn("clientId", "text", (col) => col.notNull().references("oauthApplication.clientId").onDelete("cascade"))
		.addColumn("userId", "text", (col) => col.references("user.id").onDelete("cascade"))
		.addColumn("scopes", "text", (col) => col.notNull())
		.addColumn("createdAt", "timestamptz", (col) => col.notNull())
		.addColumn("updatedAt", "timestamptz", (col) => col.notNull())
		.execute();

	// 3. Drop new tables (dependents first)
	await db.schema.dropTable("oauthRefreshToken").ifExists().execute();
	await db.schema.dropTable("oauthClient").ifExists().execute();
}

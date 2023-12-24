import { relations, sql } from "drizzle-orm";
import {
  boolean,
  bigint,
  serial,
  index,
  int,
  mysqlTableCreator,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { type AdapterAccount } from "next-auth/adapters";
import { createId } from "@paralleldrive/cuid2";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const mysqlTable = mysqlTableCreator((name) => `quote-library__${name}`);

export const users = mysqlTable(
  "user",
  {
    id: varchar("id", { length: 128 })
      .primaryKey()
      .$defaultFn(() => createId()),
    name: varchar("name", { length: 255 }),
    email: varchar("email", { length: 255 }).notNull(),
    emailVerified: timestamp("emailVerified", {
      mode: "date",
      fsp: 3,
    }).default(sql`CURRENT_TIMESTAMP(3)`),
    image: varchar("image", { length: 255 }),
  },
  (user) => ({
    emailIndex: index("email_idx").on(user.email),
  }),
);

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  quotes: many(quotes),
}));

export const accounts = mysqlTable(
  "account",
  {
    userId: varchar("userId", { length: 128 }),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    refresh_token_expires_in: int("refresh_token_expires_in"),
    access_token: text("access_token"),
    expires_at: int("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey(account.provider, account.providerAccountId),
    userIdIdx: index("userId_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = mysqlTable(
  "session",
  {
    sessionToken: varchar("sessionToken", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("userId", { length: 128 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (session) => ({
    userIdIdx: index("userId_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = mysqlTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier, vt.token),
  }),
);

export const quotes = mysqlTable(
  "quote",
  {
    id: bigint("id", { mode: "number" }).notNull().primaryKey().autoincrement(),
    userId: varchar("userId", { length: 128 }).notNull(),
    text: varchar("text", { length: 3000 }).notNull(),
    bookId: bigint("bookId", { mode: "number" }).notNull(),
    context: varchar("context", { length: 500 }),
    pageNumber: varchar("pageNumber", { length: 20 }),
    createdAt: timestamp("createdAt")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
    quotedBy: bigint("quotedBy", { mode: "number" }),
    isImportant: boolean("isImportant"),
    isPrivate: boolean("isPrivate"),
  },
  (quote) => ({
    userIdIndex: index("userId_idx").on(quote.userId),
    bookIdIndex: index("bookId_idx").on(quote.bookId),
    quotedByIndex: index("quotedBy_idx").on(quote.quotedBy),
    isImportantIndex: index("isImportant_idx").on(quote.isImportant),
  }),
);

export const quotesRelations = relations(quotes, ({ one, many }) => ({
  user: one(users, { fields: [quotes.userId], references: [users.id] }),
  book: one(books, { fields: [quotes.bookId], references: [books.id] }),
  authors: many(quotesToAuthors),
  topics: many(quotesToTopics),
  tags: many(quotesToTags),
  types: many(quotesToTypes),
}));

export const quotesToAuthors = mysqlTable(
  "quote_to_author",
  {
    quoteId: bigint("quoteId", { mode: "number" }).notNull(),
    authorId: bigint("authorId", { mode: "number" }).notNull(),
  },
  (quoteToAuthor) => ({
    compoundKey: primaryKey(quoteToAuthor.quoteId, quoteToAuthor.authorId),
  }),
);

export const quotesToAuthorsRelations = relations(
  quotesToAuthors,
  ({ one }) => ({
    quote: one(quotes, {
      fields: [quotesToAuthors.quoteId],
      references: [quotes.id],
    }),
    author: one(authors, {
      fields: [quotesToAuthors.authorId],
      references: [authors.id],
    }),
  }),
);

export const authors = mysqlTable(
  "author",
  {
    id: bigint("id", { mode: "number" }).notNull().primaryKey().autoincrement(),
    firstName: varchar("firstName", { length: 255 }).notNull(),
    lastName: varchar("lastName", { length: 255 }).notNull(),
    birthYear: int("birthYear"),
    deathYear: int("deathYear"),
    nationality: varchar("nationality", { length: 255 }),
    biography: text("biography"),
  },
  (author) => ({
    authorNameIndex: index("authorName_idx").on(
      author.firstName,
      author.lastName,
    ),
    authorNationalityIndex: index("authorNationality_idx").on(
      author.nationality,
    ),
  }),
);

export const authorsRelations = relations(authors, ({ many }) => ({
  books: many(booksToAuthors),
  quotes: many(quotesToAuthors),
}));

export const booksToAuthors = mysqlTable(
  "book_to_author",
  {
    bookId: bigint("bookId", { mode: "number" }).notNull(),
    authorId: bigint("authorId", { mode: "number" }).notNull(),
  },
  (bookAuthor) => ({
    compoundKey: primaryKey(bookAuthor.bookId, bookAuthor.authorId),
  }),
);

export const booksToAuthorsRelations = relations(booksToAuthors, ({ one }) => ({
  author: one(authors, {
    fields: [booksToAuthors.authorId],
    references: [authors.id],
  }),
  book: one(books, {
    fields: [booksToAuthors.bookId],
    references: [books.id],
  }),
}));

export const books = mysqlTable(
  "book",
  {
    id: bigint("id", { mode: "number" }).notNull().primaryKey().autoincrement(),
    title: varchar("title", { length: 255 }).notNull().unique(),
    publicationYear: varchar("publicationYear", { length: 10 }),
    isbn: varchar("isbn", { length: 20 }).unique(),
    publisherId: bigint("publisherId", { mode: "number" }).notNull(),
    summary: text("summary"),
    citation: varchar("citation", { length: 500 }).unique(),
    sourceLink: varchar("sourceLink", { length: 500 }),
    rating: int("rating"),
  },
  (book) => ({
    bookTitleIndex: index("bookTitle_idx").on(book.title),
    bookIsbnIndex: index("bookIsbn_idx").on(book.isbn),
    bookPublisherIndex: index("bookPublisher_idx").on(book.publisherId),
    bookRatingIndex: index("bookRating_idx").on(book.rating),
  }),
);

export const booksRelations = relations(books, ({ one, many }) => ({
  publisher: one(publishers, {
    fields: [books.publisherId],
    references: [publishers.id],
  }),
  genre: many(booksToGenres),
  authors: many(booksToAuthors),
}));

export const publishersToBooks = mysqlTable(
  "publisher_to_book",
  {
    publisherId: bigint("publisherId", { mode: "number" }).notNull(),
    bookId: bigint("bookId", { mode: "number" }).notNull(),
  },
  (publisherToBook) => ({
    compoundKey: primaryKey(
      publisherToBook.publisherId,
      publisherToBook.bookId,
    ),
  }),
);

export const publishersToBooksRelations = relations(
  publishersToBooks,
  ({ one }) => ({
    publisher: one(publishers, {
      fields: [publishersToBooks.publisherId],
      references: [publishers.id],
    }),
    book: one(books, {
      fields: [publishersToBooks.bookId],
      references: [books.id],
    }),
  }),
);

export const publishers = mysqlTable(
  "publisher",
  {
    id: serial("id").notNull().primaryKey().autoincrement(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    cityId: bigint("cityId", { mode: "number" }).notNull(),
    stateId: bigint("stateId", { mode: "number" }).notNull(),
    countryId: bigint("countryId", { mode: "number" }).notNull(),
  },
  (publisher) => ({
    publisherNameIndex: index("publisherName_idx").on(publisher.name),
  }),
);

export const publishersRelations = relations(publishers, ({ one, many }) => ({
  city: one(cities, {
    fields: [publishers.cityId],
    references: [cities.id],
  }),
  state: one(states, {
    fields: [publishers.stateId],
    references: [states.id],
  }),
  country: one(countries, {
    fields: [publishers.countryId],
    references: [countries.id],
  }),
  books: many(publishersToBooks),
}));

export const publishersToCities = mysqlTable(
  "publisher_to_city",
  {
    publisherId: bigint("publisherId", { mode: "number" }).notNull(),
    cityId: bigint("cityId", { mode: "number" }).notNull(),
  },
  (publisherToCity) => ({
    compoundKey: primaryKey(
      publisherToCity.publisherId,
      publisherToCity.cityId,
    ),
  }),
);

export const publishersToCitiesRelations = relations(
  publishersToCities,
  ({ one }) => ({
    publisher: one(publishers, {
      fields: [publishersToCities.publisherId],
      references: [publishers.id],
    }),
    city: one(cities, {
      fields: [publishersToCities.cityId],
      references: [cities.id],
    }),
  }),
);

export const genres = mysqlTable(
  "genre",
  {
    id: serial("id").notNull().primaryKey().autoincrement(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    description: text("description"),
  },
  (genre) => ({
    genreNameIndex: index("genreName_idx").on(genre.name),
  }),
);

export const genresRelations = relations(genres, ({ many }) => ({
  books: many(booksToGenres),
}));

export const booksToGenres = mysqlTable(
  "book_to_genre",
  {
    bookId: bigint("bookId", { mode: "number" }).notNull(),
    genreId: bigint("genreId", { mode: "number" }).notNull(),
  },
  (bookToGenre) => ({
    compoundKey: primaryKey(bookToGenre.bookId, bookToGenre.genreId),
  }),
);

export const booksToGenresRelations = relations(booksToGenres, ({ one }) => ({
  book: one(books, {
    fields: [booksToGenres.bookId],
    references: [books.id],
  }),
  genre: one(genres, {
    fields: [booksToGenres.genreId],
    references: [genres.id],
  }),
}));

export const topics = mysqlTable(
  "topic",
  {
    id: serial("id").primaryKey().autoincrement(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    description: text("description"),
  },
  (topic) => ({
    topicNameIndex: index("topicName_idx").on(topic.name),
  }),
);

export const topicsRelations = relations(topics, ({ many }) => ({
  quotes: many(quotesToTopics),
}));

export const quotesToTopics = mysqlTable(
  "quote_to_topic",
  {
    quoteId: bigint("quoteId", { mode: "number" }).notNull(),
    topicId: bigint("topicId", { mode: "number" }).notNull(),
  },
  (quoteToTopic) => ({
    compoundKey: primaryKey(quoteToTopic.quoteId, quoteToTopic.topicId),
  }),
);

export const quotesToTopicsRelations = relations(quotesToTopics, ({ one }) => ({
  quote: one(quotes, {
    fields: [quotesToTopics.quoteId],
    references: [quotes.id],
  }),
  topic: one(topics, {
    fields: [quotesToTopics.topicId],
    references: [topics.id],
  }),
}));

export const tags = mysqlTable(
  "tag",
  {
    id: serial("id").primaryKey().autoincrement(),
    name: varchar("name", { length: 255 }).notNull().unique().unique(),
    description: text("description"),
  },
  (tag) => ({
    tagNameIndex: index("tagName_idx").on(tag.name),
  }),
);

export const tagsRelations = relations(tags, ({ many }) => ({
  quotes: many(quotesToTags),
}));

export const quotesToTags = mysqlTable(
  "quote_to_tag",
  {
    quoteId: bigint("quoteId", { mode: "number" }).notNull(),
    tagId: bigint("tagId", { mode: "number" }).notNull(),
  },
  (quoteToTag) => ({
    compoundKey: primaryKey(quoteToTag.quoteId, quoteToTag.tagId),
  }),
);

export const quotesToTagsRelations = relations(quotesToTags, ({ one }) => ({
  quote: one(quotes, {
    fields: [quotesToTags.quoteId],
    references: [quotes.id],
  }),
  tag: one(tags, {
    fields: [quotesToTags.tagId],
    references: [tags.id],
  }),
}));

export const types = mysqlTable(
  "type",
  {
    id: serial("id").notNull().primaryKey().autoincrement(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    description: text("description"),
  },
  (type) => ({
    quoteToTypeNameIndex: index("quoteToTypeName_idx").on(type.name),
  }),
);

export const typesRelations = relations(types, ({ many }) => ({
  quotes: many(quotesToTypes),
}));

export const quotesToTypes = mysqlTable(
  "quote_to_type",
  {
    quoteId: bigint("quoteId", { mode: "number" }).notNull(),
    typeId: bigint("typeId", { mode: "number" }).notNull(),
  },
  (quoteToType) => ({
    compoundKey: primaryKey(quoteToType.quoteId, quoteToType.typeId),
  }),
);

export const quotesToTypesRelations = relations(quotesToTypes, ({ one }) => ({
  quote: one(quotes, {
    fields: [quotesToTypes.quoteId],
    references: [quotes.id],
  }),
  type: one(types, {
    fields: [quotesToTypes.typeId],
    references: [types.id],
  }),
}));

export const cities = mysqlTable(
  "city",
  {
    id: serial("id").notNull().primaryKey().autoincrement(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    stateId: bigint("stateId", { mode: "number" }),
    countryId: bigint("countryId", { mode: "number" }).notNull(),
  },
  (city) => ({
    cityNameIndex: index("cityName_idx").on(city.name),
  }),
);

export const citiesRelations = relations(cities, ({ one, many }) => ({
  state: one(states, {
    fields: [cities.stateId],
    references: [states.id],
  }),
  country: one(countries, {
    fields: [cities.countryId],
    references: [countries.id],
  }),
  publishers: many(publishersToCities),
}));

export const states = mysqlTable(
  "state",
  {
    id: serial("id").notNull().primaryKey().autoincrement(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    abbreviation: varchar("abbreviation", { length: 20 }).unique(),
    countryId: bigint("countryId", { mode: "number" }).notNull(),
  },
  (state) => ({
    stateNameIndex: index("stateName_idx").on(state.name),
  }),
);

export const statesRelations = relations(states, ({ one, many }) => ({
  country: one(countries, {
    fields: [states.countryId],
    references: [countries.id],
  }),
  cities: many(statesToCities),
}));

export const statesToCities = mysqlTable(
  "state_to_city",
  {
    stateId: bigint("stateId", { mode: "number" }).notNull(),
    cityId: bigint("cityId", { mode: "number" }).notNull(),
  },
  (stateToCity) => ({
    compoundKey: primaryKey(stateToCity.stateId, stateToCity.cityId),
  }),
);

export const statesToCitiesRelations = relations(statesToCities, ({ one }) => ({
  state: one(states, {
    fields: [statesToCities.stateId],
    references: [states.id],
  }),
  city: one(cities, {
    fields: [statesToCities.cityId],
    references: [cities.id],
  }),
}));

export const countries = mysqlTable(
  "country",
  {
    id: serial("id").notNull().primaryKey().autoincrement(),
    name: varchar("name", { length: 255 }).notNull().unique(),
  },
  (country) => ({
    countryNameIndex: index("countryName_idx").on(country.name),
  }),
);

export const countriesRelations = relations(countries, ({ many }) => ({
  cities: many(countriesToCities),
  states: many(countriesToStates),
}));

export const countriesToStates = mysqlTable(
  "country_to_state",
  {
    countryId: bigint("countryId", { mode: "number" }).notNull(),
    stateId: bigint("stateId", { mode: "number" }).notNull(),
  },
  (countryToState) => ({
    compoundKey: primaryKey(countryToState.countryId, countryToState.stateId),
  }),
);

export const countriesToStatesRelations = relations(
  countriesToStates,
  ({ one }) => ({
    country: one(countries, {
      fields: [countriesToStates.countryId],
      references: [countries.id],
    }),
    state: one(states, {
      fields: [countriesToStates.stateId],
      references: [states.id],
    }),
  }),
);

export const countriesToCities = mysqlTable(
  "country_to_city",
  {
    countryId: bigint("countryId", { mode: "number" }).notNull(),
    cityId: bigint("cityId", { mode: "number" }).notNull(),
  },
  (countryToCity) => ({
    compoundKey: primaryKey(countryToCity.countryId, countryToCity.cityId),
  }),
);

export const countriesToCitiesRelations = relations(
  countriesToCities,
  ({ one }) => ({
    country: one(countries, {
      fields: [countriesToCities.countryId],
      references: [countries.id],
    }),
    city: one(cities, {
      fields: [countriesToCities.cityId],
      references: [cities.id],
    }),
  }),
);
CREATE TABLE IF NOT EXISTS blogs (
  id SERIAL PRIMARY KEY,
  author TEXT,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  likes INTEGER DEFAULT 0
);

ALTER TABLE blogs
  ALTER COLUMN url SET NOT NULL,
  ALTER COLUMN title SET NOT NULL;

INSERT INTO blogs (author, url, title, likes)
VALUES ('Dan Abramov', 'https://react.dev/', 'On the wet codebase', 15);

INSERT INTO blogs (author, url, title, likes)
VALUES ('Martin Fowler', 'https://martinfowler.com/articles/refactoring.html', 'Refactoring a JavaScript Application', 24);

-- Verify the inserted data
SELECT * FROM blogs;
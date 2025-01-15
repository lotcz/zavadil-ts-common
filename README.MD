## React TS Library

Common types for UI apps in React Typescript.

### Publish

Before publishing, you must first log into `npm`:

    npm adduser

after you are logged in, locate file `.npmrc` (something like `c:\Users\you\.npmrc` or `/home/you/.npmrc`) 
and set `NPMRC_PATH` in `.env` file to point to its location.

To publish package into `npm`, change version number in `package.json` and run:

    bin/publish

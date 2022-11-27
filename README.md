<h1 align="center">GitHub Contribution Calendar API</h1>

This is a Cloudflare Worker (serverless function) that one could use to access the contribution data that goes into forming the calendar shown on a user's GitHub profile page.

## Usage

You can find an interactive instruction page to test the data here: https://gh-calendar.rschristian.dev

An instance of this API is available here: https://gh-calendar.rschristian.dev/user/{username}

However, availability of this is not guaranteed and service may go down without warning. See [Hosting](#hosting) if that is a concern.

### Query Parameters

Additionally, a few query arguments are supported:

- `year`
  - Type: Number<br />
  - Default: `null`

    Use this to customize which year's data you'd like. By default, the API returns the last 365 days rather than a calendar year.
- `limit`
  - Type: Number<br />
  - Default: `null`

    Unlikely to be useful, but limits the data returned to the first `X` number of weeks in the data set.

## Hosting

One could deploy their own instance from the source here. I have this set up to run as a Cloudflare worker using [`worktop`](https://github.com/lukeed/worktop) & [`cfw`](https://github.com/lukeed/cfw). After following `cfw`'s instructions to set up a config file, edit [cfw.json](workers/api/cfw.json) with your credentials.

You can then deploy by running the following:

```
yarn
yarn build:workers
yarn deploy
```

Give it a star if this is useful for you.

## License

MIT © Ryan Christian

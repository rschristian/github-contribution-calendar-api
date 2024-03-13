<h1 align="center">GitHub Contribution Calendar API</h1>

This is a simple API to extract the contribution data that goes into forming the calendar shown on a a user's GitHub profile page.

Set up to run as a Cloudflare Worker (serverless function), but easily adaptable if you'd like to extract and run it elsewhere.

## Usage

You can find an interactive instruction page to test the data here: https://gh-calendar.rschristian.dev

An instance of this API is available here: https://gh-calendar.rschristian.dev/user/{username}

However, availability of this is not guaranteed and service may go down without warning.

### Query Parameters

Additionally, a few query arguments are supported:

-   `year`

    -   Type: Number<br />
    -   Default: `null`

        Use this to customize which year's data you'd like. By default, the API returns the last 365 days rather than a calendar year.

-   `limit`

    -   Type: Number<br />
    -   Default: `null`

        Unlikely to be useful, but limits the data returned to the first `X` number of weeks in the data set.

Give it a star if this is useful for you.

## License

MIT © Ryan Christian

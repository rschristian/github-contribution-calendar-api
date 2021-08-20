<h1 align="center">GitHub Contribution Calendar API</h1>

This is a Cloudflare Worker (serverless function) that one could use to access the contribution data that goes into forming the calendar shown on a user's GitHub profile page.

## Usage

There's a couple ways one could use this:

Firstly, I have an instance of this API running at https://gh-calendar.rschristian.dev. You can use that address to get to an instruction page and use https://gh-calendar.rschristian.dev/user/{username} for retrieving data from the API. Availability of this is not guaranteed, service may go down without warning.

Secondly, you could deploy your own instance from the source here. I have this set up to run as a Cloudflare worker using [`worktop`](https://github.com/lukeed/worktop) & [`cfw`](https://github.com/lukeed/cfw). After following `cfw`'s instructions to set up a config file, edit [cfw.json](workers/api/cfw.json) with your credentials.

You can then deploy by running the following:

```
yarn
yarn build:workers
yarn deploy
```

Give it a star if this is useful for you.

## License

MIT © Ryan Christian

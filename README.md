<h1 align="center">GitHub Contribution Calendar API</h1>

This is a simple API server that one could use to access the contribution data that goes into forming the calendar shown on a user's GitHub profile page.

## Usage

There's a few ways one could use this. 

Firstly, I have an instance of this API running at `https://githubapi.ryanchristian.dev`. You can use that address to get to an instruction page, or use `https://githubapi.ryanchristian.dev/user/{username}` for actually retrieving data. Availability of this is not guaranteed, service may go down without warning.

Secondly, you can use the Docker container I have built for running this server, which can be found at [ryanchristian4427/github-contribution-calendar-api](https://hub.docker.com/r/ryanchristian4427/github-contribution-calendar-api). To run it, you can use something along the lines of the following:

```bash
docker run -d \
    -p 3000:3000 \
    --name github_api \
    ryanchristian4427/github-contribution-calendar-api
```

This will of course run on port 3000 by default. 

Lastly, you can just run this server. Install only production dependencies with `yarn install --prod` (or the NPM equivalent) and then run `yarn serve:prod`. Alternatively install all dependencies and run a hot-reloading server with nodemon. 

## License

MIT © Ryan Christian


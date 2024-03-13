import { Root, Header, Main, Footer } from '@rschristian/intrepid-design';
import { withTwind } from '@rschristian/twind-wmr';

export function App() {
    return (
        <Root>
            <Header RSC={{ href: 'https://github.com/rschristian', label: 'My GitHub Account' }}>
                <Header.NavItem
                    href="https://github.com/rschristian/github-contribution-calendar-api"
                    label="Source Code on GitHub"
                    iconId="github"
                />
                <Header.NavItem
                    href="https://twitter.com/_rschristian"
                    label="My Twitter Account"
                    iconId="twitter"
                />
                <Header.ThemeToggle />
            </Header>
            <Main>
                <h1 class="mb-2 text(primary(& dark:light) 5xl center lg:left)">
                    GitHub Contribution Calendar API
                </h1>
                <div class="flex justify(center lg:left) mb-12">
                    <a
                        class="mr-1"
                        href="https://github.com/rschristian/preact-github-calendar/blob/master/LICENSE"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <img
                            alt="License: MIT"
                            src="https://img.shields.io/npm/l/preact-github-calendar?color=%2300b7f3"
                            width="78"
                            height="20"
                            loading="lazy"
                        />
                    </a>
                </div>
                <p class="mb-3 text(xl center lg:left)">
                    This is an API for retrieving the data that makes up a user's contribution
                    calendar on their GitHub profile page.
                </p>
                <p class="mb-3 text(xl center lg:left)">
                    Below is a sample of the data that is returned. By default, my own profile data
                    is provided, but you can submit your own user name or others to see the data
                    structure that is returned.
                </p>
                <p class="mb-6 text(xl center lg:left)">
                    This API will cache values, so counts are only updated once per 24 hours per
                    user. Therefore the numbers you get could differ slightly from those displayed
                    on GitHub itself.
                </p>
                <input
                    id="user-selector"
                    class="w(full lg:2/6) mb-2 p-2 bg-code(& dark:dark) rounded-lg shadow outline-none ring-primary focus:ring"
                    placeholder="Enter a GitHub username"
                />
                <CodeBlock />
            </Main>
            <Footer year={2021} />
        </Root>
    );
}

function CodeBlock() {
    return (
        <pre class="h-1/2 p-4 bg-code(& dark:dark) shadow-lg rounded-lg overflow-x-auto">
            <code id="jsonData" class="language-json" />
        </pre>
    );
}

const { hydrate, prerender } = withTwind(
    () => import('./styles/twind.config.js'),
    () => <App />,
);

hydrate(<App />);

export { prerender };

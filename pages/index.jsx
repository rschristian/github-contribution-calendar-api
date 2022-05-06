import { withTwind } from '@rschristian/twind-wmr';

import { Header } from './components/core/Header.jsx';
import { Footer } from './components/core/Footer.jsx';
import { CodeBlock } from './components/CodeBlock.jsx';

export function App() {
    return (
        <div class="flex(& col) h-full px-5 text-content(& dark:dark) bg([#f8f8f8] dark:[#27272a])">
            <Header />
            <main class="max-w-4xl flex-1 mb(16 md:32 lg:48) mx-auto">
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
            </main>
            <Footer />
        </div>
    );
}

const { hydrate, prerender } = withTwind(
    () => import('./styles/twind.config.js').then(({ twindConfig }) => twindConfig),
    () => <App />,
);

hydrate(<App />);

export { prerender };

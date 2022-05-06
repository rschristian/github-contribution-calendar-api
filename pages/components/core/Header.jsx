export function Header() {
    return (
        <header class="flex w-full max-w-4xl mt(8 md:16) mb(16 md:36) mx-auto">
            <div class="flex justify-between w-full">
                <a
                    class="text(3xl hover:white-muted) font-bold tracking-wider"
                    href="https://github.com/rschristian"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="My GitHub Account"
                >
                    RSC
                </a>
                <nav class="flex">
                    <NavItem
                        href="https://github.com/rschristian/github-contribution-calendar-api"
                        label="Source Code on GitHub"
                        icon={
                            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                        }
                    />
                    <NavItem
                        href="https://twitter.com/_rschristian"
                        label="My Twitter Account"
                        icon={
                            <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                        }
                    />
                </nav>
            </div>
        </header>
    );
}

/**
 * @param {Object} props
 * @param {string} props.href
 * @param {string} props.label
 * @param {import('preact').VNode} props.icon
 */
function NavItem(props) {
    return (
        <a
            href={props.href}
            class="ml(6 first:0) py-2 px-1 border(b white-muted hover:primary)"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={props.label}
        >
            {
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    alt={props.label}
                    role="img"
                >
                    {props.icon}
                </svg>
            }
        </a>
    );
}

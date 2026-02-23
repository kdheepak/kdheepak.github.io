import { SITE } from "@/config";

interface Social {
    name: string;
    href: string;
    linkTitle: string;
    icon: string;
}

export const SOCIALS: Social[] = [
    {
        name: "GitHub",
        href: "https://github.com/kdheepak/",
        linkTitle: `${SITE.title} on GitHub`,
        icon: "tabler:brand-github",
    },
    {
        name: "LinkedIn",
        href: "https://www.linkedin.com/in/dheepak-krishnamurthy/",
        linkTitle: `${SITE.title} on LinkedIn`,
        icon: "tabler:brand-linkedin",
    },
    {
        name: "Mail",
        href: "mailto:me@kdheepak.com",
        linkTitle: `Send an email to ${SITE.title}`,
        icon: "tabler:mail",
    },
    {
        name: "RSS",
        href: "/rss.xml",
        linkTitle: `${SITE.title} RSS feed`,
        icon: "tabler:rss",
    },
] as const;

export const SHARE_LINKS: Social[] = [
    {
        name: "WhatsApp",
        href: "https://wa.me/?text=",
        linkTitle: `Share this post via WhatsApp`,
        icon: "tabler:brand-whatsapp",
    },
    {
        name: "Facebook",
        href: "https://www.facebook.com/sharer.php?u=",
        linkTitle: `Share this post on Facebook`,
        icon: "tabler:brand-facebook",
    },
    {
        name: "X",
        href: "https://x.com/intent/post?url=",
        linkTitle: `Share this post on X`,
        icon: "tabler:brand-x",
    },
    {
        name: "Bluesky",
        href: "https://bsky.app/intent/compose?text=",
        linkTitle: `Share this post on Bluesky`,
        icon: "tabler:brand-bluesky",
    },
    {
        name: "Telegram",
        href: "https://t.me/share/url?url=",
        linkTitle: `Share this post via Telegram`,
        icon: "tabler:brand-telegram",
    },
    {
        name: "Pinterest",
        href: "https://pinterest.com/pin/create/button/?url=",
        linkTitle: `Share this post on Pinterest`,
        icon: "tabler:brand-pinterest",
    },
    {
        name: "Mail",
        href: "mailto:?subject=See%20this%20post&body=",
        linkTitle: `Share this post via email`,
        icon: "tabler:mail",
    },
] as const;

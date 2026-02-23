export const SITE = {
    website: "https://kdheepak.com/",
    author: "Dheepak Krishnamurthy",
    profile: "https://kdheepak.com/",
    desc: "Notes, logs and experiments.",
    title: "kd",
    license: {
        name: "CC BY-SA 4.0",
        url: "https://creativecommons.org/licenses/by-sa/4.0/",
    },
    lightAndDarkMode: true,
    postPerIndex: 4,
    postPerPage: 4,
    scheduledPostMargin: 15 * 60 * 1000,
    showBackButton: true,
    editPost: {
        enabled: true,
        text: "Edit page",
        url: "https://github.com/kdheepak/kdheepak.github.io/edit/main/",
    },
    notebookView: {
        enabled: true,
        text: "View notebook",
        url: "https://nbviewer.org/github/kdheepak/kdheepak.github.io/blob/main/",
    },
    sourceCommit: {
        enabled: true,
        text: "View source at commit",
        url: "https://github.com/kdheepak/kdheepak.github.io/blob/",
    },
    dir: "ltr",
    lang: "en",
    timezone: "America/Toronto",
} as const;

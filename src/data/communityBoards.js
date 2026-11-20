// This holds the local data for the community boards. The members and their boards are placeholders for other users

export const communityBoards = [
    {
        id: "laura-saved",
        owner: "Laura",
        kind: "Saved pieces",
        title: "Laura's saved pieces",
        description: "Everything Laura has saved",
        artworkIds: [28560, 16568],
    },
    {
        id: "brandon-saved",
        owner: "Brandon",
        kind: "Saved pieces",
        title: "Brandon's saved pieces",
        description: "Love big scenes with alot going on",
        artworkIds: [27992],
    },
    {
        id: "laura-colour",
        owner: "Laura",
        kind: "Collection",
        title: "Colour studies",
        description: "Paintings with a lot of colours",
        artworkIds: [27992, 28560, 16568],
    },
    {
        id: "Paul-quiet",
        owner: "Paul",
        kind: "Collection",
        title: "Quiet spaces",
        description: "I find these pieces very calming, no one in a rush",
        artworkIds: [28560, 16568],
    },
];

export const starterThreads = [
    {
        id: 1,
        artworkId: 28560,
        author: "Laura",
        title: "Why is the floor tilted like that?",
        text: "It looks off in purpose. Did Van gough copy a real room for this?",
        replies: [
            {id: 2, author: "Brandon", text: "Ya, im pretty sure that was his actual room, he just flattened it on purpose"},
        ],
    },
    {
        id: 3, 
        artworkId: 16568,
        author: "Paul",
        title: "How big is this pond?!",
        text: "",
        replies: [],
    },
];
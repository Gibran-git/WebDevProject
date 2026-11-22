// This holds the local data for the community boards. The members and their boards are placeholders for other users

export const communityBoards = [
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
        artworkIds: [16568, 28560, 27992],
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
        id: 2, 
        artworkId: 16568,
        author: "Paul",
        title: "How big is this pond?!",
        text: "",
        replies: [],
    },
    {
        id: 3,
        artworkId: "met-435877",
        author: "Brian",
        title: "Where is this?",
        text: "I love the scenery and would love to visit here if its based off a real place",
        replies: [
            {id: 5, author: "Brandon", text: "I agree if anyone knows where this is lmk"}
        ],
    },
    {
        id: 4,
        artoworkId: "met-435877",
        author: "Paul",
        title: "The tree in the foreground",
        text: "I like how Paul Cézanne used the depth perception of the trees in the foreground and bridge and mountains in the background",
        replies: [],
    },
    {
        id: 5,
        artworkId: "met-437750",
        author: "Brandon",
        title: "Who are the people?",
        text: "Does anyone know who the figures are? It looks like a whole story is happeneing under that portico",
        replies: [],
    },
];
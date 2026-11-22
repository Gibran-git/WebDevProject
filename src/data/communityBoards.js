// This holds the local data for the community boards. The members and their boards are placeholders for other users

export const communityBoards = [
    {
        id: "brandon-saved",
        owner: "Brandon",
        kind: "Saved pieces",
        title: "Brandon's saved pieces",
        description: "Love big scenes with alot going on",
        artworkIds: ["met-437750"],
    },
    {
        id: "laura-colour",
        owner: "Laura",
        kind: "Collection",
        title: "Colour studies",
        description: "Paintings with a lot of colours",
        artworkIds: ["met-436535", "met-437984", "met-435877"],
    },
    {
        id: "Paul-quiet",
        owner: "Paul",
        kind: "Collection",
        title: "Quiet spaces",
        description: "I find these pieces very calming, no one in a rush",
        artworkIds: ["met-435877", "met-436535"],
    },
];

export const starterThreads = [
    {
        id: "wheat-field-brushwork",
        artworkId: "met-436535",
        author: "Laura",
        title: "How does the artist show the wind?",
        text: "The wheat and the clouds both seem to move.",
        replies: [],
    },
    {
        id: "la-berceuse-colour",
        artworkId: "met-437984",
        author: "Paul",
        title: "Which colors stand out in this portrait?",
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
        artworkId: "met-435877",
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
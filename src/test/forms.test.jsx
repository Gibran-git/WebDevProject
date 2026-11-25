import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { expect, test, vi } from "vitest";
import DiscussionThreads from "../components/DiscussionThreads.jsx";
import AccountPage from "../components/AccountPage.jsx";
import { artworks } from "../data/artworks.js";
import { BoardList } from "../components/CommunityBoards.jsx";

const sampleArt = artworks[0];

// AI-assisted - see AI-USAGE.md #10
test("DiscussionThreads validates empty inputs and submits a new thread", async() => {
    const user = userEvent.setup();
    const onAddThread = vi.fn();

    render(
        <DiscussionThreads
            artworkId={sampleArt.id}
            threads={[]}
            onAddThread={onAddThread}
            onAddReply={vi.fn()}
            onEditThread={vi.fn()}
            onDeleteThread={vi.fn()}
            onEditReply={vi.fn()}
            onDeleteReply={vi.fn()}
        />
    );
    //Empty form 
    await user.click(screen.getByRole("button", {name: "Start thread" }));
    expect(screen.getByRole("alert"). textContent).toMatch(/please enter a title and message/i);
    expect(onAddThread).not.toHaveBeenCalled();

    //Valid submission 
    await user.type(screen.getByLabelText("Title"), "Brushwork details");
    await user.type(screen.getByLabelText("Message"), "Love the texture in the sky.");
    await user.click(screen.getByRole("button", { name: "Start thread" }));

    expect(onAddThread).toHaveBeenCalledWith(sampleArt.id, "Brushwork details", "Love the texture in the sky.");
    expect(screen.getByLabelText("Title").value).toBe("");
    });

    // AI-assisted - see AI-USAGE.md #10
    test("BoardForm validates title and artwork selection, then saves to a new board", async() => {
        const user = userEvent.setup();
        const onSaveBoard = vi.fn();

        render(
            <MemoryRouter initialEntries={["/account"]}>
            <AccountPage
                savedArtworks={[sampleArt]}
                savedIds={[sampleArt.id]}
                myBoards={[]}
                onSaveBoard={onSaveBoard}
                onDeleteBoard={vi.fn()}
                onToggleSave={vi.fn()}
                onSearchArtworks={vi.fn()}
            />
        </MemoryRouter>
    );
   await user.click(screen.getByRole("button", { name: "Create a board" }));

    // Missing title
    await user.click(screen.getByRole("button", { name: "Create board" }));
    expect(screen.getByRole("alert").textContent).toMatch(/give your board a title/i);

    // Missing artwork
    await user.type(screen.getByLabelText("Title"), "Impressionist Favorites");
    await user.click(screen.getByRole("button", { name: "Create board" }));
    expect(screen.getByRole("alert").textContent).toMatch(/add at least one artwork/i);

    // Pick artwork from dialog and submit
    await user.click(screen.getByRole("button", { name: "Add artwork to board" }));
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Done" }));
    await user.click(screen.getByRole("button", { name: "Create board" }));

    expect(onSaveBoard).toHaveBeenCalledWith(
        expect.objectContaining({
            title: "Impressionist Favorites",
            artworks: [sampleArt],
        })
    );


    });

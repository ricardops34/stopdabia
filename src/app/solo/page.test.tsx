import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SoloPage from "./page";

describe("SoloPage", () => {
  it("shows the setup screen with title and categories", () => {
    render(<SoloPage />);

    expect(screen.getByRole("heading", { level: 1, name: /stop/i })).toBeInTheDocument();
    expect(screen.getByText(/treino solo/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /começar/i })).toBeInTheDocument();
  });

  it("shows all 6 categories on the setup screen", () => {
    render(<SoloPage />);

    expect(screen.getByText(/nome/i)).toBeInTheDocument();
    expect(screen.getByText(/animal/i)).toBeInTheDocument();
    expect(screen.getByText(/objeto/i)).toBeInTheDocument();
    expect(screen.getByText(/comida/i)).toBeInTheDocument();
    expect(screen.getByText(/cidade/i)).toBeInTheDocument();
    expect(screen.getByText(/cor/i)).toBeInTheDocument();
  });

  it("has a back link to home", () => {
    render(<SoloPage />);

    expect(screen.getByRole("link", { name: /voltar/i })).toHaveAttribute("href", "/");
  });

  it("transitions to countdown when COMEÇAR is clicked", async () => {
    const user = userEvent.setup({ advanceTimers: () => {} });
    render(<SoloPage />);

    await user.click(screen.getByRole("button", { name: /começar/i }));

    expect(screen.queryByRole("button", { name: /começar/i })).not.toBeInTheDocument();
  });
});

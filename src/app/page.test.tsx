import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home", () => {
  it("renders the Bia STOP brand and main actions", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { level: 1, name: /bia stop/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /jogar sozinho/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /^jogar$/i }),
    ).toHaveAttribute("href", "/host");
    expect(
      screen.getByRole("link", { name: /jogar com amigos/i }),
    ).toHaveAttribute("href", "/join");
    expect(
      screen.getByRole("link", { name: /jogar sozinho/i }),
    ).toHaveAttribute("href", "/solo");
    expect(
      screen.getByRole("link", { name: /jogar com amigos/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: /arte principal do bia stop/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /arte principal do bia stop/i }))
      .toHaveAttribute("src", expect.stringContaining("inicio.png"));
  });

  it("exposes accessible navigation landmarks for quick entry", () => {
    render(<Home />);

    expect(
      screen.getByRole("link", { name: /pular para os modos de jogo/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: /modos de jogo/i }),
    ).toBeInTheDocument();
  });
});

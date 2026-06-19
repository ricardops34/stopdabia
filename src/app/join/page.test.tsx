import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import JoinPage from "./page";

describe("JoinPage", () => {
  it("shows the join room form", () => {
    render(<JoinPage />);

    expect(screen.getByRole("heading", { level: 1, name: /entrar/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/como quer ser chamado/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /entrar na sala/i })).toBeInTheDocument();
  });

  it("renders 6 code input boxes", () => {
    render(<JoinPage />);

    const inputs = screen.getAllByRole("textbox");
    const codeInputs = inputs.filter((el) => (el as HTMLInputElement).maxLength === 1);
    expect(codeInputs).toHaveLength(6);
  });

  it("disables join button until code and name are filled", async () => {
    const user = userEvent.setup();
    render(<JoinPage />);

    const btn = screen.getByRole("button", { name: /entrar na sala/i });
    expect(btn).toBeDisabled();

    await user.type(screen.getByPlaceholderText(/como quer ser chamado/i), "Bia");
    expect(btn).toBeDisabled();
  });

  it("has a back link to home", () => {
    render(<JoinPage />);
    expect(screen.getByRole("link", { name: /voltar/i })).toHaveAttribute("href", "/");
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HostPage from "./page";

describe("HostPage", () => {
  it("shows the create room form", () => {
    render(<HostPage />);

    expect(screen.getByRole("heading", { level: 1, name: /criar sala/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/como quer ser chamado/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /criar sala/i })).toBeInTheDocument();
  });

  it("shows all 8 categories", () => {
    render(<HostPage />);

    expect(screen.getByRole("button", { name: /nome/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /animal/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /objeto/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /comida/i })).toBeInTheDocument();
  });

  it("disables the start button until name is filled", async () => {
    const user = userEvent.setup();
    render(<HostPage />);

    const btn = screen.getByRole("button", { name: /criar sala/i });
    expect(btn).toBeDisabled();

    await user.type(screen.getByPlaceholderText(/como quer ser chamado/i), "Bia");
    expect(btn).not.toBeDisabled();
  });

  it("has a back link to home", () => {
    render(<HostPage />);
    expect(screen.getByRole("link", { name: /voltar/i })).toHaveAttribute("href", "/");
  });
});

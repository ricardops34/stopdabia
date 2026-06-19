import { render, screen } from "@testing-library/react";
import JoinPage from "./page";

describe("JoinPage", () => {
  it("shows the join room placeholder", () => {
    render(<JoinPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: /entrar na sala/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/digitar o codigo/i)).toBeInTheDocument();
  });
});

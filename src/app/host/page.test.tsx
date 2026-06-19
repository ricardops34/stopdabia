import { render, screen } from "@testing-library/react";
import HostPage from "./page";

describe("HostPage", () => {
  it("shows the create room placeholder", () => {
    render(<HostPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: /criar sala/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/fluxo inicial do host/i)).toBeInTheDocument();
  });
});

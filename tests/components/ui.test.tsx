import { describe, test, expect, afterEach, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { CountUp } from "@/components/ui/CountUp";
import { Stepper } from "@/components/ui/Stepper";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function stubReducedMotion(matches: boolean) {
  vi.stubGlobal("matchMedia", (q: string) => ({
    matches: q.includes("prefers-reduced-motion") ? matches : false,
    media: q,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

describe("CountUp", () => {
  test("shows the final value immediately when reduced motion is preferred", () => {
    stubReducedMotion(true);
    const { container } = render(<CountUp value={42} />);
    expect(container.textContent).toBe("42");
  });
});

describe("Stepper", () => {
  test("marks earlier phases complete, the current phase current, later phases upcoming", () => {
    stubReducedMotion(true);
    const { container } = render(
      <Stepper phases={["One", "Two", "Three", "Four"]} current={3} gates={{ 1: "go", 2: "go_with_conditions" }} />,
    );
    const states = [...container.querySelectorAll("li")].map((li) => li.getAttribute("data-state"));
    expect(states).toEqual(["complete", "complete", "current", "upcoming"]);
  });
  test("exposes the gate decision of a phase", () => {
    stubReducedMotion(true);
    const { container } = render(<Stepper phases={["One", "Two"]} current={2} gates={{ 1: "stop" }} />);
    expect(container.querySelector("li")?.getAttribute("data-gate")).toBe("stop");
  });
});

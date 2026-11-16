import { describe, test, expect, afterEach, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { KpiStrip } from "@/components/portfolio/KpiStrip";
import { MajorRisks } from "@/components/portfolio/MajorRisks";

afterEach(() => cleanup());
vi.stubGlobal("matchMedia", (q: string) => ({
  matches: q.includes("reduced-motion"),
  media: q,
  addEventListener: () => {},
  removeEventListener: () => {},
}));

describe("KpiStrip", () => {
  test("exposes each KPI value", () => {
    const { container } = render(<KpiStrip hospitals={2} gatesPending={7} openRisks={3} overdueDependencies={1} />);
    const get = (id: string) => container.querySelector(`[data-testid="${id}"]`)?.getAttribute("data-value");
    expect([get("kpi-hospitals"), get("kpi-gates"), get("kpi-risks"), get("kpi-overdue")]).toEqual(["2", "7", "3", "1"]);
  });
  test("renders zeros without crashing", () => {
    const { container } = render(<KpiStrip hospitals={0} gatesPending={0} openRisks={0} overdueDependencies={0} />);
    expect(container.querySelectorAll("[data-value='0']").length).toBe(4);
  });
});

describe("MajorRisks", () => {
  test("shows an empty state when there are no major risks", () => {
    const { container } = render(<MajorRisks risks={[]} />);
    expect(container.textContent).toContain("No major risks");
  });
  test("lists critical risks before high ones", () => {
    const { container } = render(
      <MajorRisks
        risks={[
          { id: "1", title: "High one", severity: "high", project: "H1" },
          { id: "2", title: "Critical one", severity: "critical", project: "H2" },
        ]}
      />,
    );
    const items = [...container.querySelectorAll("li")].map((li) => li.textContent ?? "");
    expect(items[0]).toContain("Critical one");
    expect(items[1]).toContain("High one");
  });
});

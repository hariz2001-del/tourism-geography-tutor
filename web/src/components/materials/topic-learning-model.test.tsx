import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { PublishedContentUnit } from "@/lib/course-brain/types";
import TopicLearningModel, { integratedTopicUnitIds, topicModelUnitIds } from "./topic-learning-model";

const pushPullTopicId = "c8cb74d2-3ca2-4b46-8a48-5e2e22b58426";
const formsTopicId = "254db3b5-6355-49b0-8435-fc4ab3dcd4ba";

function unit(id: string, topicId: string, title: string, body: string, pageOrSlide: number): PublishedContentUnit {
  return {
    id,
    topicId,
    title,
    body,
    contentType: "definition",
    citation: { sourceFile: "chapter-1-candidate-a.pdf", chapterLabel: "Chapter 1", pageOrSlide },
  };
}

const pushPullUnits = [
  unit("68fb52c1-6420-4e3b-917f-dedc31108e5a", pushPullTopicId, "Push and pull relationship", "Push factors encourage tourists to leave while pull factors match their motivations.", 17),
  unit("b64ba9e3-b0a5-40b5-9b59-2cb8ebccfd6f", pushPullTopicId, "Push factors in generating areas", "Push factors begin in the generating area.", 18),
  unit("132c9f68-2e16-430e-b7eb-4ab458b6408b", pushPullTopicId, "Pull factors in destination areas", "Pull factors include attractions and amenities.", 19),
  unit("c403af77-976f-4270-b218-ee724aec10ff", pushPullTopicId, "The Push-Pull Model", "The model compares both sides. Push factors: escape, rest and relaxation, and health and fitness. Pull factors: scenic beauty, cultural attractions and events, and shopping.", 20),
];

const formsUnits = [
  unit("ec537a47-6ab6-43b2-8858-f4ba52f37108", formsTopicId, "Domestic tourism", "Domestic tourism stays within the traveller's own country.", 25),
  unit("05319d3a-482d-4e50-a956-d3ac86458d25", formsTopicId, "International tourism", "International tourism crosses into another country.", 25),
  unit("c020c1b6-9695-4ca0-92a6-09f62bdb228f", formsTopicId, "Inbound tourism", "Non-residents travel in a given country.", 25),
  unit("641ede37-cc81-4a9b-9d8e-6579d33135db", formsTopicId, "Outbound tourism", "Residents travel abroad to other countries.", 25),
];

describe("TopicLearningModel", () => {
  it("renders push and pull as an integrated native comparison table", () => {
    render(<TopicLearningModel topicId={pushPullTopicId} units={pushPullUnits} />);

    expect(screen.getByRole("heading", { name: "Push starts the journey. Pull shapes the destination choice." })).toBeVisible();
    expect(screen.getByRole("table", { name: "Push factors compared with pull factors" })).toBeVisible();
    expect(screen.getByText("rest and relaxation")).toBeVisible();
    expect(screen.getByText("cultural attractions and events")).toBeVisible();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(document.querySelector("#unit-c403af77-976f-4270-b218-ee724aec10ff")).toBeInTheDocument();
  });

  it("combines all four tourism definitions into one responsive native model", () => {
    render(<TopicLearningModel topicId={formsTopicId} units={formsUnits} />);

    expect(screen.getByRole("heading", { name: "Forms of tourism from one country's viewpoint" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Domestic tourism" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "International tourism" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Inbound tourism" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Outbound tourism" })).toBeVisible();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText(/domestic stays inside; outbound leaves; inbound arrives/i)).toBeVisible();
  });

  it("does not hide ordinary units when a required model unit is missing", () => {
    const incomplete = formsUnits.slice(0, -1);
    expect(integratedTopicUnitIds(formsTopicId, incomplete)).toEqual(new Set());
  });
});

const middleLatitudeTopicId = "343da11d-e89d-485c-9024-c8bba3d5f042";

// Verbatim from the published row: the parse is only trustworthy if it is tested
// against the exact string the database serves, not a convenient paraphrase.
const midLatitudeTableBody =
  "The Mid-Latitude Climates table compares two sub-types. Humid Continental: latitude range 30 to 55 N and S, to 60 N in Europe; world location north central North America, north central Asia (China), Korea, Japan, and central and eastern Europe; vegetation mixed coniferous and deciduous forest; warm summers, cold winters, and moderate rainfall throughout the year. Marine-West Coast: latitude range 30 to 60 N and S; world location west coast of N. America, west coast of southern Chile, and northwestern Europe; vegetation mixed coniferous and deciduous forests; cool summers, mild winters, and high rainfall year round.";

const midLatitudeUnits = [
  {
    id: "d18c0a11-7b3e-4c6f-9a52-8f1d4e2b7c30",
    topicId: middleLatitudeTopicId,
    title: "Mid-latitude climates compared",
    body: midLatitudeTableBody,
    contentType: "explanation",
    citation: { sourceFile: "chapter-2.pdf", chapterLabel: "Chapter 2", pageOrSlide: 18 },
  } satisfies PublishedContentUnit,
];

describe("MidLatitudeComparison", () => {
  it("renders the source table as a native comparison, with cells parsed out of the stored body", () => {
    render(<TopicLearningModel topicId={middleLatitudeTopicId} units={midLatitudeUnits} />);

    expect(screen.getByRole("columnheader", { name: "Humid Continental" })).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "Marine-West Coast" })).toBeVisible();
    for (const label of ["Latitude range", "World location", "Vegetation", "Seasons / rainfall"]) {
      expect(screen.getByRole("rowheader", { name: label })).toBeVisible();
    }
    expect(screen.getByRole("cell", { name: "30 to 55 N and S, to 60 N in Europe" })).toBeVisible();
    expect(screen.getByRole("cell", { name: "cool summers, mild winters, and high rainfall year round" })).toBeVisible();
    expect(screen.getByRole("cell", { name: "west coast of N. America, west coast of southern Chile, and northwestern Europe" })).toBeVisible();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("falls back to the prose body rather than a broken table if the wording changes", () => {
    const reworded = [{ ...midLatitudeUnits[0], body: "The table compares two sub-types of mid-latitude climate." }];
    render(<TopicLearningModel topicId={middleLatitudeTopicId} units={reworded} />);

    expect(screen.getByText("The table compares two sub-types of mid-latitude climate.")).toBeVisible();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("is a trailing model, so the page renders it after the ordinary cards", () => {
    expect(topicModelUnitIds("trailing", middleLatitudeTopicId, midLatitudeUnits)).toEqual(
      new Set(["d18c0a11-7b3e-4c6f-9a52-8f1d4e2b7c30"]),
    );
    expect(topicModelUnitIds("leading", middleLatitudeTopicId, midLatitudeUnits)).toEqual(new Set());
    expect(topicModelUnitIds("trailing", pushPullTopicId, pushPullUnits)).toEqual(new Set());
  });
});

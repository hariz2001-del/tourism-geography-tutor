#!/usr/bin/env python3
"""Generate a concise, non-leaking CH2 draft question bank.

Each MCQ is tied to one source unit.  Short topics are deliberately not padded
with near-duplicate variants: the delivery layer shuffles across the bank.
Written questions award marks only for facts, never for repeating a label that
already appears in the question.
"""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data" / "extracted" / "ch2_published_source_units.json"
OUTPUT = ROOT / "data" / "extracted" / "draft_exam_questions_ch2_bank.json"


# Compact source-faithful fact cues for written marking.  They intentionally
# avoid copying the full source paragraph into the grading scheme.
FACTS = {
    "Deciduous forest": (["broad-leafed trees", "lose leaves in fall"], ["broadleaf trees", "shed leaves"]),
    "Evergreen forest": (["keep leaves year-round", "needles or broad leaves"], ["retain leaves", "leaves all year"]),
    "Humid continental climate": (["four distinct seasons", "long cold winters"], ["short warm summers", "moderate rainfall"]),
    "Humid subtropical climate": (["hot humid summers", "mild humid winters"], ["heavy thunderstorms", "forest"]),
    "Marine west coast climate": (["cool summers", "mild damp winters"], ["plenty of rainfall", "west coast"]),
    "Mediterranean climate": (["mild winters", "hot summers"], ["California", "Greece", "Italy"]),
    "Middle latitude climates": (["usually temperate", "not extreme"], ["not tropical", "not high-latitude"]),
    "Mixed forest": (["broad-leafed trees", "evergreen trees"], ["combination", "Georgia"]),
    "Highland climate and elevation": (["temperature decreases with elevation", "vegetation decreases with elevation"], ["treeline", "mountain base resembles surrounding area"]),
    "Highland climate examples": (["Scandinavian countries", "Norway"], ["Sweden", "Iceland"]),
    "Africa": (["second-largest continent", "Sahara"], ["Nile", "30.37 million km"]),
    "Antarctica": (["windiest continent", "driest continent"], ["research laboratories", "no permanent residents"]),
    "Asia": (["largest continent", "Mount Everest"], ["44.58 million km", "highest peak"]),
    "Australia": (["smallest continent", "lowest and flattest"], ["one of the driest", "7.692 million km"]),
    "Define a continent": (["large continuous land mass", "surrounding discrete islands"], ["land mass", "islands"]),
    "Europe": (["sixth-largest continent", "water on three sides"], ["10.18 million km", "surrounded by water"]),
    "North America": (["third-largest continent", "Cascade Range"], ["young mountains", "24.71 million km"]),
    "South America": (["Isthmus of Panama", "Andes"], ["connected to North America", "longest continental mountain range"]),
    "The seven continents": (["Asia", "Africa"], ["North America", "South America", "Europe", "Antarctica", "Australia"]),
    "Arid climate features": (["less than 10 inches of precipitation", "sunny and hot"], ["deserts", "oasis"]),
    "Dry climates": (["low rainfall", "temperatures vary greatly"], ["arid means dry", "dry"]),
    "Semiarid climate features": (["10–20 inches of precipitation", "hot summers and cold winters"], ["steppe vegetation", "bordering deserts"]),
    "Climate zones by latitude": (["bands by latitude", "tropics have wet and dry seasons"], ["mid-latitudes have four seasons", "polar day and polar night"]),
    "The five major climate types": (["tropical", "dry"], ["middle latitude", "high latitude", "highland"]),
    "High-latitude climates": (["furthest from the equator", "coldest climates"], ["coldest on Earth", "far from equator"]),
    "Ice cap climate": (["below freezing year-round", "permanently covered in snow and ice"], ["Antarctica", "Greenland"]),
    "Subarctic climate": (["long cold winters", "short mild summers"], ["low precipitation", "cold winters"]),
    "Tundra climate": (["cold all year", "permafrost"], ["short cool summers", "low precipitation"]),
    "Arctic Ocean": (["smallest major ocean", "least accessible"], ["least studied", "smallest"]),
    "Atlantic Ocean": (["second-largest ocean", "about 25% of Earth’s surface"], ["aquatic life", "oil and gas"]),
    "Continents and their surrounding oceans": (["seven continents", "five oceans"], ["connected picture", "surround them"]),
    "Define an ocean": (["large body of salt water", "surrounding continental land masses"], ["salt water", "continents"]),
    "Indian Ocean": (["third-largest ocean", "warmest major ocean"], ["about 70 million km", "warmest"]),
    "Pacific Ocean": (["largest ocean", "deepest ocean"], ["Challenger Deep", "deepest known point"]),
    "Summer monsoon": (["blows over water", "brings moisture"], ["over water", "moisture"]),
    "Tropical climate conditions": (["lowest latitudes", "closest to the equator"], ["near equator", "low latitudes"]),
    "Tropical humid climate features": (["warm and rainy year-round", "along the equator"], ["about 80 degrees", "rain forests"]),
    "Tropical wet-and-dry climate features": (["distinct wet and dry seasons", "very wet summer"], ["very dry winter", "grasses and few trees"]),
    "Winter monsoon": (["blows over land", "dry"], ["over land", "dry conditions"]),
}


def citation(unit: dict) -> dict:
    ref = unit["source_references"]
    return {"source_file": ref["source_file"], "chapter_label": ref["chapter_label"], "page_or_slide": ref["page_or_slide"]}


def base(unit: dict, question: str, question_type: str) -> dict:
    return {"bank_id": f"ch2-{unit['topic_id'][:8]}", "variant": "source-grounded", "chapter_code": "CH2",
            "topic_name": unit["topics"]["name"], "source_title": unit["title"], "source_content_unit_id": unit["id"],
            "source_citation": citation(unit), "question_type": question_type, "question": question,
            "difficulty": "introductory" if question_type == "mcq" else "application", "status": "draft",
            "generated_by": "deepseek_draft", "explanation": "AI-generated draft; requires lecturer review before publication."}


def description_without_answer(unit: dict) -> str:
    """Remove the source label from the clue so an MCQ never gives its answer away."""
    body = unit["body"].strip()
    title = unit["title"].strip()
    body = re.sub(re.escape(title), "", body, flags=re.IGNORECASE).strip(" —–:-. ")
    # Several labels use singular/plural wording different from the source lead.
    body = re.sub(r"^(Evergreens?|[A-Z][A-Za-z -]* climates?)\s*[—–:-]\s*", "", body).strip()
    return body or "It is described in the cited course unit."


def mcq_options(unit: dict, topic_units: list[dict]) -> list[dict]:
    others = [other["title"] for other in topic_units if other["id"] != unit["id"]]
    fallbacks = ["Pacific Ocean", "Asia", "Tropical climate conditions"]
    labels = [unit["title"], *others, *fallbacks]
    unique = list(dict.fromkeys(labels))[:4]
    return [{"text": label, "is_correct": label == unit["title"]} for label in unique]


def build(units: list[dict]) -> list[dict]:
    by_topic: dict[str, list[dict]] = {}
    for unit in units:
        by_topic.setdefault(unit["topics"]["name"], []).append(unit)
    result: list[dict] = []
    for topic_units in by_topic.values():
        # One MCQ per distinct source unit avoids weak duplicate sets in short topics.
        for unit in topic_units:
            item = base(unit, f"Which course item is described here? {description_without_answer(unit)}", "mcq")
            item["options"] = mcq_options(unit, topic_units)
            result.append(item)
        # A smaller written pool remains sufficient for the mixed assessment modes.
        for unit in topic_units[:min(6, len(topic_units))]:
            concepts, synonyms = FACTS[unit["title"]]
            item = base(unit, f"Using the course material, state two supported facts about {unit['title']}.", "subjective")
            item.update({"answer_scheme": "Award one mark for each distinct supported fact; do not award a mark merely for repeating the term in the question.",
                         "max_marks": 2,
                         "criteria": [
                             {"criterion": "States one supported fact from the cited unit", "marks": 1,
                              "accepted_concepts": concepts[:1], "accepted_synonyms": synonyms[:2]},
                             {"criterion": "States a second supported fact from the cited unit", "marks": 1,
                              "accepted_concepts": concepts[1:], "accepted_synonyms": synonyms[2:]},
                         ]})
            result.append(item)
    return result


def main() -> None:
    units = json.loads(SOURCE.read_text(encoding="utf-8-sig"))
    records = build(units)
    OUTPUT.write_text(json.dumps(records, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(records)} CH2 draft questions ({sum(x['question_type'] == 'mcq' for x in records)} MCQ) to {OUTPUT}")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Naturalize learner-facing exam language without changing sourced facts.

The ignored review fixtures remain useful as the local authoring source. This
script rewrites those fixtures and emits a versioned manifest that can be
applied to the live bank by ``apply_question_language_rewrite.py``.
"""

from __future__ import annotations

import argparse
import copy
import json
import re
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
FIXTURES = (
    ROOT / "data/extracted/draft_exam_questions_ch1_leisure_bank.json",
    ROOT / "data/extracted/draft_exam_questions_ch1_remaining_bank.json",
    ROOT / "data/extracted/draft_exam_questions_ch2_bank.json",
    ROOT / "data/extracted/draft_exam_questions_ch3_bank.json",
    ROOT / "data/extracted/draft_exam_questions_ch4_banks.json",
)
MANIFEST = ROOT / "data/question-language-rewrite-2026-08-16.json"


QUESTION_REWRITES = {
    # Chapter 1: leisure, recreation, and tourism.
    "According to the course material, leisure is time remaining after which set of commitments?":
        "What commitments must be completed before a person's remaining time is considered leisure?",
    "Which pair is used in the course material as examples of recreation?":
        "Which pair are examples of recreation?",
    "What is the maximum duration stated for tourism outside a person's usual environment?":
        "What is the maximum duration of a tourism stay outside a person's usual environment?",
    "Define leisure using the course material and name the commitments from which this time remains free.":
        "Define leisure and name the commitments from which this time remains free.",
    "Explain how recreation relates to leisure and give two examples from the course material.":
        "Explain how recreation relates to leisure and give two examples.",
    "The course material describes leisure as often being a measure of what?":
        "What is leisure often used to measure?",
    "Which purpose is explicitly included in the course definition of tourism?":
        "Which purpose is included in the definition of tourism?",
    "What effect of recreation is stated in the course material?":
        "What effect can recreation have on a person's strength and spirit?",
    "State three features of tourism in the course definition.":
        "State three defining features of tourism.",
    "A person has time available after work, sleep, and household chores and can use it as they wish. What term does the course material use for this time?":
        "A person has time available after work, sleep, and household chores and can use it as they wish. What is this time called?",
    "Which condition is necessary in the course definition of tourism?":
        "Which condition is necessary for an activity to be considered tourism?",
    "In the course material, recreation is best described as:":
        "Which statement best describes recreation?",
    "Explain whether a stay outside a person's usual environment for business can fit the course definition of tourism. Support your answer with the relevant conditions.":
        "Can a business stay outside a person's usual environment be considered tourism? Explain using the relevant conditions.",
    # Chapter 1: remaining topics.
    "State two features of international tourism in the course material.":
        "State two features of international tourism.",
    "Using the course definition, explain why a resident taking a holiday within their own country is an example of domestic tourism.":
        "Explain why a resident taking a holiday within their own country is an example of domestic tourism.",
    "According to the course material, state one accommodation function and one entertainment function supplied by a tourist destination.":
        "State one accommodation function and one entertainment function supplied by a tourist destination.",
    "Which world condition is explicitly listed as relevant to tourism geography?":
        "Which world condition is relevant to tourism geography?",
    "State two things geography studies or helps learners understand according to the course material.":
        "State two things that geography studies or helps people understand.",
    "State one world condition that geography helps tourism learners recognise and one tourism-related career benefit given in the course material.":
        "State one world condition relevant to tourism geography and one career benefit of studying it.",
    "How many main types of tourist-flow measurement are stated?":
        "How many main types of tourist-flow measurement are there?",
    "Which is listed as a destination pull factor?":
        "Which is a destination pull factor?",
    "Which is listed as a push factor in the Push-Pull Model?":
        "Which is a push factor in the Push-Pull Model?",
    "In the Push-Pull Model, identify the listed push factor concerning rest and the listed pull factor concerning coastlines.":
        "In the Push-Pull Model, identify the push factor concerning rest and the pull factor concerning coastlines.",
    "Which is listed as a tourism product type?":
        "Which is a type of tourism product?",
    "How does the course material define grey tourism, and name one reason this segment may have travel opportunity?":
        "Define grey tourism and give one reason this group may have opportunities to travel.",
    "A journey covers 3,500 kilometres. Using the course material, identify its travel-distance category and give the threshold that supports your answer.":
        "A journey covers 3,500 kilometres. Identify its travel-distance category and state the threshold that supports your answer.",
    "What general point does the course make about geographical components and forms of tourism?":
        "How can geographical components influence the different forms of tourism?",
    "Define an inclusive tour using the course material.":
        "Define an inclusive tour.",
    # Chapter 3.
    "Which position relative to the Sun is given for Earth in the course material?":
        "Which position does Earth occupy relative to the Sun?",
    "Which list contains only continents named in the lithosphere unit?":
        "Which list contains only continents?",
    "Define the biosphere using the course material.":
        "Define the biosphere.",
    "According to the unit, Earth is which size rank among the planets?":
        "What is Earth's size rank among the planets?",
    "How many oceans are listed as divisions of the hydrosphere?":
        "How many oceans make up the hydrosphere?",
    "Which north-to-south diameter is stated for the Equator?":
        "What is Earth's north-to-south diameter at the Equator?",
    "Name any three oceans listed in the hydrosphere unit.":
        "Name any three oceans.",
    "What does the course material say makes Earth unique among planets?":
        "What makes Earth unique among the planets?",
    "Compare the two Equator diameter figures given in the course material.":
        "Compare Earth's east-to-west and north-to-south diameter figures at the Equator.",
    "Name any three continents listed in the lithosphere unit.":
        "Name any three continents.",
    "Use the course relationship to state the time difference for 30° of longitude.":
        "What time difference corresponds to 30° of longitude?",
    "Which is one of the five principal latitude lines listed?":
        "Which is one of the five principal lines of latitude?",
    "Explain GMT’s role in world timekeeping according to the course material.":
        "Explain the role of Greenwich Mean Time (GMT) in world timekeeping.",
    "How long does one degree of longitude take according to the course calculation?":
        "How long does Earth take to rotate through one degree of longitude?",
    "Name any three of the five principal latitude lines listed in the course material.":
        "Name any three of the five principal lines of latitude.",
    "Show how the course material derives the four-minutes-per-degree relationship.":
        "Show how the four-minutes-per-degree relationship is calculated.",
    # Chapter 4.
    "What does nature-based tourism involve according to the course material?":
        "What does nature-based tourism involve?",
    "Which item is listed as a natural resource for nature-based tourism?":
        "Which is a natural resource used in nature-based tourism?",
    "What does the course state about unused tourism resources?":
        "What happens to an unused tourism resource?",
    "Describe the perishable feature of tourism resources using two points from the course.":
        "Describe two ways in which a tourism resource can be perishable.",
    "Which is a natural attraction example in the course?":
        "Which is an example of a natural attraction?",
    "Define a tourist attraction and give one ambient and one location-specific example from the course.":
        "Define a tourist attraction and give one ambient and one location-specific example.",
    "Classify a museum and a historic castle using the course categories, with a reason for each.":
        "Classify a museum and a historic castle into the four attraction categories, giving a reason for each.",
    "Which is a reason tourists are drawn to mountains in the course?":
        "Why are tourists drawn to mountains?",
    "Where is Mount Kinabalu located in the course case study?":
        "Where is Mount Kinabalu located?",
    "Which mountain is listed as the highest in the course table?":
        "Which is the world's highest mountain?",
    "What average annual precipitation threshold defines a desert in the course?":
        "What average annual precipitation threshold defines a desert?",
    "Define a natural landscape using both conditions in the course.":
        "Define a natural landscape using both defining conditions.",
    "Give three reasons from the course why mountains attract tourists.":
        "Give three reasons why mountains attract tourists.",
    "Define a plateau using the course description.":
        "Define a plateau.",
    "Describe the Antarctic Plateau using three details from the course.":
        "Describe the Antarctic Plateau using three characteristics.",
    "Explain why deserts have hostile living conditions according to the course definition.":
        "Explain why deserts have hostile living conditions.",
    "What is an ocean according to the course?":
        "What is an ocean?",
    "Towards which destination can a river flow according to the course?":
        "Where can a river flow?",
    "Define a lake using the course description.":
        "Define a lake.",
    "Define an atoll using the course description.":
        "Define an atoll.",
    "Define a fiord using the course description.":
        "Define a fiord.",
}


CH2_MCQ_REWRITES: dict[str, tuple[str, list[str]]] = {
    "Deciduous forest": ("Which forest type has broad-leafed trees that lose their leaves in the fall?", ["Deciduous forest", "Evergreen forest", "Mixed forest", "Rain forest"]),
    "Evergreen forest": ("Which forest type keeps its needles or broad leaves throughout the year?", ["Evergreen forest", "Deciduous forest", "Mixed forest", "Tundra vegetation"]),
    "Humid continental climate": ("Which climate has four distinct seasons, long cold winters, short warm summers, and moderate rainfall?", ["Humid continental climate", "Humid subtropical climate", "Marine west coast climate", "Mediterranean climate"]),
    "Humid subtropical climate": ("Which climate has hot, humid summers with heavy thunderstorms and mild, humid winters?", ["Humid subtropical climate", "Humid continental climate", "Marine west coast climate", "Mediterranean climate"]),
    "Marine west coast climate": ("Which climate occurs on western continental coasts, with cool summers, mild damp winters, and high rainfall throughout the year?", ["Marine west coast climate", "Mediterranean climate", "Humid continental climate", "Humid subtropical climate"]),
    "Mediterranean climate": ("Which climate has mild winters and hot summers in places such as California, Greece, and Italy?", ["Mediterranean climate", "Marine west coast climate", "Humid subtropical climate", "Humid continental climate"]),
    "Middle latitude climates": ("Which climate group is generally temperate and avoids the extremes of tropical and high-latitude climates?", ["Middle latitude climates", "Tropical climates", "High-latitude climates", "Highland climates"]),
    "Mixed forest": ("Which forest type combines broad-leafed and evergreen trees, as seen in Georgia?", ["Mixed forest", "Deciduous forest", "Evergreen forest", "Rain forest"]),
    "Highland climate and elevation": ("Which climate changes with elevation as temperature and vegetation decrease toward the treeline?", ["Highland climate", "Tropical humid climate", "Mediterranean climate", "Tundra climate"]),
    "Highland climate examples": ("Which group of countries provides examples of highland climates?", ["Norway, Sweden, and Iceland", "China, Korea, and Japan", "Kenya, Uganda, and Tanzania", "Brazil, Peru, and Colombia"]),
    "Africa": ("Which continent is the second largest and is home to the Sahara and the Nile?", ["Africa", "Antarctica", "Asia", "Australia"]),
    "Antarctica": ("Which continent is the windiest and driest and has no permanent residents?", ["Antarctica", "Africa", "Asia", "Australia"]),
    "Asia": ("Which continent is the largest and is home to Mount Everest?", ["Asia", "Africa", "Antarctica", "Australia"]),
    "Australia": ("Which continent is the smallest, lowest, flattest, and one of the driest?", ["Australia", "Africa", "Antarctica", "Asia"]),
    "Define a continent": ("What is a large, continuous land mass that includes surrounding islands called?", ["A continent", "An ocean", "An island", "A plateau"]),
    "Europe": ("Which continent is the sixth largest and is surrounded by water on three sides?", ["Europe", "Africa", "Antarctica", "Asia"]),
    "North America": ("Which continent is the third largest and contains the Cascade Range?", ["North America", "Africa", "Antarctica", "Asia"]),
    "South America": ("Which continent is connected to North America by the Isthmus of Panama and contains the Andes?", ["South America", "Africa", "Antarctica", "Asia"]),
    "The seven continents": ("How many continents are identified in the standard world map?", ["Seven", "Four", "Five", "Six"]),
    "Arid climate features": ("Which climate is sunny and hot, receives less than 10 inches of precipitation a year, and is associated with deserts and oases?", ["Arid climate", "Semiarid climate", "Tundra climate", "Mediterranean climate"]),
    "Dry climates": ("Which climate group has low rainfall but can have widely varying temperatures?", ["Dry climates", "Tropical climates", "Middle latitude climates", "High-latitude climates"]),
    "Semiarid climate features": ("Which climate receives about 10–20 inches of precipitation a year and supports steppe vegetation?", ["Semiarid climate", "Arid climate", "Humid subtropical climate", "Tundra climate"]),
    "Climate zones by latitude": ("What primarily determines the broad bands of global climate zones?", ["Latitude", "Elevation", "Longitude", "Distance from the coast"]),
    "The five major climate types": ("Which list names the five major climate types?", ["Tropical, dry, middle latitude, high latitude, and highland", "Tropical, polar, coastal, desert, and monsoon", "Arid, oceanic, equatorial, continental, and island", "Wet, dry, warm, cool, and seasonal"]),
    "High-latitude climates": ("Which climate group lies furthest from the Equator and is usually the coldest on Earth?", ["High-latitude climates", "Tropical climates", "Middle latitude climates", "Highland climates"]),
    "Ice cap climate": ("Which climate stays below freezing year-round and is permanently covered in snow and ice?", ["Ice cap climate", "Subarctic climate", "Tundra climate", "Highland climate"]),
    "Subarctic climate": ("Which climate has long cold winters, short mild summers, and low precipitation?", ["Subarctic climate", "Ice cap climate", "Tundra climate", "Mediterranean climate"]),
    "Tundra climate": ("Which climate is cold all year, has short cool summers, and features permafrost?", ["Tundra climate", "Subarctic climate", "Ice cap climate", "Humid continental climate"]),
    "Arctic Ocean": ("Which ocean is the smallest, least accessible, and least studied of the major oceans?", ["Arctic Ocean", "Atlantic Ocean", "Indian Ocean", "Pacific Ocean"]),
    "Atlantic Ocean": ("Which ocean is the second largest, covers about 25% of Earth's surface, and is rich in aquatic life, oil, and gas?", ["Atlantic Ocean", "Arctic Ocean", "Indian Ocean", "Pacific Ocean"]),
    "Continents and their surrounding oceans": ("Which statement best describes the relationship between continents and oceans?", ["Oceans surround the continental land masses", "Continents occur only within oceans", "Every continent is surrounded by one ocean", "Oceans do not affect world geography"]),
    "Define an ocean": ("What is a large body of salt water surrounding continental land masses called?", ["An ocean", "A sea", "A lake", "A river"]),
    "Indian Ocean": ("Which ocean is the third largest and warmest of the major oceans?", ["Indian Ocean", "Atlantic Ocean", "Pacific Ocean", "Arctic Ocean"]),
    "Pacific Ocean": ("Which ocean is the largest and deepest and contains the Challenger Deep?", ["Pacific Ocean", "Atlantic Ocean", "Indian Ocean", "Arctic Ocean"]),
    "Southern Ocean": ("Which ocean surrounds Antarctica and is defined by the Antarctic Circumpolar Current?", ["Southern Ocean", "Arctic Ocean", "Indian Ocean", "Atlantic Ocean"]),
    "The five major oceans": ("Which list names the five major oceans?", ["Pacific, Atlantic, Indian, Southern, and Arctic", "Pacific, Atlantic, Mediterranean, Caribbean, and Baltic", "Indian, Arabian, Red, Caspian, and Black", "Arctic, Southern, North, East, and West"]),
    "Summer monsoon": ("Which monsoon blows over water and brings moisture?", ["Summer monsoon", "Winter monsoon", "Land breeze", "Mountain breeze"]),
    "Tropical climate conditions": ("Where do tropical climates occur?", ["At the lowest latitudes near the Equator", "At the highest latitudes near the poles", "Only on high mountain peaks", "Only on western continental coasts"]),
    "Tropical humid climate features": ("Which climate occurs along the Equator and is warm and rainy throughout the year?", ["Tropical humid climate", "Tropical wet-and-dry climate", "Dry climate", "Mediterranean climate"]),
    "Tropical wet-and-dry climate features": ("Which climate is warm all year but has a very wet summer and a very dry winter?", ["Tropical wet-and-dry climate", "Tropical humid climate", "Subarctic climate", "Mediterranean climate"]),
    "Winter monsoon": ("Which monsoon blows over land and is dry?", ["Winter monsoon", "Summer monsoon", "Sea breeze", "Valley breeze"]),
}


CH2_SUBJECTIVE_REWRITES = {
    "Deciduous forest": "State two characteristics of a deciduous forest.",
    "Evergreen forest": "State two characteristics of an evergreen forest.",
    "Humid continental climate": "State two characteristics of a humid continental climate.",
    "Humid subtropical climate": "State two characteristics of a humid subtropical climate.",
    "Marine west coast climate": "State two characteristics of a marine west coast climate.",
    "Mediterranean climate": "State two characteristics of a Mediterranean climate.",
    "Highland climate and elevation": "Explain two ways highland climate changes as elevation increases.",
    "Highland climate examples": "Name two Scandinavian countries where highland climates occur.",
    "Africa": "State two geographical facts about Africa.",
    "Antarctica": "State two geographical facts about Antarctica.",
    "Asia": "State two geographical facts about Asia.",
    "Australia": "State two geographical facts about Australia.",
    "Define a continent": "Define a continent and state what may be included around its main land mass.",
    "Europe": "State two geographical facts about Europe.",
    "Arid climate features": "State two characteristics of an arid climate.",
    "Dry climates": "State two characteristics of dry climates.",
    "Semiarid climate features": "State two characteristics of a semiarid climate.",
    "Climate zones by latitude": "Explain two ways latitude affects climate zones or seasons.",
    "The five major climate types": "Name any two of the five major climate types.",
    "High-latitude climates": "State two characteristics of high-latitude climates.",
    "Ice cap climate": "State two characteristics of an ice cap climate.",
    "Subarctic climate": "State two characteristics of a subarctic climate.",
    "Tundra climate": "State two characteristics of a tundra climate.",
    "Arctic Ocean": "State two geographical facts about the Arctic Ocean.",
    "Atlantic Ocean": "State two geographical facts about the Atlantic Ocean.",
    "Continents and their surrounding oceans": "Explain two ways continents and their surrounding oceans are geographically connected.",
    "Define an ocean": "Define an ocean and state what it surrounds.",
    "Indian Ocean": "State two geographical facts about the Indian Ocean.",
    "Pacific Ocean": "State two geographical facts about the Pacific Ocean.",
    "Summer monsoon": "Explain how a summer monsoon forms and what it brings.",
    "Tropical climate conditions": "State two location details that describe where tropical climates occur.",
    "Tropical humid climate features": "State two characteristics of a tropical humid climate.",
    "Tropical wet-and-dry climate features": "State two characteristics of a tropical wet-and-dry climate.",
    "Winter monsoon": "Explain how a winter monsoon forms and describe its moisture.",
}


GENERIC_SCHEME = "Award one mark for each distinct, accurate fact. Repeating the term in the question does not earn a mark."
GENERIC_MCQ_EXPLANATION = "The correct option matches the geographical fact or definition being tested."
GENERIC_SUBJECTIVE_EXPLANATION = "Use the answer criteria to check the key points in your response."

LEARNER_TEXT_REWRITES = {
    "AI-generated draft; requires lecturer review before publication.": "This option best matches the definition or fact in the question.",
    "Draft requires lecturer review.": "This option best matches the definition or fact in the question.",
    "The published Leisure unit defines leisure as free time remaining after work, sleep, and household chores.": "Leisure is free time remaining after work, sleep, and household chores.",
    "The published Recreation unit gives watching television and holidaying abroad as examples.": "Watching television and holidaying abroad are examples of recreation.",
    "The published Tourism unit specifies no more than one consecutive year.": "A tourism stay outside the usual environment lasts no more than one consecutive year.",
    "The published Leisure unit says leisure is often seen as a measure of time.": "Leisure is often seen as a measure of time.",
    "The published Tourism unit includes leisure, business, and other purposes.": "Tourism may involve leisure, business, or other purposes.",
    "The published Recreation unit states that recreation refreshes a person's strength and spirit.": "Recreation can refresh a person's strength and spirit.",
    "This is the published definition of leisure.": "Leisure is the time remaining after work, sleep, and household chores.",
    "The published Tourism unit specifies travel to and a stay outside the usual environment.": "Tourism involves travel to and a stay outside a person's usual environment.",
    "The published Recreation unit defines recreation as activities undertaken during leisure time.": "Recreation consists of activities undertaken during leisure time.",
    "The unit says Earth is the third-nearest planet to the Sun.": "Earth is the third-nearest planet to the Sun.",
    "The published unit describes Earth as the 5th biggest planet.": "Earth is the fifth-largest planet.",
    "The hydrosphere unit lists five oceans.": "The hydrosphere is divided into five oceans.",
    "The unit gives 7,899.8 miles from north to south.": "Earth's north-to-south diameter is 7,899.8 miles.",
    "Oceania/Australia is one of the seven continents listed.": "Oceania/Australia is one of the seven continents.",
    "The unit states that Earth is the only planet occupied by living creatures.": "Earth is unique because it is the only planet occupied by living creatures.",
    "The unit states that latitude lines are parallels.": "Latitude lines are parallels.",
    "The unit places the International Date Line close to the 180-degree meridian.": "The International Date Line lies close to the 180-degree meridian.",
    "The unit locates the physical line at the Royal Observatory in Greenwich.": "The physical Prime Meridian line is at the Royal Observatory in Greenwich.",
    "Award up to 3 marks for identifying leisure as free time and naming the three stated commitments.": "Award up to 3 marks for defining leisure as free time and naming the three commitments.",
    "Award 1 mark each for two supported aspects.": "Award 1 mark for each of two accurate aspects.",
    "Award 1 mark for locating recreation in leisure time and 1 mark for each of the two published examples.": "Award 1 mark for relating recreation to leisure time and 1 mark for each of two accurate examples.",
    "Names a first listed ocean": "Names one ocean",
    "Names a second distinct listed ocean": "Names a second distinct ocean",
    "Names a third distinct listed ocean": "Names a third distinct ocean",
    "Names a first listed continent": "Names one continent",
    "Names a second distinct listed continent": "Names a second distinct continent",
    "Names a third distinct listed continent": "Names a third distinct continent",
    "Links both classifications to their published examples": "Links both classifications to the relevant examples",
}


def rewrite_record(record: dict[str, Any]) -> dict[str, Any]:
    result = copy.deepcopy(record)
    if result["chapter_code"] == "CH2":
        title = result["source_title"]
        if result["question_type"] == "mcq":
            question, options = CH2_MCQ_REWRITES[title]
            if len(result.get("options", [])) != len(options):
                raise ValueError(f"Unexpected option count for CH2 / {title}")
            result["question"] = question
            for option, text in zip(result["options"], options, strict=True):
                option["text"] = text
        else:
            result["question"] = CH2_SUBJECTIVE_REWRITES[title]
            result["answer_scheme"] = GENERIC_SCHEME
            for index, criterion in enumerate(result.get("criteria", []), 1):
                criterion["criterion"] = "States one accurate fact" if index == 1 else "States a second accurate fact"
    else:
        result["question"] = QUESTION_REWRITES.get(result["question"], result["question"])

    if isinstance(result.get("answer_scheme"), str):
        result["answer_scheme"] = result["answer_scheme"].replace(
            "each accurate course-grounded point", "each accurate, relevant point"
        ).replace(
            "each criterion has one distinct course answer", "each criterion requires one distinct answer"
        ).replace(
            "each is a separate named factor from the course material", "each is a separate named factor"
        )
        result["answer_scheme"] = LEARNER_TEXT_REWRITES.get(result["answer_scheme"], result["answer_scheme"])
    if isinstance(result.get("explanation"), str):
        result["explanation"] = result["explanation"].replace(
            "The course material calls longitude lines meridian lines.",
            "Longitude lines are also called meridian lines.",
        ).replace(
            "The course material says time zones radiate from the Greenwich Meridian (0 hours).",
            "Time zones radiate from the Greenwich Meridian (0 hours).",
        )
        result["explanation"] = LEARNER_TEXT_REWRITES.get(result["explanation"], result["explanation"])
    if not result.get("explanation") or result["explanation"] == "This option best matches the definition or fact in the question.":
        result["explanation"] = (
            GENERIC_MCQ_EXPLANATION
            if result["question_type"] == "mcq"
            else GENERIC_SUBJECTIVE_EXPLANATION
        )
    for criterion in result.get("criteria", []):
        criterion["criterion"] = LEARNER_TEXT_REWRITES.get(criterion["criterion"], criterion["criterion"])
    return result


def changes(before: dict[str, Any], after: dict[str, Any], fixture: Path) -> dict[str, Any] | None:
    tracked_fields = ("question", "answer_scheme", "explanation", "options", "criteria")
    delta = {field: {"before": before.get(field), "after": after.get(field)}
             for field in tracked_fields if before.get(field) != after.get(field)}
    if not delta:
        return None
    return {
        "fixture": fixture.name,
        "chapter_code": before["chapter_code"],
        "source_content_unit_id": before["source_content_unit_id"],
        "question_type": before["question_type"],
        "old_question": before["question"],
        "new_question": after["question"],
        "changes": delta,
    }


def assert_learner_language(records: list[dict[str, Any]]) -> None:
    forbidden = re.compile(r"\b(course material|course item|cited unit|course-grounded|database|published|the unit|draft|lecturer review)\b", re.I)
    for record in records:
        fields = [record.get("question", ""), record.get("answer_scheme", ""), record.get("explanation", "")]
        fields.extend(item.get("criterion", "") for item in record.get("criteria", []))
        for value in fields:
            if forbidden.search(str(value)):
                raise ValueError(f"Learner-facing meta-language remains: {value}")
    if sum(record["question_type"] == "mcq" for record in records) != 128:
        raise ValueError("Expected 128 MCQs.")
    if sum(record["question_type"] == "subjective" for record in records) != 80:
        raise ValueError("Expected 80 subjective questions.")


def merge_manifest(existing: list[dict[str, Any]], additions: list[dict[str, Any]]) -> list[dict[str, Any]]:
    merged = copy.deepcopy(existing)
    for addition in additions:
        previous = next((item for item in merged
                         if item["fixture"] == addition["fixture"]
                         and item["source_content_unit_id"] == addition["source_content_unit_id"]
                         and item["question_type"] == addition["question_type"]
                         and item["new_question"] == addition["old_question"]), None)
        if previous is None:
            merged.append(addition)
            continue
        previous["new_question"] = addition["new_question"]
        for field, delta in addition["changes"].items():
            if field in previous["changes"]:
                previous["changes"][field]["after"] = delta["after"]
            else:
                previous["changes"][field] = delta
    return merged


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply-fixtures", action="store_true")
    args = parser.parse_args()
    manifest: list[dict[str, Any]] = []
    rewritten_by_file: dict[Path, list[dict[str, Any]]] = {}
    all_records: list[dict[str, Any]] = []
    for fixture in FIXTURES:
        records = json.loads(fixture.read_text(encoding="utf-8"))
        rewritten = [rewrite_record(record) for record in records]
        rewritten_by_file[fixture] = rewritten
        all_records.extend(rewritten)
        for before, after in zip(records, rewritten, strict=True):
            change = changes(before, after, fixture)
            if change:
                manifest.append(change)
    assert_learner_language(all_records)
    print(f"Reviewed {len(all_records)} questions; {len(manifest)} records need language changes.")
    if not args.apply_fixtures:
        print("Dry run only. Use --apply-fixtures to rewrite local fixtures and emit the manifest.")
        return 0
    for fixture, records in rewritten_by_file.items():
        fixture.write_text(json.dumps(records, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    existing_manifest = json.loads(MANIFEST.read_text(encoding="utf-8")) if MANIFEST.exists() else []
    complete_manifest = merge_manifest(existing_manifest, manifest)
    MANIFEST.write_text(json.dumps(complete_manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Updated {len(rewritten_by_file)} fixtures and wrote {len(complete_manifest)} manifest entries to {MANIFEST}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

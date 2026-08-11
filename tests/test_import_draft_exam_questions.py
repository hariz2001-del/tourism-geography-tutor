import importlib.util
import json
from copy import deepcopy
from pathlib import Path

import pytest


spec = importlib.util.spec_from_file_location(
    "import_draft_exam_questions", Path("scripts/import_draft_exam_questions.py")
)
module = importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(module)

FIXTURE = Path("data/extracted/draft_exam_questions_ch1_leisure_bank.json")


def records() -> list[dict]:
    return json.loads(FIXTURE.read_text(encoding="utf-8"))


def test_shuffled_bank_fixture_allows_arbitrary_question_counts() -> None:
    bank = records()

    # This fixture has three variants and 9 MCQs / 6 subjective questions,
    # rather than the obsolete 5 / 3 chapter quota.
    module.validate(bank)


@pytest.mark.parametrize(
    ("mutate", "message"),
    [
        (lambda item: item.pop("bank_id"), "bank/variant"),
        (lambda item: item.__setitem__("source_content_unit_id", "not-a-uuid"), "source_content_unit_id"),
        (lambda item: item.__setitem__("source_citation", {"source_file": "x.pdf"}), "chapter_label"),
        (lambda item: item.__setitem__("status", "approved"), "draft"),
        (lambda item: item.__setitem__("generated_by", "human"), "deepseek_draft"),
    ],
)
def test_validate_rejects_missing_or_non_draft_bank_provenance(mutate, message: str) -> None:
    bank = deepcopy(records())
    mutate(bank[0])

    with pytest.raises(ValueError, match=message):
        module.validate(bank)


def test_validate_rejects_duplicate_question_for_the_same_source_case_insensitively() -> None:
    bank = deepcopy(records())
    duplicate = deepcopy(bank[0])
    duplicate["question"] = bank[0]["question"].upper()
    duplicate["variant"] = "D"
    bank.append(duplicate)

    with pytest.raises(ValueError, match="Duplicate draft question"):
        module.validate(bank)


def test_validate_rejects_incomplete_subjective_marking_criteria() -> None:
    bank = deepcopy(records())
    subjective = next(item for item in bank if item["question_type"] == "subjective")
    subjective["criteria"][0]["marks"] = 2

    with pytest.raises(ValueError, match="marks must equal"):
        module.validate(bank)


class FakeRestClient:
    def __init__(self, *, fail_table: str | None = None) -> None:
        self.calls: list[tuple[str, str, dict | None, object | None]] = []
        self.fail_table = fail_table
        self.created = 0

    def request(self, method, table, *, params=None, payload=None, prefer=None):
        self.calls.append((method, table, params, payload))
        if table == self.fail_table and method == "POST":
            raise RuntimeError("simulated write failure")
        if method == "GET" and table == "content_units":
            return [{"id": params["id"].removeprefix("eq."), "topic_id": "topic-1"}]
        if method == "GET" and table == "quiz_questions":
            return []
        if method == "POST" and table == "quiz_questions":
            self.created += 1
            return [{"id": f"question-{self.created}"}]
        return []


def test_rest_import_preflights_then_creates_drafts_options_and_criteria() -> None:
    bank = records()
    # Exercise both record shapes without importing the entire fixture.
    chosen = [bank[0], next(item for item in bank if item["question_type"] == "subjective")]
    client = FakeRestClient()

    assert module.apply_rest(chosen, client) == 2

    writes = [(method, table, payload) for method, table, _params, payload in client.calls if method == "POST"]
    questions = [payload for _method, table, payload in writes if table == "quiz_questions"]
    assert all(question["status"] == "draft" and question["generated_by"] == "deepseek_draft" for question in questions)
    assert any(table == "quiz_question_options" for _method, table, _payload in writes)
    assert any(table == "quiz_marking_criteria" for _method, table, _payload in writes)
    # All source and duplicate GETs happen before the first mutation.
    first_post = next(index for index, call in enumerate(client.calls) if call[0] == "POST")
    assert all(call[0] == "GET" for call in client.calls[:first_post])


def test_rest_import_rolls_back_created_drafts_after_child_write_failure() -> None:
    bank = records()
    client = FakeRestClient(fail_table="quiz_question_options")

    with pytest.raises(RuntimeError, match="simulated write failure"):
        module.apply_rest([bank[0]], client)

    deletes = [call for call in client.calls if call[0] == "DELETE" and call[1] == "quiz_questions"]
    assert deletes == [("DELETE", "quiz_questions", {"id": "eq.question-1"}, None)]


def test_ch2_replacement_calls_private_atomic_rpc_after_validation() -> None:
    bank = json.loads(Path("data/extracted/draft_exam_questions_ch2_bank.json").read_text(encoding="utf-8"))

    class ReplacementClient(FakeRestClient):
        def request(self, method, table, *, params=None, payload=None, prefer=None):
            self.calls.append((method, table, params, payload))
            if table == "rpc/replace_ch2_deepseek_draft_bank":
                return {"deleted": 80, "inserted": len(payload["p_records"])}
            raise AssertionError("The replacement path must use one private RPC call.")

    result = module.replace_ch2_rest(bank, ReplacementClient())
    assert result == {"deleted": 80, "inserted": 75}


def test_ch2_replacement_rejects_a_non_ch2_fixture() -> None:
    bank = records()
    with pytest.raises(ValueError, match="CH2 records only"):
        module.replace_ch2_rest(bank, FakeRestClient())


def test_ch4_replacement_calls_private_atomic_rpc_after_validation() -> None:
    bank = json.loads(Path("data/extracted/draft_exam_questions_ch4_banks.json").read_text(encoding="utf-8"))

    class ReplacementClient(FakeRestClient):
        def request(self, method, table, *, params=None, payload=None, prefer=None):
            self.calls.append((method, table, params, payload))
            if table == "rpc/replace_ch4_deepseek_draft_bank":
                return {"deleted": 60, "inserted": len(payload["p_records"])}
            raise AssertionError("The replacement path must use one private RPC call.")

    result = module.replace_ch4_rest(bank, ReplacementClient())
    assert result == {"deleted": 60, "inserted": 50}


def test_ch4_replacement_rejects_a_non_ch4_fixture() -> None:
    bank = records()
    with pytest.raises(ValueError, match="CH4 records only"):
        module.replace_ch4_rest(bank, FakeRestClient())


def test_ch1_replacement_calls_private_atomic_rpc_after_validation() -> None:
    leisure = json.loads(Path("data/extracted/draft_exam_questions_ch1_leisure_bank.json").read_text(encoding="utf-8"))
    remaining = json.loads(Path("data/extracted/draft_exam_questions_ch1_remaining_bank.json").read_text(encoding="utf-8"))
    bank = leisure + remaining

    class ReplacementClient(FakeRestClient):
        def request(self, method, table, *, params=None, payload=None, prefer=None):
            self.calls.append((method, table, params, payload))
            if table == "rpc/replace_ch1_deepseek_draft_bank":
                return {"deleted": 55, "inserted": len(payload["p_records"])}
            raise AssertionError("The replacement path must use one private RPC call.")

    result = module.replace_ch1_rest(bank, ReplacementClient())
    assert result == {"deleted": 55, "inserted": 53}


def test_ch1_replacement_rejects_a_non_ch1_fixture() -> None:
    bank = [{**record, "chapter_code": "CH2"} for record in records()]
    with pytest.raises(ValueError, match="CH1 records only"):
        module.replace_ch1_rest(bank, FakeRestClient())

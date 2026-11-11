# Validation of multiple choice page text: one question per line,
# "question | correct | wrong | wrong ...".
# Must stay identical to main/src/frontend/wordManagement/wordManager.ts (validateMultipleChoice).
from fastapi import HTTPException

DELIMITERS = ["\t", "    ", " | "]


def _split(line: str) -> list:
    parts = [line]
    for d in DELIMITERS:
        parts = [p for part in parts for p in part.split(d)]
    # A stray "|" at a part's edge (e.g. a trailing "a |") is not content.
    return [p.strip().strip("|").strip() for p in parts]


def validate_multiple_choice(text: str) -> list:
    """Returns (line_number, line, reason) for every invalid non-empty line."""
    errors = []
    for i, line in enumerate(text.split("\n")):
        if line.strip() == "":
            continue
        parts = _split(line)
        answers = [p for p in parts[1:] if p != ""]
        if parts[0] == "":
            reason = "add a question"
        elif len(answers) == 0:
            reason = "add a correct and a wrong answer"
        elif len(answers) == 1:
            reason = "add at least one wrong answer"
        else:
            continue
        errors.append((i + 1, line, reason))
    return errors


def raise_if_invalid_multiple_choice(text: str):
    errors = validate_multiple_choice(text)
    if errors:
        shown = "; ".join(f'Line {n} "{line.strip()}": {reason}' for n, line, reason in errors[:5])
        more = f" and {len(errors) - 5} more" if len(errors) > 5 else ""
        raise HTTPException(400, f"Invalid multiple choice lines: {shown}{more}")
    if text.strip() == "":
        raise HTTPException(400, "Add at least one question")
